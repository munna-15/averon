"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Image from "next/image";
import ScrollTrigger from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import { products } from "@/data/new-arrivals";
import ProductCard from "@/components/product/ProductCard";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const curatedProducts = products.slice(0, 6);

export default function TheEdit() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const pageOffsetsRef = useRef<number[]>([0]);

  const [pageOffsets, setPageOffsets] = useState<number[]>([0]);
  const [activePage, setActivePage] = useState(0);

  // Measure one-selector-per-product-step positions.
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    let resizeFrame = 0;

    const measurePages = () => {
      cancelAnimationFrame(resizeFrame);

      resizeFrame = requestAnimationFrame(() => {
        const items = Array.from(rail.children) as HTMLElement[];

        const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);

        const railLeft = rail.getBoundingClientRect().left;

        const offsets: number[] = [];

        for (const item of items) {
          const itemLeft =
            item.getBoundingClientRect().left - railLeft + rail.scrollLeft;

          const offset = Math.min(maxScroll, Math.max(0, itemLeft));

          const previous = offsets[offsets.length - 1];

          // Ignore duplicate positions at the end of the rail.
          if (previous === undefined || offset - previous > 2) {
            offsets.push(offset);
          }

          // The final position has been reached.
          if (offset >= maxScroll - 2) {
            break;
          }
        }

        const nextOffsets = offsets.length > 0 ? offsets : [0];

        pageOffsetsRef.current = nextOffsets;

        setPageOffsets((previous) => {
          const unchanged =
            previous.length === nextOffsets.length &&
            previous.every(
              (value, index) => Math.abs(value - nextOffsets[index]) < 1,
            );

          return unchanged ? previous : nextOffsets;
        });

        let nearestIndex = 0;
        let nearestDistance = Infinity;

        nextOffsets.forEach((offset, index) => {
          const distance = Math.abs(rail.scrollLeft - offset);

          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        setActivePage(nearestIndex);
      });
    };

    const handleScroll = () => {
      const offsets = pageOffsetsRef.current;

      let nearestIndex = 0;
      let nearestDistance = Infinity;

      offsets.forEach((offset, index) => {
        const distance = Math.abs(rail.scrollLeft - offset);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActivePage((previous) =>
        previous === nearestIndex ? previous : nearestIndex,
      );
    };

    measurePages();

    const observer = new ResizeObserver(measurePages);

    observer.observe(rail);

    if (rail.firstElementChild) {
      observer.observe(rail.firstElementChild);
    }

    window.addEventListener("resize", measurePages);

    rail.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      cancelAnimationFrame(resizeFrame);
      observer.disconnect();
      window.removeEventListener("resize", measurePages);
      rail.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Each selector advances the rail by one product step.
  const goToProductStep = useCallback((index: number) => {
    const rail = railRef.current;
    const offset = pageOffsetsRef.current[index];

    if (!rail || offset === undefined) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    setActivePage(index);

    rail.scrollTo({
      left: offset,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, []);

  // Editorial entrance animation.
  useGSAP(
    () => {
      const section = sectionRef.current;
      const heading = headingRef.current;
      const rail = railRef.current;

      if (!section || !heading || !rail) return;

      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          [heading, rail],
          {
            autoAlpha: 0,
            y: 18,
          },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            stagger: 0.14,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
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
      aria-labelledby="the-edit-heading"
      className="overflow-hidden bg-[#fff] py-20 sm:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1680px] px-[var(--page-gutter)]">
        {/* Centered heading */}
        <div className="mb-10 text-center sm:mb-14 lg:mb-16">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Image
              src="/images/brand/stag-symbol.png"
              alt=""
              width={28}
              height={28}
              className="h-15 w-15 shrink-0 object-contain"
            />

            <span className="text-[12px] font-semibold uppercase tracking-[0.15em] text-ink/70 sm:text-[14px]">
              A Curated Expression of Style
            </span>
          </div>

          <h2
            ref={headingRef}
            id="the-edit-heading"
            className="font-[var(--font-cormorant)] text-[clamp(2.3rem,3.6vw,3.5rem)] font-semibold leading-none tracking-[-0.025em] text-ink"
          >
            The Edit
          </h2>
        </div>

        {/* Product rail */}
        <div
          ref={railRef}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5 lg:gap-6"
          aria-label="Curated AVÉRON products"
        >
          {curatedProducts.map((product) => (
            <div
              key={product.id}
              className="w-[calc((100%_-_0.75rem)/2)] shrink-0 snap-start sm:w-[calc((100%_-_2.5rem)/3)] lg:w-[calc((100%_-_4.5rem)/4)]"
            >
              <ProductCard product={product} priority={false} />
            </div>
          ))}
        </div>

        {/* Hero-style circular product selectors */}
        {pageOffsets.length > 1 && (
          <div
            className="mt-8 flex items-center justify-center gap-1.5 sm:mt-10"
            role="group"
            aria-label="Navigate products one at a time"
          >
            {pageOffsets.map((_, index) => {
              const isActive = activePage === index;

              return (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show product position ${index + 1}`}
                  aria-pressed={isActive}
                  onClick={() => goToProductStep(index)}
                  className={`size-3 shrink-0 rounded-full border border-[#292823]/60 transition-colors duration-300 hover:border-[#292823] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                    isActive ? "bg-ink" : "bg-transparent"
                  }`}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
