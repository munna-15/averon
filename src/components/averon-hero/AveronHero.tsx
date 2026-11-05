"use client";

import gsap from "gsap";
import { useEffect, useRef, type CSSProperties } from "react";
import s from "./averon-hero.module.css";
import {
  LAST,
  REF_EASE,
  carryDelta,
  clamp,
  computeTravel,
  isOffstage,
  mayBeVisibleAt,
  panFor,
  solveLayer,
  type CarryDelta,
  type Geometry,
  type Travel,
} from "./engine";
import {
  LAYERS,
  PORTRAIT_DESIGN_ASPECT,
  REF_H,
  REF_W,
  SLIDE_COUNT,
} from "./layers";

export interface AveronHeroProps {
  /** Start on this state (0–5 = slides 01–06, 6 = newsletter). */
  initialSlide?: number;
  /** Advance automatically every N ms; omitted uses the reference-paced holds, 0 disables. */
  autoplayMs?: number;
  /** Let the mouse wheel change slides. Off by default so the hero never
   *  hijacks page scrolling on a normal website. */
  wheel?: boolean;
  className?: string;
}

const pad = (n: number) => String(n).padStart(2, "0");
const COUNTER = Array.from({ length: SLIDE_COUNT }, (_, i) => pad(i + 1));

/* ---- timing, MEASURED from the reference video (60 fps) ------------------ */
const TRANSITION_DURATION = 1.825; // T1–T5
const NEWSLETTER_DURATION = 1.522; // T6 (Lookbook → Newsletter)
const REWIND_DURATION = 2.4; // T7 (Newsletter → slide 01)
/** Hold after each state's transition has nominally ended, indexed by state. */
const AUTOPLAY_HOLDS = [0.9, 0.325, 0.292, 0.408, 0.425, 0.307, 0.895] as const;

/** Pager number swap: ~12 frames, starting ~7 frames after the transition starts. */
const COUNTER_SWAP = 0.2;
const COUNTER_DELAY = 0.12;
/** Pager / arrows / socials fade at the start of T6 (≈230 ms). */
const UI_FADE = 0.23;
/** After the rewind they come back late: ≈50 % at 1.76 s, ≈98 % at 2.29 s. */
const REWIND_UI_DELAY = 1.55;
const REWIND_UI_FADE = 0.8;
/** SPECIAL ISSUE badge fades in place over ≈0.4 s, starting ≈0.07 s into T1. */
const BADGE_FADE = 0.4;
const BADGE_DELAY = 0.07;

/**
 * Scene 1 photo zoom, MEASURED from the reference video:
 *   scale = 1 + 0.526 × p   (p = slide-out progress, ratio constant ±1 % for
 *   p = 0.02 … 0.71; no rotation).
 * The zoom lives INSIDE the photo frame; the frame itself translates linearly
 * (sOut ≈ 0.80 stage widths, set in layers.tsx). It is a pure function of
 * state.p, so it reverses exactly when navigating back.
 */
const SCENE_ONE_ZOOM = 0.526;
/** Zoom pivot, fitted from the measured translation: ≈ −26 % of the photo width, vertically centred. */
const SCENE_ONE_ORIGIN = "-26% 50%";

/**
 * Fallback only: the portrait/landscape decision lives in the stylesheet
 * (`--av-portrait`, set by a container query on the hero) so CSS and JS can
 * never disagree. This numeric twin is used if that variable is unavailable.
 * Keep it equal to `max-aspect-ratio: 1 / 1` in averon-hero.module.css.
 */
const PORTRAIT_FALLBACK_ASPECT = 1;

function boxVars(d: (typeof LAYERS)[number]): CSSProperties {
  const v: Record<string, string> = {
    "--l": `${d.d[0]}%`,
    "--t": `${d.d[1]}%`,
    "--w": `${d.d[2]}%`,
    "--h": d.d[3] === undefined ? "auto" : `${d.d[3]}%`,
  };
  if (d.m) {
    v["--ml"] = `${d.m[0]}%`;
    v["--mt"] = `${d.m[1]}%`;
    v["--mw"] = `${d.m[2]}%`;
    v["--mh"] = d.m[3] === undefined ? "auto" : `${d.m[3]}%`;
  }
  if (d.fs) {
    // Type scales with the hero WIDTH, but never beyond what the hero HEIGHT
    // allows: identical to the reference at its own aspect, and it stops text
    // growing into its neighbours on wider / shorter / taller heroes.
    const cqw = (d.fs[0] / REF_W) * 100;
    v["--fs"] =
      `min(${cqw.toFixed(4)}cqw, ${(cqw * (REF_W / REF_H)).toFixed(4)}cqh)`;
    v["--mfs"] =
      `min(${d.fs[1]}cqw, ${(d.fs[1] * PORTRAIT_DESIGN_ASPECT).toFixed(4)}cqh)`;
  }
  return v as CSSProperties;
}

