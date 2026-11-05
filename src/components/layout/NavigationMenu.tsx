"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ArrowUpRight, ChevronDown, PackageSearch } from "lucide-react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/cn";
import { MOTION } from "@/lib/motion/config";
import { gsap, useGSAP } from "@/lib/motion/gsap";
import {
  prefetchFor,
  primaryNavigation,
  shopDestination,
} from "@/lib/navigation";

const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])";

const INERT_SKIP_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "LINK",
  "TEMPLATE",
  "NEXT-ROUTE-ANNOUNCER",
  "NEXTJS-PORTAL",
]);

const TEXT_HIDDEN = "inset(-10% 102% -20% -2%)";
const TEXT_VISIBLE = "inset(-10% -2% -20% -2%)";

const DESKTOP_QUERY =
  "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";

const MOBILE_QUERY =
  "(max-width: 1023px) and (prefers-reduced-motion: no-preference)";

const GATE_PANEL_COUNT = 5;
const GATE_PANEL_WIDTH = 100 / GATE_PANEL_COUNT;

const GATE_OPEN_DURATION = 1.8;
const GATE_EASE = "power3.out";
const GATE_STAGGER = 0.045;

// Closing: mirror of the opening order (white, 2, 3, 4, 5), slightly faster,
// with a balanced ease so it starts at once and never ends abruptly.
const GATE_CLOSE_DURATION = 1.45;
const GATE_CLOSE_EASE = "power1.inOut";
const WHITE_PANEL_CLOSE_DURATION = 1.2;
const WHITE_PANEL_CLOSE_EASE = "power1.inOut";

const GATE_CLIP_CLOSED = "inset(0 100% 0 0)";
const GATE_CLIP_OPEN = "inset(0 0% 0 0)";

const GATE_TRACK_DURATION = 0.28;
const GATE_TRACK_EASE = "power3.out";

const WHITE_PANEL_DURATION = 1.5;
const WHITE_PANEL_EASE = "power2.out";

const MOBILE_REVEAL_DURATION = 0.48;
const MOBILE_CLOSE_SPEED = 1.25;
const MOBILE_STAGGER = 0.045;

function inertEverythingExcept(element: HTMLElement): () => void {
  const changed: Element[] = [];
  let node: HTMLElement = element;

  while (node.parentElement) {
    const parent = node.parentElement;

    for (const sibling of Array.from(parent.children)) {
      if (sibling === node) continue;
      if (INERT_SKIP_TAGS.has(sibling.tagName)) continue;
      if (sibling.hasAttribute("inert")) continue;

      sibling.setAttribute("inert", "");
      changed.push(sibling);
    }

    if (parent === document.body) break;

    node = parent;
  }

  return () => {
    for (const element of changed) {
      element.removeAttribute("inert");
    }
  };
}

function getFocusOrder(header: Element, overlay: Element): HTMLElement[] {
  const all = Array.from(
    header.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );

  const headerControls = all.filter((element) => !overlay.contains(element));
  const menuControls = all.filter((element) => overlay.contains(element));

  return [...headerControls, ...menuControls];
}

