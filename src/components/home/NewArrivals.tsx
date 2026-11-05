"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { getNewArrivals } from "@/features/products/lib/new-arrival-utils";
import ProductCard from "@/components/product/ProductCard";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function NewArrivals() {
  const sectionRef = useRef<HTMLElement>(null);

  const products = getNewArrivals(8);
  useGSAP(
    () => {
      const section = sectionRef.current;

      if (!section) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const heading = section.querySelector("[data-new-arrivals-heading]");

        const cards = gsap.utils.toArray<HTMLElement>(
          "[data-product-card]",
          section,
        );

        if (heading) {
          gsap.fromTo(
            heading,
            {
              autoAlpha: 0,
              y: 14,
            },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
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
            y: 22,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 76%",
              once: true,
            },
          },
        );
      });

      return () => media.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="new-arrivals-heading"
      className="overflow-hidden bg-[#fff] py-20 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1680px] px-[var(--page-gutter)]">
        <div
          data-new-arrivals-heading
          className="mb-10 text-center sm:mb-14 lg:mb-16"
        >
          <div className="mb-4 flex items-center justify-center gap-3">
            <Image
              src="/images/brand/stag-symbol.png"
              alt=""
              width={28}
              height={28}
              className="h-15 w-15 shrink-0 object-contain"
            />

            <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-ink/70 sm:text-[14px]">
              The Latest in Modern Menswear
            </span>
          </div>

          <h2
            id="new-arrivals-heading"
            className="font-[var(--font-cormorant)] text-[clamp(2.3rem,3.6vw,3.5rem)] font-semibold leading-none tracking-[-0.025em] text-ink"
          >
            New Arrivals
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