export default function AveronHero({
  initialSlide = 0,
  autoplayMs,
  wheel = false,
  className,
}: AveronHeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);
  const goToRef = useRef<(i: number, fast?: boolean) => void>(() => undefined);
  const stepRef = useRef<(dir: 1 | -1) => void>(() => undefined);

  useEffect(() => {
    const root = rootRef.current;
    const scene = sceneRef.current;
    if (!root || !scene) return;

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-i]"));
    const inners = els.map((el) =>
      el.querySelector<HTMLElement>("[data-inner]"),
    );
    // Clear any scale left by an older HMR/effect instance once.
    gsap.set(
      [
        ...els,
        ...inners.filter((inner): inner is HTMLElement => inner !== null),
        scene,
      ],
      { scale: 1 },
    );
    const hidden = els.map(() => false);
    const fades = Array.from(
      root.querySelectorAll<HTMLElement>("[data-ui-fade]"),
    );

    // Scene 1 photo: the ONLY element that ever scales (inside its frame).
    const sceneOneIndex = LAYERS.findIndex((layer) => layer.id === "s1-photo");
    const sceneOneInner = sceneOneIndex >= 0 ? inners[sceneOneIndex] : null;
    if (sceneOneInner) {
      gsap.set(sceneOneInner, { transformOrigin: SCENE_ONE_ORIGIN });
    }
    const badgeIndex = LAYERS.findIndex((layer) => layer.id === "s1-badge");

    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionMq.matches;

    /* ---- stage geometry ------------------------------------------------ */
    let W = root.clientWidth;
    let H = root.clientHeight;
    let portrait = false;
    let geoms: Geometry[] = [];
    let travel: Travel[] = [];
    let deltas: CarryDelta[] = [];

    const readPortrait = () => {
      const v = getComputedStyle(scene)
        .getPropertyValue("--av-portrait")
        .trim();
      if (v === "1") return true;
      if (v === "0") return false;
      return (
        root.clientWidth / Math.max(root.clientHeight, 1) <=
        PORTRAIT_FALLBACK_ASPECT
      );
    };

    const measure = () => {
      W = root.clientWidth;
      H = root.clientHeight;
      portrait = readPortrait();
      geoms = els.map((el) => ({
        left: el.offsetLeft,
        top: el.offsetTop,
        // scrollWidth also counts content that overflows its box (nowrap text)
        width: Math.max(el.offsetWidth, el.scrollWidth),
      }));
      travel = computeTravel(LAYERS, geoms, W, H, portrait);
      deltas = LAYERS.map((def, i) =>
        carryDelta(def, geoms[i], W, H, portrait),
      );
    };
    measure();

    /* ------------------------------------------------------------------ *
     *  ONE source of truth: `state.p` (continuous position) and `target`  *
     *  (the slide we are heading to). Exactly one tween (`tween`) moves   *
     *  `state.p`. A new request never queues: it retargets that tween.    *
     * ------------------------------------------------------------------ */
    const state = { p: clamp(Math.round(initialSlide), 0, LAST) };
    let target = state.p;
    let tween: gsap.core.Tween | null = null;
    let autoplayTimer: gsap.core.Tween | null = null;
    let disposed = false;
    /** true during the rewind: every layer moves as one rigid strip */
    let stripMode = false;

    /* ---- time-based chrome (independent of the layer timeline) ---------- */
    const counter = { y: Math.min(state.p, LAST - 1) };
    const ui = { a: state.p === LAST ? 0 : 1 };
    const badge = { a: state.p === 0 ? 1 : 0 };
    let counterTween: gsap.core.Tween | null = null;
    let uiTween: gsap.core.Tween | null = null;
    let badgeTween: gsap.core.Tween | null = null;

    const applyCounter = () => {
      if (stripRef.current)
        gsap.set(stripRef.current, {
          yPercent: -(100 / SLIDE_COUNT) * counter.y,
        });
    };
    const applyUi = () => {
      if (fades.length) gsap.set(fades, { autoAlpha: ui.a });
    };

    const swapCounter = (to: number, instant: boolean) => {
      counterTween?.kill();
      counterTween = null;
      if (instant || reduced || Math.abs(counter.y - to) < 1e-4) {
        counter.y = to;
        applyCounter();
        return;
      }
      counterTween = gsap.to(counter, {
        y: to,
        duration: COUNTER_SWAP,
        delay: COUNTER_DELAY,
        ease: "power2.inOut",
        onUpdate: applyCounter,
      });
    };

    const fadeUi = (
      to: number,
      delay: number,
      duration: number,
      ease: string,
    ) => {
      uiTween?.kill();
      uiTween = null;
      if (reduced || Math.abs(ui.a - to) < 1e-4) {
        ui.a = to;
        applyUi();
        return;
      }
      uiTween = gsap.to(ui, {
        a: to,
        duration,
        delay,
        ease,
        onUpdate: applyUi,
      });
    };

    // The badge alpha is applied inside render() (it shares the layer's autoAlpha).
    const fadeBadge = (to: number, delay: number) => {
      badgeTween?.kill();
      badgeTween = null;
      if (reduced || Math.abs(badge.a - to) < 1e-4) {
        badge.a = to;
        return;
      }
      badgeTween = gsap.to(badge, {
        a: to,
        duration: BADGE_FADE,
        delay,
        ease: "sine.inOut",
      });
    };

    /** Snap all time-based chrome to the resting state of `slide`. */
    const syncChrome = (slide: number) => {
      counterTween?.kill();
      uiTween?.kill();
      badgeTween?.kill();
      counterTween = uiTween = badgeTween = null;
      counter.y = Math.min(slide, LAST - 1);
      ui.a = slide === LAST ? 0 : 1;
      badge.a = slide === 0 ? 1 : 0;
      applyCounter();
      applyUi();
    };

    const clearAutoplay = () => {
      autoplayTimer?.kill();
      autoplayTimer = null;
    };

    const stopTween = () => {
      if (tween) {
        tween.kill();
        tween = null;
      }
    };

    function render() {
      const p = state.p;
      const pan = panFor(portrait);

      for (let i = 0; i < els.length; i++) {
        const def = LAYERS[i];
        const el = els[i];
        const solved = solveLayer(def, p, {
          W,
          H,
          pan,
          strip: stripMode,
          travel: travel[i],
          carry: deltas[i],
        });

        if (
          !solved.live ||
          isOffstage(geoms[i].left, geoms[i].width, solved.x, W)
        ) {
          if (!hidden[i]) {
            gsap.set(el, { autoAlpha: 0 });
            hidden[i] = true;
          }
          continue;
        }
        hidden[i] = false;
        gsap.set(el, {
          autoAlpha: solved.alpha * (i === badgeIndex ? badge.a : 1),
          x: solved.x,
          y: solved.y,
        });

        const inner = inners[i];
        if (inner) {
          if (i === sceneOneIndex) {
            // Zoom is driven by the SAME progress that slides the scene
            // (p: 0 → 1 ⇒ 1 → 1 + SCENE_ONE_ZOOM; exact reverse going back).
            // No extra crop shift: the measured model is frame travel + zoom only.
            gsap.set(inner, {
              xPercent: 0,
              scale: reduced ? 1 : 1 + SCENE_ONE_ZOOM * clamp(p, 0, 1),
            });
          } else {
            // Parallax crop shift stays inside the frame; pans are rigid.
            gsap.set(inner, {
              xPercent: solved.rigid || reduced ? 0 : -4 * solved.d,
            });
          }
        }
      }

      // chrome
      if (progressRef.current)
        gsap.set(progressRef.current, {
          width: `${Math.min(1, (p + 1) / SLIDE_COUNT) * 100}%`,
        });
      // The "pill" belongs to the parallax slides only: no pulsing during the
      // rigid pans (T6 and the rewind).
      if (pillRef.current) {
        const bump = Math.sin(Math.PI * (p - Math.floor(p)));
        const on = !reduced && !stripMode && p <= LAST - 1;
        gsap.set(pillRef.current, {
          autoAlpha: on ? Math.min(1, bump * 3.2) : 0,
        });
      }
    }

    /** Development only: warn when a layer is visible outside its scene. */
    const auditSettled = (slide: number) => {
      if (process.env.NODE_ENV === "production") return;
      const leaks = LAYERS.filter(
        (def, i) => !hidden[i] && !mayBeVisibleAt(def, slide),
      ).map((def) => def.id);
      if (leaks.length) {
        console.warn(
          `[AveronHero] layers visible outside their scene at state ${slide}:`,
          leaks,
        );
      }
    };

    const announce = (i: number) => {
      if (liveRef.current)
        liveRef.current.textContent =
          i >= SLIDE_COUNT ? "Newsletter" : `Slide ${i + 1} of ${SLIDE_COUNT}`;
    };

    const scheduleAutoplay = (slide: number) => {
      clearAutoplay();
      if (autoplayMs === 0 || reduced || disposed) return;

      const hold =
        autoplayMs === undefined
          ? (AUTOPLAY_HOLDS[slide] ?? AUTOPLAY_HOLDS[AUTOPLAY_HOLDS.length - 1])
          : Math.max(0, autoplayMs / 1000);
      autoplayTimer = gsap.delayedCall(hold, () => {
        autoplayTimer = null;
        if (disposed || reduced) return;
        // A transition is already running: settle() will re-arm autoplay.
        if (tween) return;
        // Keep the newsletter as the final autoplay state, then use the same
        // continuous reverse sweep for the fast return to the opening scene.
        const wraps = slide >= LAST;
        goTo(wraps ? 0 : slide + 1, wraps, true);
      });
    };

    /** Settle exactly on `slide`: the only place a transition ends. */
    const settle = (slide: number) => {
      tween = null;
      stripMode = false;
      state.p = slide;
      target = slide;
      render();
      auditSettled(slide);
      scheduleAutoplay(slide);
    };

    function goTo(i: number, fast = false, automatic = false) {
      if (disposed) return;
      const next = clamp(Math.round(i), 0, LAST);
      if (!automatic) clearAutoplay();
      target = next;
      announce(next);

      if (reduced) {
        stopTween();
        syncChrome(next);
        settle(next);
        return;
      }

      const dist = Math.abs(next - state.p);
      if (dist < 1e-4) {
        stopTween();
        settle(next);
        return;
      }

      // A request while moving RETARGETS the single tween from the current
      // position. Nothing is queued, so nothing can be left pending.
      const retarget = tween !== null;
      stopTween();
      // The rewind is a rigid strip pan; keep it rigid if it gets retargeted.
      stripMode = fast || (retarget && stripMode);

      const long = dist > 1.5;
      const newsletterEntry =
        !fast && next === LAST && Math.abs(state.p - (SLIDE_COUNT - 1)) < 1e-4;
      const duration = fast
        ? REWIND_DURATION
        : newsletterEntry
          ? NEWSLETTER_DURATION
          : long
            ? Math.min(3.1, 1.15 + dist * 0.34)
            : retarget
              ? Math.max(0.9, TRANSITION_DURATION * dist)
              : TRANSITION_DURATION;
      const ease: gsap.EaseString | gsap.EaseFunction =
        !fast && !long && retarget ? "power2.out" : REF_EASE;

      // ---- time-based chrome -------------------------------------------
      swapCounter(Math.min(next, LAST - 1), fast);
      if (fast) {
        fadeUi(1, REWIND_UI_DELAY, REWIND_UI_FADE, "power2.out");
      } else if (next === LAST) {
        fadeUi(0, 0, UI_FADE, "power1.out");
      } else {
        fadeUi(1, Math.max(0, duration - UI_FADE), UI_FADE, "power1.out");
      }
      if (next === 0) fadeBadge(1, Math.max(0, duration - BADGE_FADE));
      else fadeBadge(0, BADGE_DELAY);

      const active: gsap.core.Tween = gsap.to(state, {
        p: next,
        duration,
        ease,
        onUpdate: render,
        onComplete: () => {
          // stale callback from a tween that was replaced: ignore
          if (tween !== active || disposed) return;
          settle(next);
        },
      });
      tween = active;
    }

    const requestStep = (dir: 1 | -1) => {
      clearAutoplay();
      goTo(target + dir, false, false);
    };

    goToRef.current = (i, fast) => goTo(i, fast ?? false, false);
    stepRef.current = requestStep;

    const onMotion = () => {
      reduced = motionMq.matches;
      if (reduced) {
        clearAutoplay();
        stopTween();
        syncChrome(target);
        settle(target);
        return;
      }
      render();
      if (!tween) scheduleAutoplay(target);
    };

    /** Self-heal: if the tween was ever killed/paused from outside, resume. */
    const heal = () => {
      if (disposed || reduced) return;
      if (tween) {
        if (tween.paused() && tween.progress() < 1) tween.resume();
        return;
      }
      if (state.p !== target) goTo(target, false, true);
    };
    gsap.ticker.add(heal);

    // ---- input ---------------------------------------------------------
    let wheelLock = 0;
    const onWheel = (e: WheelEvent) => {
      if (!wheel) return;
      const now = performance.now();
      if (now < wheelLock || Math.abs(e.deltaY) + Math.abs(e.deltaX) < 8)
        return;
      wheelLock = now + 1100;
      e.preventDefault();
      requestStep(e.deltaY + e.deltaX > 0 ? 1 : -1);
    };
    let sx = 0;
    let sy = 0;
    let dragging = false;
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("input,button,a,label")) return;
      dragging = true;
      sx = e.clientX;
      sy = e.clientY;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      const dx = e.clientX - sx;
      const dy = e.clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3)
        requestStep(dx < 0 ? 1 : -1);
    };
    const onCancel = () => {
      dragging = false;
    };
    const onLeave = () => {
      dragging = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input")) return;
      if (e.key === "ArrowRight") requestStep(1);
      else if (e.key === "ArrowLeft") requestStep(-1);
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-rewind]")) {
        clearAutoplay();
        goTo(0, true, false);
      }
    };

    const ro = new ResizeObserver(() => {
      measure();
      render();
    });
    ro.observe(root);

    // Text widths change once the web fonts have loaded: re-measure.
    document.fonts?.ready.then(() => {
      if (disposed) return;
      measure();
      render();
    });

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("pointerdown", onDown);
    root.addEventListener("pointerup", onUp);
    root.addEventListener("pointercancel", onCancel);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("keydown", onKey);
    root.addEventListener("click", onClick);
    motionMq.addEventListener("change", onMotion);

    syncChrome(state.p);
    render();
    auditSettled(state.p);
    announce(target);
    scheduleAutoplay(state.p);

    return () => {
      disposed = true;
      clearAutoplay();
      stopTween();
      counterTween?.kill();
      uiTween?.kill();
      badgeTween?.kill();
      gsap.ticker.remove(heal);
      gsap.killTweensOf(state);
      gsap.killTweensOf(counter);
      gsap.killTweensOf(ui);
      gsap.killTweensOf(badge);
      gsap.killTweensOf(scene);
      ro.disconnect();
      root.removeEventListener("wheel", onWheel);
      root.removeEventListener("pointerdown", onDown);
      root.removeEventListener("pointerup", onUp);
      root.removeEventListener("pointercancel", onCancel);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("keydown", onKey);
      root.removeEventListener("click", onClick);
      motionMq.removeEventListener("change", onMotion);
    };
    // intentionally run once: the engine owns all further state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplayMs, wheel]);

  return (
    <section
      ref={rootRef}
      className={[s.root, className].filter(Boolean).join(" ")}
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label="AVERON editorial hero"
    >
      <span ref={liveRef} className={s.sr} aria-live="polite" />

      <div ref={sceneRef} className={s.scene}>
        {LAYERS.map((def, i) => (
          <div
            key={def.id}
            data-i={i}
            data-s={def.slide}
            data-hm={def.m === null ? "" : undefined}
            className={[s.layer, def.cls].filter(Boolean).join(" ")}
            style={{ ...boxVars(def), zIndex: def.stack }}
          >
            {def.node}
          </div>
        ))}
      </div>

      {/* chrome */}
      <div className={s.ui}>
        <div className={s.track} />
        <div ref={progressRef} className={s.progress} />
        <div ref={pillRef} className={s.pill} />

        <button
          data-ui-fade
          type="button"
          className={`${s.chev} ${s.chevPrev}`}
          aria-label="Previous slide"
          onClick={() => stepRef.current(-1)}
        >
          <svg viewBox="0 0 7 11" aria-hidden>
            <path
              d="M6 1 1.5 5.5 6 10"
              fill="none"
              stroke="#111"
              strokeWidth="1.6"
            />
          </svg>
        </button>
        <button
          data-ui-fade
          type="button"
          className={`${s.chev} ${s.chevNext}`}
          aria-label="Next slide"
          onClick={() => stepRef.current(1)}
        >
          <svg viewBox="0 0 7 11" aria-hidden>
            <path
              d="M1 1l4.5 4.5L1 10"
              fill="none"
              stroke="#111"
              strokeWidth="1.6"
            />
          </svg>
        </button>

        <div data-ui-fade className={s.counter} aria-hidden>
          <span className={s.star}>*</span>
          <span className={s.win}>
            <span ref={stripRef} className={s.strip}>
              {COUNTER.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        </div>

        <div data-ui-fade className={s.socials}>
          {[
            ["TW", 4.5],
            ["FB", 47.5],
            ["INS", 90.5],
          ].map(([label, x]) => (
            <a
              key={label}
              href="#"
              style={{ left: `${x}%` }}
              onClick={(e) => e.preventDefault()}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
