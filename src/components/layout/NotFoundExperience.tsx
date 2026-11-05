"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function NotFoundExperience() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-reveal]",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: 0.12,
          ease: "power3.out",
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={rootRef}
      className="min-h-[100svh] bg-[#f5f3ee] px-5 py-6 text-[#252522] sm:px-8 sm:py-8"
    >
      <div className="mx-auto flex min-h-[calc(100svh-48px)] max-w-[1440px] flex-col sm:min-h-[calc(100svh-64px)]">
        <header data-reveal className="flex items-center justify-between">
          <Link
            href="/"
            className="text-[22px] font-semibold tracking-[0.2em] sm:text-[25px]"
          >
            AVÉRON
          </Link>

          <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#85827b] sm:text-[10px]">
            Modern Menswear
          </span>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center py-12 text-center sm:py-14">
          <p
            data-reveal
            className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#88847c]"
          >
            Something went off course
          </p>

          <h1
            data-reveal
            className="mt-5 text-[clamp(76px,12vw,132px)] font-bold leading-[0.85] tracking-[-0.085em]"
          >
            404
          </h1>

          <div
            data-reveal
            className="relative mt-9 aspect-[5/4] w-full max-w-[340px] overflow-hidden bg-[#e4e0d8] sm:mt-10 sm:aspect-[4/3] sm:max-w-[390px]"
          >
            <Image
              src="/models/model-01.jpg"
              alt="AVÉRON menswear"
              fill
              priority
              sizes="(max-width: 640px) 90vw, 390px"
              className="object-cover object-center"
            />
          </div>

          <div data-reveal className="mt-8 max-w-[390px] sm:mt-9">
            <h2 className="text-[25px] font-medium tracking-[-0.045em] sm:text-[30px]">
              Lost in the details.
            </h2>

            <p className="mt-3 text-[12px] leading-[1.8] text-[#77746d] sm:text-[13px]">
              The page you&apos;re looking for doesn&apos;t exist or may have
              been moved. Let&apos;s find your way back.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
