"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import { ShopProductGrid } from "@/features/shop/components/ShopProductGrid";
import { useShopProducts } from "@/features/shop/hooks/useShopProducts";
import type { ShopFilters, ShopSortOption } from "@/features/shop/types/shop";

const MAX_PRICE_LIMIT = 10000;

const sortOptions: {
  label: string;
  value: ShopSortOption;
}[] = [
  { label: "Default Sorting", value: "default" },
  { label: "Sort by Latest", value: "newest" },
  { label: "Sort by Oldest", value: "oldest" },
  { label: "Price Low to High", value: "price-low-to-high" },
  { label: "Price High to Low", value: "price-high-to-low" },
];

const filterOptions = {
  categories: [
    "Denim",
    "Chinos Pant",
    "Trouser",
    "Baggy Trouser",
    "Slim Fit",
    "Cargo Denim",
    "Formal Pant",
  ],
  sizes: ["28", "30", "32", "34", "36", "38", "L", "M", "XL"],
  brands: ["AVÉRON"],
};

type FilterKey = "categories" | "sizes" | "brands";

const filterHeadings: Record<FilterKey, string> = {
  categories: "PRODUCT TYPE",
  sizes: "SIZES",
  brands: "BRANDS",
};

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-[22px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="size-[22px] shrink-0 cursor-pointer appearance-none border border-[#171717] bg-transparent checked:bg-[#292823] checked:bg-[linear-gradient(45deg,transparent_43%,white_43%,white_51%,transparent_51%),linear-gradient(-45deg,transparent_43%,white_43%,white_51%,transparent_51%)] checked:bg-center checked:bg-no-repeat checked:bg-[length:12px_12px]"
      />

      <span className="font-[var(--font-manrope)] text-[16px] font-normal uppercase tracking-[0.075em] text-[#171717]">
        {label}
      </span>
    </label>
  );
}

