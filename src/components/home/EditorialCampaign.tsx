"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function EditorialCampaign() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  // Respect reduced-motion preferences and control autoplay.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    const updatePlayback = () => {
      if (motionPreference.matches) {
        video.pause();
        return;
      }

      void video.play().catch(() => {
        setIsPlaying(false);
      });
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    updatePlayback();
    motionPreference.addEventListener("change", updatePlayback);

    return () => {
      motionPreference.removeEventListener("change", updatePlayback);

      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);

      video.pause();
    };
  }, []);

  // Toggle campaign video playback.
  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().catch(() => {
        setIsPlaying(false);
      });
    } else {
      video.pause();
    }
  };

  // Cinematic reveal when the section enters the viewport.
  useGSAP(
    () => {
      const section = sectionRef.current;
      const frame = frameRef.current;
      const video = videoRef.current;

      if (!section || !frame || !video) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 90%",
            once: true,
          },
        });

        reveal
          .fromTo(
            frame,
            {
              clipPath: "inset(0% 100% 0% 0% round 22px)",
            },
            {
              clipPath: "inset(0% 0% 0% 0% round 22px)",
              duration: 2,
              ease: "power3.inOut",
            },
          )
          .fromTo(
            video,
            {
              scale: 1.08,
            },
            {
              scale: 1,
              duration: 2.6,
              ease: "power2.out",
            },
            0,
          );
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="editorial-heading"
      className="overflow-hidden bg-[#fff] py-14 sm:py-16 lg:py-20"
    >
      <div className="mb-4 flex items-center justify-center gap-3">
        <Image
          src="/images/brand/stag-symbol.png"
          alt=""
          width={28}
          height={28}
          className="h-24 w-24 shrink-0 object-contain"
        />
      </div>

      <div className="mx-auto max-w-[1680px] px-[var(--page-gutter)]">
        <div
          ref={frameRef}
          className="group relative isolate h-[70svh] min-h-[430px] max-h-[660px] overflow-hidden rounded-[18px] bg-[#292823] sm:rounded-[22px] md:h-[70vh] md:min-h-[520px] md:max-h-[760px] lg:rounded-[26px]"
        >
          {/* Campaign video */}
          <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/campaigns/hero-07.jpg"
              aria-label="AVÉRON contemporary menswear campaign film"
              className="absolute inset-0 h-full w-full object-cover object-center"
            >
              <source src="/images/campaigns/campaign.mp4" type="video/mp4" />
            </video>
          </div>

          {/* Cinematic contrast */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-black/20 via-transparent to-black/35"
          />

          {/* Centered editorial identity */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 text-center">
            <p className="mb-4 font-[var(--font-manrope)] text-[8px] font-semibold uppercase tracking-[0.3em] text-white/80 sm:mb-5 sm:text-[9px]">
              AVÉRON / EDITORIAL
            </p>

            <h2
              id="editorial-heading"
              className="font-[var(--font-cormorant)] text-[clamp(2.5rem,5.2vw,5.2rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-white"
            >
              Quiet confidence.
              <span className="mt-1 block font-normal italic">Every day.</span>
            </h2>

            {/* Explore collection */}
            <Link
              href="#featured-collections"
              className="mt-7 inline-flex flex-col items-center gap-2 font-[var(--font-manrope)] text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-opacity duration-300 hover:opacity-65 sm:mt-8 sm:text-[11px]"
            >
              Explore collection
              <span className="h-px w-full bg-white/80" />
            </Link>

            {/* Video playback control */}
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={
                isPlaying ? "Pause campaign video" : "Play campaign video"
              }
              className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-white/55 bg-white/10 px-6 py-3 font-[var(--font-manrope)] text-[10px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-8 sm:min-h-14 sm:px-7 sm:text-[11px]"
            >
              {isPlaying ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="size-[18px] fill-current"
                >
                  <rect x="3" y="2" width="3.5" height="12" rx="0.8" />
                  <rect x="9.5" y="2" width="3.5" height="12" rx="0.8" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  className="size-[18px] fill-current"
                >
                  <path d="M4 2.7a.8.8 0 0 1 1.2-.7l8.1 5.1a1 1 0 0 1 0 1.7l-8.1 5.1a.8.8 0 0 1-1.2-.7V2.7Z" />
                </svg>
              )}

              {isPlaying ? "Pause film" : "Play film"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
