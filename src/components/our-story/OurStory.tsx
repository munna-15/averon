"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import "./story.css";
import { display, sans } from "./fonts";
import Photo from "./Photo";
import RotatingBadge from "./RotatingBadge";
import { CHAPTERS, COPY, IMG, SHOP_HREF } from "./data";

/* ------------------------------------------------------------------ */
/* Presentational helpers                                               */
/* ------------------------------------------------------------------ */

function Letters({ text }: { text: string }) {
  return (
    <span className="letters">
      <span className="sr-only">{text}</span>

      {text.split("").map((char, index) => (
        <span key={`${char}-${index}`} className="ch" aria-hidden="true">
          <i>{char === " " ? "\u00A0" : char}</i>
        </span>
      ))}
    </span>
  );
}

function Lines({ lines }: { lines: readonly string[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} className="line">
          <span className="line__in">{line}</span>
        </span>
      ))}
    </>
  );
}

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function OurStory() {
  const rootRef = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    let active = true;

    /*
     * Keep every selector scoped to this Story component.
     * This prevents GSAP from accidentally animating elements
     * belonging to other pages or components.
     */
    const el = <T extends HTMLElement = HTMLElement>(selector: string): T => {
      const node = root.querySelector<T>(selector);

      if (!node) {
        throw new Error(
          `[AVERON Story] Required element not found: ${selector}`,
        );
      }

      return node;
    };

    const all = <T extends HTMLElement = HTMLElement>(selector: string): T[] =>
      Array.from(root.querySelectorAll<T>(selector));

    const hudNum = el("[data-hud-num]");
    const hudLabel = el("[data-hud-label]");
    const progress = el("[data-progress]");

    /* -------------------------------------------------------------- */
    /* HUD chapter counter                                             */
    /* -------------------------------------------------------------- */

    let currentChapter = -1;

    const setChapter = (index: number) => {
      const next = Math.max(0, Math.min(CHAPTERS.length - 1, index));

      if (next === currentChapter) return;

      currentChapter = next;

      hudNum.textContent = `*0${next + 1}`;
      hudLabel.textContent = CHAPTERS[next];

      gsap.fromTo(
        hudNum,
        {
          yPercent: 65,
          autoAlpha: 0,
        },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.65,
          ease: "power3.out",
          overwrite: true,
        },
      );
    };

    const chapterTrigger = (index: number, vars: ScrollTrigger.Vars) => {
      return ScrollTrigger.create({
        ...vars,

        onEnter: () => setChapter(index),

        onLeaveBack: () => setChapter(index - 1),
      });
    };

    /* -------------------------------------------------------------- */
    /* Generic reveal choreography                                     */
    /* -------------------------------------------------------------- */

    const reveal = (scope: HTMLElement, vars: ScrollTrigger.Vars) => {
      const lines = Array.from(
        scope.querySelectorAll<HTMLElement>(".line__in"),
      );

      const fades = Array.from(
        scope.querySelectorAll<HTMLElement>("[data-fade]"),
      );

      const wipes = Array.from(
        scope.querySelectorAll<HTMLElement>("[data-wipe]"),
      );

      const photos = Array.from(scope.querySelectorAll<HTMLElement>(".photo"));

      const images = Array.from(
        scope.querySelectorAll<HTMLElement>(".photo__img"),
      );

      gsap.set(lines, {
        yPercent: 110,
        visibility: "visible",
      });

      gsap.set(fades, {
        y: 26,
        autoAlpha: 0,
      });

      gsap.set(wipes, {
        visibility: "visible",
        clipPath: "inset(0% 0% 100% 0%)",
      });

      gsap.set(photos, {
        visibility: "visible",
        clipPath: "inset(100% 0% 0% 0%)",
      });

      gsap.set(images, {
        scale: 1.45,
        transformOrigin: "center center",
      });

      return gsap
        .timeline({
          defaults: {
            ease: "expo.out",
          },

          scrollTrigger: {
            ...vars,
            toggleActions: "play none none reverse",
          },
        })
        .to(
          photos,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.45,
            stagger: 0.13,
          },
          0,
        )
        .to(
          images,
          {
            scale: 1.12,
            duration: 1.9,
            stagger: 0.13,
          },
          0,
        )
        .to(
          wipes,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.5,
          },
          0.12,
        )
        .to(
          lines,
          {
            yPercent: 0,
            duration: 1.15,
            stagger: 0.085,
          },
          0.18,
        )
        .to(
          fades,
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.95,
            stagger: 0.075,
          },
          0.4,
        );
    };

    /* -------------------------------------------------------------- */
    /* Responsive animation contexts                                   */
    /* -------------------------------------------------------------- */

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop:
          "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",

        mobile:
          "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const desktop = Boolean(context.conditions?.desktop);

        /* ---------------------------------------------------------- */
        /* Global page progress                                       */
        /* ---------------------------------------------------------- */

        gsap.set(progress, {
          scaleX: 0,
          transformOrigin: "left center",
        });

        gsap.to(progress, {
          scaleX: 1,
          ease: "none",

          scrollTrigger: {
            start: 0,
            end: "max",
            scrub: 0.3,
          },
        });

        /* ========================================================== */
        /* 01 — OPENING                                               */
        /* ========================================================== */

        const open = el(".open");
        const openPhoto = el(".open__photo");
        const openImage = el(".open__photo .photo__img");
        const openLetters = all(".open .ch i");
        const openCircle = el(".open__circle");
        const openSeal = el(".open__seal");
        const openFades = all(".open [data-fade]");
        const hud = el(".hud");

        gsap.set(openPhoto, {
          visibility: "visible",
          clipPath: "inset(0% 100% 0% 0%)",
        });

        gsap.set(openImage, {
          scale: 1.45,
        });

        gsap.set(openLetters, {
          yPercent: 115,
          visibility: "visible",
        });

        gsap.set(openCircle, {
          scale: 0,
          transformOrigin: "center center",
        });

        gsap.set(openFades, {
          y: 22,
          autoAlpha: 0,
        });

        gsap.set(hud, {
          autoAlpha: 0,
        });

        /* Opening entrance */

        gsap
          .timeline({
            defaults: {
              ease: "expo.out",
            },
          })
          .to(
            openPhoto,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.8,
            },
            0,
          )
          .to(
            openImage,
            {
              scale: 1.12,
              duration: 2.5,
            },
            0,
          )
          .to(
            openLetters,
            {
              yPercent: 0,
              duration: 1.45,
              stagger: 0.065,
            },
            0.42,
          )
          .to(
            openCircle,
            {
              scale: 1,
              duration: 1.8,
              ease: "power3.out",
            },
            0.55,
          )
          .to(
            openFades,
            {
              y: 0,
              autoAlpha: 1,
              duration: 1.05,
              stagger: 0.1,
            },
            1.05,
          )
          .to(
            hud,
            {
              autoAlpha: 1,
              duration: 1.1,
              ease: "power2.out",
            },
            1.25,
          );

        /* Opening pinned transition */

        gsap
          .timeline({
            defaults: {
              ease: "none",
            },

            scrollTrigger: {
              trigger: open,
              start: "top top",
              end: "+=110%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(openPhoto, desktop ? { xPercent: -30 } : { yPercent: -28 }, 0)
          .to(
            openImage,
            {
              scale: 1.32,
              yPercent: desktop ? 0 : 6,
            },
            0,
          )
          .to(
            openLetters,
            {
              yPercent: -115,
              stagger: 0.045,
              ease: "power2.in",
            },
            0.08,
          )
          .to(
            openCircle,
            {
              scale: desktop ? 4 : 3,
              ease: "power2.in",
            },
            0.12,
          )
          .to(
            openFades,
            {
              y: -28,
              autoAlpha: 0,
              stagger: 0.035,
            },
            0,
          )
          .to(
            openSeal,
            {
              rotation: 130,
              scale: 0.65,
            },
            0,
          );

        /* ========================================================== */
        /* 02–04 — JOURNEY                                            */
        /* ========================================================== */

        const journey = el(".journey");
        const track = el(".journey__track");
        const panels = all(".journey .panel");

        let horizontalTween: gsap.core.Tween | undefined;

        if (desktop) {
          const distance = () =>
            Math.max(0, track.scrollWidth - journey.clientWidth);

          horizontalTween = gsap.to(track, {
            x: () => -distance(),
            ease: "none",

            scrollTrigger: {
              trigger: journey,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          panels.forEach((panel, index) => {
            /*
             * The first panel reveals as the journey enters.
             * Other panels reveal as they move into the viewport.
             */

            if (index === 0) {
              reveal(panel, {
                trigger: journey,
                start: "top 75%",
              });
            } else {
              reveal(panel, {
                trigger: panel,
                containerAnimation: horizontalTween,
                start: "left 72%",
              });
            }

            /* Horizontal depth parallax */

            panel
              .querySelectorAll<HTMLElement>("[data-depth]")
              .forEach((node) => {
                const depth = Number.parseFloat(node.dataset.depth || "0");

                gsap.fromTo(
                  node,
                  {
                    x: -depth * 150,
                  },
                  {
                    x: depth * 150,
                    ease: "none",

                    scrollTrigger: {
                      trigger: panel,
                      containerAnimation: horizontalTween,
                      start: "left right",
                      end: "right left",
                      scrub: true,
                    },
                  },
                );
              });

            /* Subtle photo rotation */

            panel
              .querySelectorAll<HTMLElement>("[data-tilt]")
              .forEach((node) => {
                gsap.set(node, {
                  transformPerspective: 1400,
                  transformOrigin: "center center",
                });

                gsap.fromTo(
                  node,
                  {
                    rotationY: 12,
                  },
                  {
                    rotationY: -12,
                    ease: "none",

                    scrollTrigger: {
                      trigger: panel,
                      containerAnimation: horizontalTween,
                      start: "left right",
                      end: "right left",
                      scrub: true,
                    },
                  },
                );
              });

            /* Counter-parallax inside photo masks */

            panel
              .querySelectorAll<HTMLElement>(".photo__img")
              .forEach((image) => {
                gsap.fromTo(
                  image,
                  {
                    xPercent: -6,
                  },
                  {
                    xPercent: 6,
                    ease: "none",

                    scrollTrigger: {
                      trigger: panel,
                      containerAnimation: horizontalTween,
                      start: "left right",
                      end: "right left",
                      scrub: true,
                    },
                  },
                );
              });
          });

          /* Vision rotating badge */

          const badgeRing = el(".badge--vision .badge__ring");

          gsap.fromTo(
            badgeRing,
            {
              rotation: 0,
            },
            {
              rotation: 360,
              ease: "none",

              scrollTrigger: {
                trigger: journey,
                start: "top top",
                end: () => `+=${distance()}`,
                scrub: true,
              },
            },
          );
        } else {
          /* Mobile/tablet: natural vertical story flow */

          panels.forEach((panel) => {
            reveal(panel, {
              trigger: panel,
              start: "top 72%",
            });

            /* Vertical depth parallax */

            panel
              .querySelectorAll<HTMLElement>("[data-depth]")
              .forEach((node) => {
                const depth = Number.parseFloat(node.dataset.depth || "0");

                gsap.fromTo(
                  node,
                  {
                    y: -depth * 65,
                  },
                  {
                    y: depth * 65,
                    ease: "none",

                    scrollTrigger: {
                      trigger: panel,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
              });

            /* Gentle image movement */

            panel
              .querySelectorAll<HTMLElement>(".photo__img")
              .forEach((image) => {
                gsap.fromTo(
                  image,
                  {
                    yPercent: -4,
                  },
                  {
                    yPercent: 4,
                    ease: "none",

                    scrollTrigger: {
                      trigger: panel,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
              });
          });
        }

        /* ========================================================== */
        /* 05 — IDENTITY                                              */
        /* ========================================================== */

        const identity = el(".identity");
        const scene = el(".identity__scene");

        const layerA = el(".identity__a");
        const layerB = el(".identity__b");
        const layerC = el(".identity__c");

        const identityPhotos = [layerA, layerB, layerC];
        const identityImages = all(".identity .photo__img");
        const identityLines = all(".identity .line__in");
        const identityFades = all(".identity [data-fade]");

        const ghost = el(".identity__ghost");
        const identityCircle = el(".identity__circle");

        gsap.set(identityPhotos, {
          visibility: "visible",
          clipPath: "inset(100% 0% 0% 0%)",
        });

        gsap.set(identityImages, {
          scale: 1.45,
        });

        gsap.set(identityLines, {
          yPercent: 110,
          visibility: "visible",
        });

        gsap.set(identityFades, {
          y: 24,
          autoAlpha: 0,
        });

        gsap.set(layerA, {
          z: -260,
        });

        gsap.set(layerB, {
          z: 0,
        });

        gsap.set(layerC, {
          z: 220,
        });

        gsap
          .timeline({
            defaults: {
              ease: "none",
            },

            scrollTrigger: {
              trigger: identity,
              start: "top top",
              end: "+=190%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(
            identity,
            {
              backgroundColor: "#ffffff",
              color: "#0b0b0b",
            },
            {
              backgroundColor: "#0b0b0b",
              color: "#ffffff",
              duration: 0.55,
            },
            0,
          )
          .to(
            identityPhotos,
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.32,
              stagger: 0.08,
              ease: "power3.out",
            },
            0.02,
          )
          .to(
            identityImages,
            {
              scale: 1.15,
              duration: 0.5,
              stagger: 0.08,
              ease: "power3.out",
            },
            0.02,
          )
          .fromTo(
            scene,
            {
              rotationY: -12,
              rotationX: 4,
            },
            {
              rotationY: 12,
              rotationX: -4,
              duration: 1,
            },
            0,
          )
          .fromTo(
            layerA,
            {
              yPercent: 12,
            },
            {
              yPercent: -20,
              duration: 1,
            },
            0,
          )
          .fromTo(
            layerB,
            {
              yPercent: 3,
            },
            {
              yPercent: -34,
              duration: 1,
            },
            0,
          )
          .fromTo(
            layerC,
            {
              yPercent: 26,
            },
            {
              yPercent: -40,
              duration: 1,
            },
            0,
          )
          .fromTo(
            ghost,
            {
              xPercent: 12,
            },
            {
              xPercent: -12,
              duration: 1,
            },
            0,
          )
          .fromTo(
            identityCircle,
            {
              scale: 0.45,
              opacity: 0.35,
            },
            {
              scale: 1.35,
              opacity: 1,
              duration: 1,
            },
            0,
          )
          .to(
            identityLines,
            {
              yPercent: 0,
              duration: 0.32,
              stagger: 0.09,
              ease: "power3.out",
            },
            0.28,
          )
          .to(
            identityFades,
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.32,
              stagger: 0.055,
              ease: "power3.out",
            },
            0.4,
          );

        /* ========================================================== */
        /* 06 — CLOSING                                               */
        /* ========================================================== */

        const closing = el(".closing");
        const closingBg = el(".closing__bg");
        const closingCircle = el(".closing__circle");
        const closingImage = el(".closing .photo__img");

        gsap.fromTo(
          closingBg,
          {
            clipPath: "circle(0% at 50% 0%)",
          },
          {
            clipPath: "circle(150% at 50% 0%)",
            ease: "none",

            scrollTrigger: {
              trigger: closing,
              start: "top 85%",
              end: "top 15%",
              scrub: true,
            },
          },
        );

        reveal(closing, {
          trigger: closing,
          start: "top 42%",
        });

        gsap.fromTo(
          closingImage,
          {
            yPercent: -5,
          },
          {
            yPercent: 5,
            ease: "none",

            scrollTrigger: {
              trigger: closing,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        gsap.fromTo(
          closingCircle,
          {
            yPercent: 16,
          },
          {
            yPercent: -16,
            ease: "none",

            scrollTrigger: {
              trigger: closing,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );

        /* ========================================================== */
        /* HUD chapter triggers                                       */
        /* ========================================================== */

        setChapter(0);

        if (desktop && horizontalTween) {
          chapterTrigger(1, {
            trigger: journey,
            start: "top 50%",
          });

          if (panels[1]) {
            chapterTrigger(2, {
              trigger: panels[1],
              containerAnimation: horizontalTween,
              start: "left 60%",
            });
          }

          if (panels[2]) {
            chapterTrigger(3, {
              trigger: panels[2],
              containerAnimation: horizontalTween,
              start: "left 60%",
            });
          }
        } else {
          panels.forEach((panel, index) => {
            chapterTrigger(index + 1, {
              trigger: panel,
              start: "top 55%",
            });
          });
        }

        chapterTrigger(4, {
          trigger: identity,
          start: "top 50%",
        });

        chapterTrigger(5, {
          trigger: closing,
          start: "top 55%",
        });

        /*
         * Fonts can change layout measurements.
         * Refresh only while this component is still mounted.
         */

        document.fonts?.ready.then(() => {
          if (active) {
            ScrollTrigger.refresh();
          }
        });

        return () => {
          active = false;
        };
      },
    );

    return () => {
      active = false;
      mm.revert();
    };
  }, []);

  const c = COPY;

  const scrollToJourney = () => {
    rootRef.current?.querySelector("#journey")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div ref={rootRef} className={`story ${display.variable} ${sans.variable}`}>
      <noscript>
        <style>
          {`
            .story .line__in,
            .story .ch i,
            .story [data-fade],
            .story [data-wipe],
            .story .photo {
              visibility: visible !important;
              opacity: 1 !important;
            }
          `}
        </style>
      </noscript>

      {/* HUD */}

      <div className="hud" aria-hidden="true">
        <span className="hud__label" data-hud-label>
          {CHAPTERS[0]}
        </span>

        <span className="hud__num" data-hud-num>
          *01
        </span>
      </div>

      <div className="progress" data-progress aria-hidden="true" />

      <main>
        {/* ======================================================== */}
        {/* 01 — OPENING                                             */}
        {/* ======================================================== */}

        <section
          className="open relative overflow-hidden"
          aria-labelledby="open-title"
        >
          <Photo
            className="open__photo"
            src={IMG.hero}
            alt={c.opening.alt}
            priority
            sizes="(min-width: 1024px) 46vw, 100vw"
          />

          <div className="open__circle" aria-hidden="true" />

          <div className="open__seal" aria-hidden="true">
            <span>
              {c.opening.seal[0]}
              <br />
              {c.opening.seal[1]}
            </span>
          </div>

          <div className="open__heading">
            <p className="open__eyebrow" data-fade>
              {c.opening.eyebrow}
            </p>

            <h1 id="open-title" className="display open__title">
              <Letters text={c.opening.title} />
            </h1>

            <button
              type="button"
              className="link-arrow"
              data-fade
              onClick={scrollToJourney}
            >
              {c.opening.cta}
              <i aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 02–04 — JOURNEY                                          */}
        {/* ======================================================== */}

        <section
          className="journey relative"
          id="journey"
          aria-label="Beginning, vision and craft"
        >
          <div className="journey__track">
            {/* ---------------------------------------------------- */}
            {/* PANEL 01 — BEGINNING                                 */}
            {/* ---------------------------------------------------- */}

            <article className="panel panel--beginning">
              <div className="p1__block" data-depth="0.45" aria-hidden="true" />

              <div className="p1__circle" data-depth="0.7" aria-hidden="true" />

              <h2 className="display p1__word" data-depth="0.1" data-wipe>
                {c.beginning.word}
              </h2>

              <Photo
                className="p1__tall"
                src={IMG.beginningTall}
                alt={c.beginning.altTall}
                depth={-0.35}
                tilt
                sizes="(min-width: 1024px) 18vw, 42vw"
              />

              <Photo
                className="p1__small"
                src={IMG.beginningSmall}
                alt={c.beginning.altSmall}
                depth={-0.15}
                tilt
                sizes="(min-width: 1024px) 24vw, 56vw"
              />

              <div className="p1__copy" data-depth="-0.05">
                <p className="label" data-fade>
                  {c.beginning.label}
                </p>

                <p className="body" data-fade>
                  {c.beginning.body}
                </p>
              </div>
            </article>

            {/* ---------------------------------------------------- */}
            {/* PANEL 02 — VISION                                    */}
            {/* ---------------------------------------------------- */}

            <article className="panel panel--vision">
              <div className="p2__block" data-depth="0.5" aria-hidden="true" />

              <div
                className="p2__circle"
                data-depth="0.65"
                aria-hidden="true"
              />

              <h2 className="display p2__title" data-depth="-0.1">
                <Lines lines={c.vision.lines} />
              </h2>

              <RotatingBadge
                id="badge-vision"
                text={c.vision.badge}
                className="badge--vision p2__badge"
                glyph="+"
              />

              <Photo
                className="p2__photo"
                src={IMG.vision}
                alt={c.vision.alt}
                depth={-0.3}
                tilt
                sizes="(min-width: 1024px) 20vw, 44vw"
              />

              <div className="p2__copy" data-depth="-0.05">
                <p className="label" data-fade>
                  {c.vision.label}
                </p>

                <p className="body" data-fade>
                  {c.vision.body}
                </p>
              </div>
            </article>

            {/* ---------------------------------------------------- */}
            {/* PANEL 03 — CRAFT                                     */}
            {/* ---------------------------------------------------- */}

            <article className="panel panel--craft">
              <h2 className="display p3__title" data-depth="-0.08">
                <Lines lines={c.craft.lines} />
              </h2>

              <div className="p3__circle" data-depth="0.6" aria-hidden="true" />

              <Photo
                className="p3__a"
                src={IMG.craftA}
                alt={c.craft.altA}
                depth={0.1}
                tilt
                sizes="(min-width: 1024px) 22vw, 60vw"
              />

              <Photo
                className="p3__b"
                src={IMG.craftB}
                alt={c.craft.altB}
                depth={-0.3}
                tilt
                sizes="(min-width: 1024px) 28vw, 70vw"
              />

              <div className="p3__copy" data-depth="-0.05">
                <p className="label" data-fade>
                  {c.craft.label}
                </p>

                <ul className="p3__list">
                  {c.craft.items.map((item) => (
                    <li key={item.k} data-fade>
                      <strong>{item.k}</strong>
                      <span>{item.v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p3__bridge" aria-hidden="true">
                <span>{c.craft.bridge}</span>
                <i />
              </div>
            </article>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 05 — IDENTITY                                            */}
        {/* ======================================================== */}

        <section
          className="identity relative overflow-hidden"
          aria-labelledby="identity-title"
        >
          <div className="identity__stage">
            <div className="identity__scene">
              <div className="identity__circle" aria-hidden="true" />

              <span className="display identity__ghost" aria-hidden="true">
                {c.identity.ghost}
              </span>

              <Photo
                className="identity__a"
                src={IMG.identityA}
                alt={c.identity.altA}
                sizes="(min-width: 1024px) 24vw, 44vw"
              />

              <Photo
                className="identity__b"
                src={IMG.identityB}
                alt={c.identity.altB}
                sizes="(min-width: 1024px) 24vw, 44vw"
              />

              <Photo
                className="identity__c"
                src={IMG.identityC}
                alt={c.identity.altC}
                sizes="(min-width: 1024px) 20vw, 40vw"
              />
            </div>
          </div>

          <div className="identity__text">
            <p className="label" data-fade>
              {c.identity.label}
            </p>

            <h2 id="identity-title" className="display identity__title">
              <Lines lines={c.identity.lines} />
            </h2>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 06 — CLOSING                                             */}
        {/* ======================================================== */}

        <section
          className="closing relative overflow-hidden"
          aria-labelledby="closing-title"
        >
          <div className="closing__bg" aria-hidden="true" />

          <div className="closing__circle" aria-hidden="true" />

          <div className="closing__inner">
            <Photo
              className="closing__photo"
              src={IMG.closing}
              alt={c.closing.alt}
              sizes="(min-width: 1024px) 30vw, 70vw"
            />

            <div className="closing__text">
              <p className="label" data-fade>
                {c.closing.label}
              </p>

              <h2 id="closing-title" className="display closing__title">
                <Lines lines={c.closing.lines} />
              </h2>

              <p className="body" data-fade>
                {c.closing.body}
              </p>

              <Link
                href={SHOP_HREF}
                className="link-arrow link-arrow--lg"
                data-fade
              >
                {c.closing.cta}
                <i aria-hidden="true" />
              </Link>
            </div>

            <footer className="closing__foot" data-fade>
              <span>{c.closing.footer}</span>

              <button type="button" onClick={scrollToTop}>
                {c.closing.top}
              </button>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