function NavigationMenuContent() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  const triggerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const closeTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const gateResetRef = useRef<(() => void) | null>(null);
  const mobileTimelineRef = useRef(false);

  const solidLinks = primaryNavigation.filter((link) => !link.children?.length);

  const dropdownLinks = primaryNavigation.filter((link) =>
    Boolean(link.children?.length),
  );

  const glassPanelGroups = Array.from(
    { length: GATE_PANEL_COUNT - 1 },
    (_, index) =>
      index === GATE_PANEL_COUNT - 2
        ? dropdownLinks.slice(index)
        : dropdownLinks.slice(index, index + 1),
  );

  const openMenu = useCallback(() => {
    flushSync(() => {
      setShown(true);
      setOpen(true);
    });

    // Stop an in-progress close before reopening.
    closeTimelineRef.current?.pause();

    // Restart opening from the current visual state.
    timelineRef.current?.invalidate().timeScale(1).restart();
  }, []);

  const closeMenu = useCallback((returnFocus: boolean) => {
    if (returnFocus) {
      triggerRef.current?.focus({
        preventScroll: true,
      });
    }

    setOpen(false);
    setExpandedPanel(null);
  }, []);

  const togglePanel = useCallback((label: string) => {
    setExpandedPanel((current) => (current === label ? null : label));
  }, []);

  useGSAP(
    () => {
      const root = overlayRef.current;
      if (!root) return;

      const select = gsap.utils.selector(root);

      const gateTrack = select<HTMLElement>("[data-gate-track]");
      const gatePanels = select<HTMLElement>("[data-gate-panel]");
      const gateContents = select<HTMLElement>("[data-gate-content]");
      const mobileItems = select<HTMLElement>("[data-mobile-reveal]");
      const meta = select<HTMLElement>("[data-menu-meta]");

      const adopt = (timeline: gsap.core.Timeline, isMobile: boolean) => {
        timeline.eventCallback("onReverseComplete", () => {
          setShown(false);
        });

        const state = root.dataset.state;

        if (state === "open") {
          timeline.progress(1);
        } else if (state === "closing") {
          setShown(false);
        }

        timelineRef.current = timeline;
        mobileTimelineRef.current = isMobile;

        return () => {
          if (timelineRef.current === timeline) {
            timelineRef.current = null;
          }

          timeline.kill();
        };
      };

      const mm = gsap.matchMedia();

      /*
       * DESKTOP: FIVE-PANEL ACCORDION GATE
       *
       * Opening: 5 -> 4 -> 3 -> 2 -> 1
       * Closing: 1 -> 2 -> 3 -> 4 -> 5
       */

      mm.add(DESKTOP_QUERY, () => {
        const gateProgress = gatePanels.map(() => ({ value: 0 }));

        const updateGate = () => {
          let revealedWidth = 0;

          gatePanels.forEach((panel, index) => {
            const progress = gateProgress[index]?.value ?? 0;
            const visibleProgress = Math.max(0, Math.min(1, progress));

            if (index === 0) {
              gsap.set(panel, {
                xPercent: -100 * (1 - visibleProgress),
                clipPath: GATE_CLIP_OPEN,
                force3D: true,
              });
            } else {
              gsap.set(panel, {
                xPercent: 100 * (revealedWidth - index),
                clipPath: `inset(0 ${(1 - visibleProgress) * 100}% 0 0)`,
                force3D: true,
              });
            }

            revealedWidth += visibleProgress;
          });
        };

        gsap.set(gateTrack, {
          xPercent: -20,
          force3D: true,
        });

        gsap.set(gatePanels, {
          xPercent: (index: number) => (index === 0 ? -100 : -100 * index),
          clipPath: (index: number) =>
            index === 0 ? GATE_CLIP_OPEN : GATE_CLIP_CLOSED,
          force3D: true,
        });

        gsap.set(gateContents, {
          opacity: 0,
        });

        updateGate();

        /*
         * Returns the whole gate to its fully-closed starting state:
         * every fold collapsed, track parked at -20%, content hidden.
         * Used when a close finishes and whenever the menu settles in the
         * closed state, so a later opening always starts from clean values
         * (even if the previous close was interrupted by a reopen).
         */
        const resetGate = () => {
          gateProgress.forEach((progress) => {
            progress.value = 0;
          });

          gsap.set(gateTrack, {
            xPercent: -20,
            force3D: true,
          });

          gsap.set(gateContents, {
            opacity: 0,
          });

          updateGate();
        };

        gateResetRef.current = resetGate;

        /*
         * ORIGINAL OPENING TIMELINE
         * Its animation values and timing are unchanged.
         */

        const timeline = gsap.timeline({
          paused: true,
        });

        timeline.to(
          gateTrack,
          {
            xPercent: 0,
            duration: GATE_TRACK_DURATION,
            ease: GATE_TRACK_EASE,
          },
          0,
        );

        timeline.to(
          gateProgress[0],
          {
            value: 1,
            duration: WHITE_PANEL_DURATION,
            ease: WHITE_PANEL_EASE,
          },
          0.08 + (GATE_PANEL_COUNT - 1) * GATE_STAGGER,
        );

        gateProgress.forEach((progress, index) => {
          if (index === 0) return;

          const startPosition =
            0.08 + (GATE_PANEL_COUNT - 1 - index) * GATE_STAGGER;

          timeline.to(
            progress,
            {
              value: 1,
              duration: GATE_OPEN_DURATION,
              ease: GATE_EASE,
            },
            startPosition,
          );
        });

        timeline.to(
          gateContents,
          {
            opacity: 1,
            duration: 0.65,
            ease: "power2.out",
            stagger: 0.07,
          },
          0.45,
        );

        timeline.eventCallback("onUpdate", updateGate);

        /*
         * DESKTOP CLOSE TIMELINE
         *
         * Independent of the opening timeline; invalidate() before each run
         * re-reads every tween's start value from the gate's current state,
         * so closing always begins from what is actually on screen.
         *
         * Closing order is the mirror of the opening start order:
         * White panel -> Panel 2 -> Panel 3 -> Panel 4 -> Panel 5
         * (same stagger as opening, each fold on the same balanced ease).
         *
         * The track is deliberately NOT animated here. It is one fold wide
         * (-20%) and carries all five folds; sliding it while they are still
         * open pushed the white panel off-screen in a fraction of a second.
         * It is parked at -20% only after everything has collapsed.
         */

        const closeTimeline = gsap.timeline({
          paused: true,
          onComplete: () => {
            resetGate();
            setShown(false);
          },
        });

        // White panel closes first, starting immediately.
        closeTimeline.to(
          gateProgress[0],
          {
            value: 0,
            duration: WHITE_PANEL_CLOSE_DURATION,
            ease: WHITE_PANEL_CLOSE_EASE,
          },
          0,
        );

        // Dark panels follow in order: 2, 3, 4, 5.
        gateProgress.forEach((progress, index) => {
          if (index === 0) return;

          closeTimeline.to(
            progress,
            {
              value: 0,
              duration: GATE_CLOSE_DURATION,
              ease: GATE_CLOSE_EASE,
            },
            index * GATE_STAGGER,
          );
        });

        // Menu content fades out in the same order as the folds.
        closeTimeline.to(
          gateContents,
          {
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            stagger: GATE_STAGGER,
          },
          0,
        );

        closeTimeline.eventCallback("onUpdate", updateGate);

        closeTimelineRef.current = closeTimeline;

        const cleanup = adopt(timeline, false);

        return () => {
          if (closeTimelineRef.current === closeTimeline) {
            closeTimelineRef.current = null;
          }

          if (gateResetRef.current === resetGate) {
            gateResetRef.current = null;
          }

          closeTimeline.kill();
          cleanup();
        };
      });

      /*
       * MOBILE / TABLET
       */

      mm.add(MOBILE_QUERY, () => {
        gsap.set(mobileItems, {
          clipPath: TEXT_HIDDEN,
          opacity: 0,
        });

        gsap.set(meta, {
          opacity: 0,
        });

        const timeline = gsap.timeline({
          paused: true,
        });

        timeline.to(
          mobileItems,
          {
            clipPath: TEXT_VISIBLE,
            opacity: 1,
            duration: MOBILE_REVEAL_DURATION,
            ease: "power3.out",
            stagger: MOBILE_STAGGER,
          },
          0,
        );

        timeline.to(
          meta,
          {
            opacity: 1,
            duration: 0.38,
            ease: "power2.out",
            stagger: 0.06,
          },
          0.12,
        );

        return adopt(timeline, true);
      });

      /*
       * REDUCED MOTION
       */

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(gateTrack, {
          xPercent: 0,
          force3D: false,
        });

        gsap.set(gatePanels, {
          xPercent: 0,
          clipPath: GATE_CLIP_OPEN,
          force3D: false,
        });

        gsap.set(gateContents, {
          opacity: 1,
        });

        gsap.set(mobileItems, {
          clipPath: TEXT_VISIBLE,
          opacity: 1,
        });

        gsap.set(meta, {
          opacity: 1,
        });

        const timeline = gsap.timeline({
          paused: true,
        });

        timeline.fromTo(
          root,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            duration: MOTION.duration.fast,
            ease: "none",
          },
        );

        return adopt(timeline, false);
      });

      return () => mm.revert();
    },
    { scope: overlayRef },
  );

  /*
   * OPEN / CLOSE CONTROL
   */

  useLayoutEffect(() => {
    const timeline = timelineRef.current;

    if (open) {
      if (mobileTimelineRef.current) {
        timeline?.timeScale(1).play();
        return;
      }

      closeTimelineRef.current?.pause();

      timeline?.invalidate().timeScale(1).restart();

      return;
    }

    if (mobileTimelineRef.current) {
      if (timeline && timeline.progress() > 0) {
        timeline.timeScale(MOBILE_CLOSE_SPEED).reverse();
        return;
      }
    } else {
      const closeTimeline = closeTimelineRef.current;

      if (closeTimeline && timeline && shown) {
        timeline.pause();

        closeTimeline.invalidate().restart();

        return;
      }
    }

    timeline?.pause(0);

    // Settle the desktop gate in its clean closed state so the next opening
    // never inherits stale values from an interrupted close.
    gateResetRef.current?.();

    const id = window.setTimeout(() => {
      setShown(false);
    }, 0);

    return () => window.clearTimeout(id);
  }, [open, shown]);

  /*
   * KEYBOARD AND FOCUS MANAGEMENT
   */

  useEffect(() => {
    if (!open) return;

    const trigger = triggerRef.current;
    const overlay = overlayRef.current;
    const header = trigger?.closest("header");

    if (!trigger || !overlay || !header) return;

    overlay
      .querySelector<HTMLElement>("[data-menu-focus]")
      ?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") return;

      const order = getFocusOrder(header, overlay);

      if (order.length === 0) return;

      const last = order.length - 1;
      const index = order.indexOf(document.activeElement as HTMLElement);

      const next = event.shiftKey
        ? index <= 0
          ? last
          : index - 1
        : index === -1 || index === last
          ? 0
          : index + 1;

      event.preventDefault();
      order[next].focus();
    };

    const onHeaderClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const link =
        event.target instanceof Element
          ? event.target.closest("a[href]")
          : null;

      if (!link || link.getAttribute("target") === "_blank") {
        return;
      }

      closeMenu(overlay.contains(link));
    };

    document.addEventListener("keydown", onKeyDown);
    header.addEventListener("click", onHeaderClick);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      header.removeEventListener("click", onHeaderClick);
    };
  }, [open, closeMenu]);

  /*
   * BACKGROUND INERT
   */

  useEffect(() => {
    if (!open) return;

    const header = triggerRef.current?.closest("header");

    if (!header) return;

    return inertEverythingExcept(header);
  }, [open]);

  /*
   * FOCUS RESTORATION
   */

  useLayoutEffect(() => {
    if (open) return;

    const overlay = overlayRef.current;

    if (overlay?.contains(document.activeElement)) {
      triggerRef.current?.focus({
        preventScroll: true,
      });
    }
  }, [open, shown]);

  /*
   * SCROLL LOCK
   */

  useEffect(() => {
    if (!shown) return;

    const lockedX = window.scrollX;
    const lockedY = window.scrollY;

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const scrollKeys = [
        "ArrowUp",
        "ArrowDown",
        "PageUp",
        "PageDown",
        "Home",
        "End",
        " ",
      ];

      if (!scrollKeys.includes(event.key)) return;

      const target = event.target;

      if (
        target instanceof HTMLElement &&
        target.closest(
          "input, textarea, select, button, a, [contenteditable='true']",
        )
      ) {
        return;
      }

      event.preventDefault();
    };

    const onScroll = () => {
      if (window.scrollX !== lockedX || window.scrollY !== lockedY) {
        window.scrollTo(lockedX, lockedY);
      }
    };

    window.addEventListener("wheel", preventScroll, {
      passive: false,
      capture: true,
    });

    window.addEventListener("touchmove", preventScroll, {
      passive: false,
      capture: true,
    });

    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", preventScroll, true);
      window.removeEventListener("touchmove", preventScroll, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("scroll", onScroll);

      window.scrollTo(lockedX, lockedY);
    };
  }, [shown]);

  const isCurrent = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const desktopHover =
    "relative inline-block text-ink transition-colors duration-500 hover:text-muted after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-current after:transition-[width] after:duration-500 after:ease-out hover:after:w-full";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => (open ? closeMenu(true) : openMenu())}
        className="group relative z-10 -ml-2 inline-flex min-h-12 items-center gap-2 px-2 text-ink min-[360px]:gap-2.5 sm:-ml-3 sm:gap-3 sm:px-3"
      >
        <span
          aria-hidden="true"
          className="relative block h-[9px] w-5 min-[360px]:w-6"
        >
          <span className="absolute top-0 left-0 block h-px w-full bg-current transition-[top,width,transform] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-aria-expanded:top-1 group-aria-expanded:rotate-45" />

          <span className="absolute top-2 left-0 block h-px w-2/3 bg-current transition-[top,width,transform] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-aria-expanded:top-1 group-aria-expanded:w-full group-aria-expanded:-rotate-45" />
        </span>

        <span className="grid text-[0.6875rem] leading-none font-medium tracking-[0.14em] uppercase min-[360px]:text-xs min-[360px]:tracking-[0.16em] sm:text-[0.8125rem] sm:tracking-[0.22em]">
          <span
            aria-hidden={open}
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-300",
              open && "opacity-0",
            )}
          >
            Menu
          </span>

          <span
            aria-hidden={!open}
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-300",
              !open && "opacity-0",
            )}
          >
            Close
          </span>
        </span>
      </button>

      <div
        ref={overlayRef}
        id="site-menu"
        data-state={open ? "open" : shown ? "closing" : "closed"}
        inert={!open}
        aria-hidden={!open}
        className="invisible fixed inset-0 z-0 data-[state=closing]:pointer-events-none data-[state=closing]:visible data-[state=open]:visible"
      >
        <div className="relative h-full overflow-hidden overscroll-none bg-[#F4F0E8] lg:bg-transparent">
          {/* DESKTOP: CONNECTED FIVE-PANEL ACCORDION GATE */}

          <nav
            data-gate-track
            aria-label="Primary navigation"
            className="relative hidden h-full min-h-[100svh] overflow-hidden lg:block"
          >
            <div className="absolute inset-0 flex h-full min-h-[100svh] w-full">
              {/* PANEL 1: WHITE PANEL */}

              <section
                data-gate-panel
                className="relative flex h-full min-h-[100svh] shrink-0 flex-col justify-center overflow-hidden bg-[#F4F0E8] px-6 pt-32 pb-12 xl:px-10"
                style={{
                  width: `${GATE_PANEL_WIDTH}%`,
                  boxShadow: "inset -1px 0 rgba(41,40,35,0.16)",
                  clipPath: GATE_CLIP_CLOSED,
                  willChange: "transform, clip-path",
                }}
              >
                <div
                  data-gate-content
                  className="flex h-full w-[calc(20vw-3rem)] shrink-0 flex-col justify-center xl:w-[calc(20vw-5rem)]"
                >
                  <ul className="flex flex-col gap-7 xl:gap-9">
                    {solidLinks.map((link, index) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          prefetch={prefetchFor(link)}
                          aria-current={
                            isCurrent(link.href) ? "page" : undefined
                          }
                          data-menu-focus={index === 0 ? "" : undefined}
                          className={cn(
                            "font-display text-[clamp(1.35rem,2vw,2.35rem)] leading-[1.05] font-normal text-[#292823]",
                            desktopHover,
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>


                  <span className="absolute right-6 bottom-10 left-6 h-px bg-[#292823]/35 xl:right-10 xl:left-10" />

                  <span className="absolute bottom-4 left-6 text-[0.58rem] tracking-[0.2em] text-[#77736B] uppercase xl:left-10">
                    AVÉRON
                  </span>
                </div>
              </section>

              {/* PANELS 2-5: DARK TRANSPARENT PANELS */}

              {glassPanelGroups.map((group, panelIndex) => {
                const isExpanded = group.some(
                  (link) => expandedPanel === link.label,
                );

                return (
                  <section
                    key={`glass-panel-${panelIndex}`}
                    data-gate-panel
                    className={cn(
                      "relative flex h-full min-h-[100svh] shrink-0 flex-col justify-center overflow-hidden border-l-2 px-5 pt-32 pb-12 xl:px-7",
                      panelIndex === 0
                        ? "border-[#292823]/45"
                        : "border-white/55",
                    )}
                    style={{
                      width: `${GATE_PANEL_WIDTH}%`,
                      backgroundColor: isExpanded
                        ? "rgba(10, 10, 10, 0.20)"
                        : "rgba(10, 10, 10, 0.24)",
                      boxShadow:
                        "inset -1px 0 rgba(255,255,255,0.16), inset 1px 0 rgba(0,0,0,0.20)",
                      transition: "background-color 400ms ease",
                      clipPath: GATE_CLIP_CLOSED,
                      willChange: "transform, clip-path",
                    }}
                  >
                    <div
                      data-gate-content
                      className="flex h-full flex-col justify-center"
                    >
                      {group.length > 0 && (
                        <div className="flex flex-col gap-10">
                          {group.map((link, linkIndex) => {
                            const expanded = expandedPanel === link.label;
                            const submenuId = `desktop-menu-submenu-${panelIndex}-${linkIndex}`;

                            return (
                              <div key={link.href}>
                                <button
                                  type="button"
                                  data-menu-focus={
                                    panelIndex === 0 && linkIndex === 0
                                      ? ""
                                      : undefined
                                  }
                                  aria-expanded={expanded}
                                  aria-controls={submenuId}
                                  onClick={() => togglePanel(link.label)}
                                  className="group flex w-full items-start justify-between gap-3 text-left"
                                >
                                  <span
                                    className={cn(
                                      "font-display text-[clamp(1.35rem,2vw,2.35rem)] leading-[1.05] font-normal text-white",
                                      "transition-colors duration-500 hover:text-white/65",
                                      "relative after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-white/80 after:transition-[width] after:duration-500 hover:after:w-full",
                                    )}
                                  >
                                    {link.label}
                                  </span>

                                  <ChevronDown
                                    size={17}
                                    strokeWidth={1.2}
                                    className={cn(
                                      "mt-1 shrink-0 text-white/75 transition-transform duration-500",
                                      expanded && "rotate-180",
                                    )}
                                  />
                                </button>

                                <div
                                  id={submenuId}
                                  hidden={!expanded}
                                  className="mt-6 border-t border-white/40 pt-5"
                                >
                                  <ul className="flex flex-col gap-4">
                                    {link.children?.map((child) => (
                                      <li key={child.href}>
                                        <Link
                                          href={child.href}
                                          prefetch={prefetchFor(child)}
                                          aria-current={
                                            isCurrent(child.href)
                                              ? "page"
                                              : undefined
                                          }
                                          className="inline-flex text-[0.68rem] font-medium tracking-[0.12em] text-white/80 uppercase transition-colors duration-300 hover:text-white"
                                        >
                                          {child.label}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </nav>

          {/* MOBILE / TABLET: SOLID PREMIUM MENU */}

          <div className="flex min-h-full flex-col bg-[#F4F0E8] lg:hidden">
            <nav
              aria-label="Primary"
              className="px-gutter pt-28 pb-12 md:pt-32"
            >
              <ul>
                {primaryNavigation.map((link, index) => {
                  const hasChildren = Boolean(link.children?.length);
                  const expanded = expandedPanel === link.label;
                  const submenuId = `mobile-menu-submenu-${index}`;

                  return (
                    <li
                      key={link.href}
                      data-menu-item
                      className="border-b border-[#292823]/20 first:border-t"
                    >
                      {hasChildren ? (
                        <>
                          <button
                            type="button"
                            data-menu-focus={index === 0 ? "" : undefined}
                            aria-expanded={expanded}
                            aria-controls={submenuId}
                            onClick={() => togglePanel(link.label)}
                            className="flex w-full items-center justify-between py-3.5 text-left font-display text-display-lg font-normal text-[#292823]"
                          >
                            <span data-mobile-reveal className="inline-block">
                              {link.label}
                            </span>

                            <ChevronDown
                              size={18}
                              strokeWidth={1.2}
                              className={cn(
                                "shrink-0 text-[#292823]/70 transition-transform duration-300",
                                expanded && "rotate-180",
                              )}
                            />
                          </button>

                          <div
                            id={submenuId}
                            hidden={!expanded}
                            className="border-t border-[#292823]/15 py-4"
                          >
                            <ul className="flex flex-col gap-3 pl-1">
                              {link.children?.map((child) => (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    prefetch={prefetchFor(child)}
                                    aria-current={
                                      isCurrent(child.href) ? "page" : undefined
                                    }
                                    className="inline-flex py-1 text-[0.72rem] font-medium tracking-[0.12em] text-[#77736B] uppercase transition-colors hover:text-[#292823]"
                                  >
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <Link
                          href={link.href}
                          prefetch={prefetchFor(link)}
                          aria-current={
                            isCurrent(link.href) ? "page" : undefined
                          }
                          data-menu-focus={index === 0 ? "" : undefined}
                          className="block py-3.5 font-display text-display-lg font-normal text-[#292823] transition-colors duration-300 aria-[current=page]:italic"
                        >
                          <span data-mobile-reveal className="inline-block">
                            {link.label}
                          </span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div
              data-menu-panel
              className="mt-auto flex flex-col justify-between gap-16 bg-[#EAE5DB] px-gutter pt-10 pb-[max(2rem,env(safe-area-inset-bottom))] lg:col-span-5 lg:mt-0 lg:pt-32 lg:pb-16"
            >
              <p data-menu-meta className="eyebrow text-[#292823]">
                Contemporary menswear
              </p>

              <div data-menu-meta>
                <Link
                  href={shopDestination.href}
                  prefetch={prefetchFor(shopDestination)}
                  className="inline-flex min-h-14 w-full items-center justify-center bg-[#292823] px-10 text-[0.8125rem] font-medium tracking-[0.2em] text-[#F4F0E8] uppercase transition-colors duration-300 hover:bg-[#292823]/85 lg:w-auto"
                >
                  {shopDestination.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function NavigationMenu() {
  return (
    <Suspense
      fallback={
        <button
          type="button"
          aria-label="Menu"
          className="group relative z-10 -ml-2 inline-flex min-h-12 items-center gap-2 px-2 text-ink min-[360px]:gap-2.5 sm:-ml-3 sm:gap-3 sm:px-3"
        >
          <span
            aria-hidden="true"
            className="relative block h-[9px] w-5 min-[360px]:w-6"
          >
            <span className="absolute top-0 left-0 block h-px w-full bg-current" />
            <span className="absolute top-2 left-0 block h-px w-2/3 bg-current" />
          </span>

          <span className="text-[0.6875rem] font-medium tracking-[0.14em] uppercase min-[360px]:text-xs sm:text-[0.8125rem]">
            Menu
          </span>
        </button>
      }
    >
      <NavigationMenuContent />
    </Suspense>
  );
}