export function ShopPageContent() {
  const {
    products,
    totalProducts,
    filters,
    sort,
    updateFilters,
    updateSort,
    clearFilters,
  } = useShopProducts();

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const selectedSort =
    sortOptions.find((option) => option.value === sort)?.label ??
    "Default Sorting";

  const activeFilterCount =
    filters.categories.length +
    filters.sizes.length +
    filters.brands.length +
    (filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice < MAX_PRICE_LIMIT ? 1 : 0);

  function toggleFilter(key: FilterKey, value: string) {
    const currentValues = filters[key];

    const nextValues = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];

    updateFilters({
      [key]: nextValues,
    } as Partial<ShopFilters>);
  }

  function updateMinimumPrice(value: number) {
    updateFilters({
      minPrice: Math.max(0, Math.min(value, filters.maxPrice)),
    });
  }

  function updateMaximumPrice(value: number) {
    updateFilters({
      maxPrice: Math.max(filters.minPrice, Math.min(value, MAX_PRICE_LIMIT)),
    });
  }

  function resetPriceFilter() {
    updateFilters({
      minPrice: 0,
      maxPrice: MAX_PRICE_LIMIT,
    });
  }

  const paginationKey = [
    sort,
    filters.categories.join(","),
    filters.sizes.join(","),
    filters.brands.join(","),
    filters.colors.join(","),
    filters.minPrice,
    filters.maxPrice,
  ].join("-");

  return (
    <section
      aria-labelledby="shop-title"
      className="min-h-screen bg-ivory pb-16 pt-8 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14"
    >
      <div className="mx-auto max-w-[1680px] px-[var(--page-gutter)]">
        <header className="mb-6 text-center sm:mb-7 lg:mb-8">
          <h1
            id="shop-title"
            className="font-[var(--font-cormorant)] text-[clamp(1.8rem,3vw,2.8rem)] font-medium leading-[0.95] tracking-[-0.035em] text-ink"
          >
            Shop All
          </h1>
        </header>

        {/* Controls */}
        <div className="relative mb-6 border-b border-line pb-4 sm:mb-7 sm:pb-5">
          <div className="flex items-center justify-between">
            {/* Sort By - Original UI */}
            <button
              type="button"
              aria-expanded={isSortOpen}
              onClick={() => {
                setIsSortOpen((current) => !current);
                setIsFilterOpen(false);
              }}
              className="flex items-center gap-2 font-[var(--font-manrope)] text-[16px] font-medium text-ink transition-colors hover:text-muted sm:text-[18px]"
            >
              Sort By
              <ChevronDown
                size={26}
                strokeWidth={1.5}
                className={`transition-transform duration-300 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Filter */}
            <button
              type="button"
              aria-expanded={isFilterOpen}
              onClick={() => {
                setIsFilterOpen((current) => !current);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-2 font-[var(--font-manrope)] text-[16px] font-medium text-ink transition-colors hover:text-muted sm:gap-3 sm:text-[18px]"
            >
              <SlidersHorizontal size={20} strokeWidth={1.5} />
              Filter
              {activeFilterCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-ink text-[10px] text-white">
                  {activeFilterCount}
                </span>
              )}
              <ChevronDown
                size={26}
                strokeWidth={1.5}
                className={`transition-transform duration-300 ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Sort Options - Original UI */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              isSortOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
            aria-hidden={!isSortOpen}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="flex flex-wrap gap-x-7 gap-y-4 pt-5 sm:gap-x-9">
                {sortOptions.map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap bg-ivory font-[var(--font-manrope)] text-[18px] font-medium text-ink"
                  >
                    <input
                      type="checkbox"
                      checked={sort === option.value}
                      onChange={() => updateSort(option.value)}
                      tabIndex={isSortOpen ? 0 : -1}
                      className="size-[15px] cursor-pointer accent-[#292823]"
                    />

                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Options - Screenshot Layout */}
          <div
            className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              isFilterOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
            aria-hidden={!isFilterOpen}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="grid grid-cols-1 gap-y-9 bg-ivory pt-6 pb-5 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0">
                {/* Product Type */}
                <div className="min-w-0">
                  <h3 className="mb-8 font-[var(--font-manrope)] text-[17px] font-medium uppercase tracking-[0.075em] text-ink">
                    {filterHeadings.categories}
                  </h3>

                  <div className="flex flex-col gap-[27px]">
                    {filterOptions.categories.map((option) => (
                      <FilterCheckbox
                        key={option}
                        label={option}
                        checked={filters.categories.includes(option)}
                        onChange={() => toggleFilter("categories", option)}
                      />
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="min-w-0">
                  <h3 className="mb-8 font-[var(--font-manrope)] text-[17px] font-medium uppercase tracking-[0.075em] text-ink">
                    {filterHeadings.sizes}
                  </h3>

                  <div className="flex flex-col gap-[27px]">
                    {filterOptions.sizes.map((option) => (
                      <FilterCheckbox
                        key={option}
                        label={option}
                        checked={filters.sizes.includes(option)}
                        onChange={() => toggleFilter("sizes", option)}
                      />
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="min-w-0">
                  <h3 className="mb-8 font-[var(--font-manrope)] text-[17px] font-medium uppercase tracking-[0.075em] text-ink">
                    {filterHeadings.brands}
                  </h3>

                  <div className="flex flex-col gap-[27px]">
                    {filterOptions.brands.map((option) => (
                      <FilterCheckbox
                        key={option}
                        label={option}
                        checked={filters.brands.includes(option)}
                        onChange={() => toggleFilter("brands", option)}
                      />
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="min-w-0">
                  <h3 className="mb-8 font-[var(--font-manrope)] text-[17px] font-medium uppercase tracking-[0.075em] text-ink">
                    PRICE RANGE
                  </h3>

                  <div className="w-full max-w-[260px]">
                    <div className="relative flex h-5 items-center">
                      <div className="absolute h-[5px] w-full rounded-full bg-[#D9D0C2]" />

                      <div
                        className="absolute h-[5px] rounded-full bg-[#303030]"
                        style={{
                          left: `${(filters.minPrice / MAX_PRICE_LIMIT) * 100}%`,
                          right: `${
                            100 - (filters.maxPrice / MAX_PRICE_LIMIT) * 100
                          }%`,
                        }}
                      />

                      <input
                        type="range"
                        min={0}
                        max={MAX_PRICE_LIMIT}
                        step={10}
                        value={filters.minPrice}
                        aria-label="Minimum price"
                        onChange={(event) =>
                          updateMinimumPrice(Number(event.target.value))
                        }
                        className="price-range-thumb pointer-events-none absolute h-5 w-full cursor-pointer appearance-none bg-transparent"
                        style={{ zIndex: 3 }}
                      />

                      <input
                        type="range"
                        min={0}
                        max={MAX_PRICE_LIMIT}
                        step={10}
                        value={filters.maxPrice}
                        aria-label="Maximum price"
                        onChange={(event) =>
                          updateMaximumPrice(Number(event.target.value))
                        }
                        className="price-range-thumb pointer-events-none absolute h-5 w-full cursor-pointer appearance-none bg-transparent"
                        style={{ zIndex: 4 }}
                      />
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={filters.maxPrice}
                        value={filters.minPrice}
                        aria-label="Minimum price amount"
                        onChange={(event) =>
                          updateMinimumPrice(Number(event.target.value) || 0)
                        }
                        className="h-[46px] w-full rounded-[5px] border border-[#dedbd3] bg-white px-2 text-center font-[var(--font-manrope)] text-[14px] text-[#777] outline-none focus:border-[#333]"
                      />

                      <span className="text-[15px] text-muted">-</span>

                      <input
                        type="number"
                        min={filters.minPrice}
                        max={MAX_PRICE_LIMIT}
                        value={filters.maxPrice}
                        aria-label="Maximum price amount"
                        onChange={(event) =>
                          updateMaximumPrice(Number(event.target.value) || 0)
                        }
                        className="h-[46px] w-full rounded-[5px] border border-[#dedbd3] bg-white px-2 text-center font-[var(--font-manrope)] text-[14px] text-[#777] outline-none focus:border-[#333]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={resetPriceFilter}
                      className="mt-4 font-[var(--font-manrope)] text-[13px] font-medium text-muted transition-colors hover:text-ink"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-line pt-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="font-[var(--font-manrope)] text-[13px] font-medium text-muted underline underline-offset-4 transition-colors hover:text-ink"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between">
          <p className="font-[var(--font-manrope)] text-[14px] text-muted">
            {totalProducts} {totalProducts === 1 ? "Piece" : "Pieces"}
          </p>

          <p className="font-[var(--font-manrope)] text-[14px] text-muted">
            {selectedSort}
          </p>
        </div>

        <ShopProductGrid key={paginationKey} products={products} />
      </div>

      <style jsx>{`
        .price-range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          width: 21px;
          height: 21px;
          appearance: none;
          border: none;
          border-radius: 50%;
          background: #303030;
          cursor: grab;
        }

        .price-range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 21px;
          height: 21px;
          border: none;
          border-radius: 50%;
          background: #303030;
          cursor: grab;
        }

        .price-range-thumb::-webkit-slider-runnable-track {
          background: transparent;
        }

        .price-range-thumb::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </section>
  );
}
