"use client";

import Image from "next/image";
import { useRef } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const collections = [
  {
    name: "Modern Tailoring",
    src: "/images/collections/col-02.jpg",
    alt: "AVÉRON modern tailoring collection",
    position: "center 42%",
    featured: false,
  },
  {
    name: "Everyday Essentials",
    src: "/images/collections/col-03.jpg",
    alt: "AVÉRON everyday essentials collection",
    position: "center center",
    featured: true,
  },
  {
    name: "Off-Duty Forms",
    src: "/images/collections/col-04.jpg",
    alt: "AVÉRON relaxed contemporary menswear",
    position: "center center",
    featured: false,
  },
] as const;

export default function FeaturedCollections() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const heading = section.querySelector("[data-collections-heading]");

        const cards = gsap.utils.toArray<HTMLElement>(
          "[data-collection-card]",
          section,
        );

        if (heading) {
          gsap.fromTo(
            heading,
            {
              autoAlpha: 0,
            },
            {
              autoAlpha: 1,
              duration: 1.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: heading,
                start: "top 88%",
                once: true,
              },
            },
          );
        }

        gsap.fromTo(
          cards,
          {
            autoAlpha: 0,
            clipPath: "inset(5% 0% 5% 0%)",
            scale: 0.985,
          },
          {
            autoAlpha: 1,
            clipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            duration: 1.4,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 76%",
              once: true,
            },
          },
        );
      });

      return () => {
        media.revert();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      id="featured-collections"
      aria-labelledby="collections-heading"
      className="overflow-hidden bg-[#fff] py-14 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[1680px] px-[var(--page-gutter)]">
        {/* Centered editorial heading */}
        <div
          data-collections-heading
          className="mb-8 text-center sm:mb-12 lg:mb-16"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <Image
              src="/images/brand/stag-symbol.png"
              alt=""
              width={38}
              height={38}
              className="h-15 w-15 shrink-0 object-contain"
            />

            <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-ink/70 sm:text-[14px]">
              Considered Modern Menswear
            </span>
          </div>

          <h2
            id="collections-heading"
            className="font-[var(--font-cormorant)] text-[clamp(2.3rem,3.6vw,3.5rem)] font-semibold leading-none tracking-[-0.025em] text-ink"
          >
            The Collections
          </h2>
        </div>
        {/* Editorial collection grid */}
        <div className="grid grid-cols-2 items-center gap-2.5 sm:gap-4 md:grid-cols-[1fr_1.08fr_1fr] md:gap-[clamp(14px,2vw,30px)]">
          {collections.map((collection, index) => (
            <article
              key={collection.name}
              data-collection-card
              className={`group relative isolate aspect-[4/5] w-full overflow-hidden rounded-[9px] bg-[#D9D0C2] sm:rounded-[14px] ${
                collection.featured ? "md:aspect-[3/4]" : "md:aspect-[4/5]"
              } ${index === 2 ? "hidden md:block" : ""}`}
            >
              {/* Collection image */}
              <div className="absolute inset-0 overflow-hidden">
                <Image
                  src={collection.src}
                  alt={collection.alt}
                  fill
                  sizes="(max-width: 767px) 50vw, 34vw"
                  priority={index < 2}
                  style={{
                    objectPosition: collection.position,
                  }}
                  className="object-cover transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] motion-reduce:transition-none"
                />
              </div>

              {/* Image contrast */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-90"
              />

              {/* Collection title */}
              <div className="absolute inset-x-2 bottom-3 z-10 text-center sm:inset-x-4 sm:bottom-7 md:bottom-9">
                <h3
                  className={`font-[var(--font-cormorant)] font-normal leading-[0.98] tracking-[-0.025em] text-white ${
                    collection.featured
                      ? "text-[clamp(1.2rem,2.8vw,3.4rem)]"
                      : "text-[clamp(1.15rem,2.5vw,3rem)]"
                  }`}
                >
                  {collection.name}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
