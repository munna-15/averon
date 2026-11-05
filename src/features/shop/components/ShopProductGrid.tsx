"use client";

import { useEffect, useRef, useState } from "react";

import type { Product } from "@/types/product";
import ProductCard from "@/components/product/ProductCard";

const BATCH_SIZE = 12;
const LOAD_DELAY = 500;

interface ShopProductGridProps {
  products: Product[];
}

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] w-full bg-[#EAE6DF]" />

      <div className="space-y-3 px-1 pt-4">
        <div className="h-3 w-2/3 bg-[#EAE6DF]" />
        <div className="h-3 w-1/3 bg-[#EAE6DF]" />
      </div>
    </div>
  );
}

export function ShopProductGrid({ products }: ShopProductGridProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  const observerTarget = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const visibleProducts = products.slice(0, visibleCount);
  const remainingProducts = products.length - visibleCount;
  const skeletonCount = Math.min(BATCH_SIZE, remainingProducts);

  useEffect(() => {
    const target = observerTarget.current;

    if (!target || visibleCount >= products.length || isLoading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;

        observer.disconnect();
        setIsLoading(true);

        timeoutRef.current = window.setTimeout(() => {
          setVisibleCount((current) =>
            Math.min(current + BATCH_SIZE, products.length),
          );

          setIsLoading(false);
          timeoutRef.current = null;
        }, LOAD_DELAY);
      },
      {
        rootMargin: "500px",
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();

      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [visibleCount, products.length, isLoading]);

  if (products.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center border-y border-[#E8E4DD] px-6 text-center">
        <p className="font-[var(--font-manrope)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[#91897E]">
          AVÉRON COLLECTION
        </p>

        <h3 className="mt-4 font-[var(--font-manrope)] text-xl font-medium text-[#292721]">
          No pieces found
        </h3>

        <p className="mt-2 max-w-sm font-[var(--font-manrope)] text-[12px] leading-6 text-[#82796F]">
          There are no products matching your current selection. Try adjusting
          your filters or explore the full collection.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}

        {isLoading &&
          Array.from({ length: skeletonCount }).map((_, index) => (
            <ProductSkeleton key={`shop-skeleton-${index}`} />
          ))}
      </div>

      {visibleCount < products.length && (
        <div ref={observerTarget} className="h-16 w-full" aria-hidden="true" />
      )}
    </div>
  );
}
