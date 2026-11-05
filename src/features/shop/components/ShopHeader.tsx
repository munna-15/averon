"use client";

import { ChevronDown } from "lucide-react";

import type { ShopSortOption } from "@/features/shop/types/shop";

interface ShopHeaderProps {
  totalProducts: number;
  sort: ShopSortOption;
  onSortChange: (sort: ShopSortOption) => void;
}

const SORT_OPTIONS: {
  label: string;
  value: ShopSortOption;
}[] = [
  { label: "Featured", value: "default" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Price: Low to High", value: "price-low-to-high" },
  { label: "Price: High to Low", value: "price-high-to-low" },
];

export function ShopHeader({
  totalProducts,
  sort,
  onSortChange,
}: ShopHeaderProps) {
  return (
    <section className="border-b border-[#E8E4DD]">
      <div className="mx-auto max-w-[1600px] px-5 pb-7 pt-12 sm:px-8 sm:pb-9 sm:pt-16 lg:px-12 lg:pt-20">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 font-[var(--font-manrope)] text-[10px] font-semibold uppercase tracking-[0.24em] text-[#8B8175] sm:text-[11px]">
              AVÉRON / THE COLLECTION
            </p>

            <h1 className="font-[var(--font-manrope)] text-[34px] font-semibold leading-[1.1] tracking-[-0.055em] text-[#25231F] sm:text-[44px] lg:text-[52px]">
              Shop All
            </h1>

            <p className="mt-3 max-w-lg font-[var(--font-manrope)] text-[13px] leading-6 text-[#777168] sm:text-[14px]">
              Explore considered pieces designed to become part of your everyday
              wardrobe.
            </p>
          </div>

          <div className="flex items-center justify-between gap-5 border-t border-[#E8E4DD] pt-4 sm:justify-end sm:border-0 sm:pt-0">
            <p
              className="font-[var(--font-manrope)] text-[12px] text-[#777168]"
              aria-live="polite"
            >
              {totalProducts} {totalProducts === 1 ? "Piece" : "Pieces"}
            </p>

            <label className="relative flex items-center gap-2">
              <span className="font-[var(--font-manrope)] text-[11px] font-medium text-[#777168]">
                Sort by
              </span>

              <select
                value={sort}
                onChange={(event) =>
                  onSortChange(event.target.value as ShopSortOption)
                }
                aria-label="Sort products"
                className="h-10 appearance-none border-0 bg-transparent pr-6 font-[var(--font-manrope)] text-[12px] font-semibold text-[#25231F] outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                strokeWidth={1.6}
                className="pointer-events-none absolute right-0 text-[#777168]"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}
