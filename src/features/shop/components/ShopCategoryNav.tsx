"use client";

import type { ShopCategory } from "@/features/shop/types/shop";

interface ShopCategoryNavProps {
  categories: ShopCategory[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export function ShopCategoryNav({
  categories,
  selectedCategory,
  onCategoryChange,
}: ShopCategoryNavProps) {
  return (
    <nav
      aria-label="Shop categories"
      className="border-b border-[#E8E4DD] bg-[#FAF8F4]"
    >
      <div className="mx-auto max-w-[1600px] overflow-x-auto px-5 sm:px-8 lg:px-12">
        <div className="flex min-w-max items-center gap-7 sm:gap-9">
          <button
            type="button"
            onClick={() => onCategoryChange(null)}
            aria-pressed={selectedCategory === null}
            className={`relative py-4 font-[var(--font-manrope)] text-[12px] font-semibold transition-colors duration-200 ${
              selectedCategory === null
                ? "text-[#25231F]"
                : "text-[#898278] hover:text-[#25231F]"
            }`}
          >
            All Pieces
            {selectedCategory === null && (
              <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#25231F]" />
            )}
          </button>

          {categories.map((category) => {
            const active = selectedCategory === category.slug;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onCategoryChange(category.slug)}
                aria-pressed={active}
                className={`relative py-4 font-[var(--font-manrope)] text-[12px] font-semibold transition-colors duration-200 ${
                  active
                    ? "text-[#25231F]"
                    : "text-[#898278] hover:text-[#25231F]"
                }`}
              >
                {category.label}

                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[#25231F]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
