"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

import ProductCard from "@/components/product/ProductCard";
import { getNewArrivals } from "@/features/products/lib/new-arrival-utils";
import type { Product } from "@/types/product";

const BATCH_SIZE = 12;
const MAX_PRICE_LIMIT = 10000;

type ProductSortOption =
  | "default"
  | "newest"
  | "oldest"
  | "price-low-to-high"
  | "price-high-to-low";

type FilterKey = "categories" | "sizes" | "brands";

const sortOptions: {
  label: string;
  value: ProductSortOption;
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

const filterHeadings: Record<FilterKey, string> = {
  categories: "PRODUCT TYPE",
  sizes: "SIZES",
  brands: "BRANDS",
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function FilterCheckbox({
  label,
  checked,
  onChange,
  tabIndex,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  tabIndex: number;
}) {
  return (
    <label className="flex w-fit cursor-pointer items-center gap-[22px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        tabIndex={tabIndex}
        className="size-[22px] shrink-0 cursor-pointer appearance-none border border-[#171717] bg-transparent checked:bg-[#292823] checked:bg-[linear-gradient(45deg,transparent_43%,white_43%,white_51%,transparent_51%),linear-gradient(-45deg,transparent_43%,white_43%,white_51%,transparent_51%)] checked:bg-center checked:bg-no-repeat checked:bg-[length:12px_12px]"
      />

      <span className="font-[var(--font-manrope)] text-[16px] font-normal uppercase tracking-[0.075em] text-[#171717]">
        {label}
      </span>
    </label>
  );
}

function ProductSkeleton() {
  return (
    <div className="min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-[#E9E4DC]">
        <div className="absolute inset-0 -translate-x-full animate-[product-shimmer_1.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent motion-reduce:animate-none" />
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 sm:pt-4">
        <div className="h-3 w-2/5 rounded-sm bg-[#E9E4DC]" />
        <div className="h-3 w-1/5 rounded-sm bg-[#E9E4DC]" />
      </div>
    </div>
  );
}

function ProductGrid({
  products,
}: {
  products: ReturnType<typeof getNewArrivals>;
}) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  const loaderRef = useRef<HTMLDivElement>(null);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMore = visibleCount < products.length;

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const element = loaderRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          setIsLoading(true);
        }
      },
      {
        rootMargin: "500px 0px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasMore, isLoading, visibleCount]);

  useEffect(() => {
    if (!isLoading) return;

    const timeout = window.setTimeout(() => {
      setVisibleCount((current) =>
        Math.min(current + BATCH_SIZE, products.length),
      );
      setIsLoading(false);
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [isLoading, products.length]);

  if (visibleProducts.length === 0) {
    return (
      <div className="py-24 text-center sm:py-32">
        <h2 className="font-[var(--font-cormorant)] text-3xl text-ink sm:text-4xl">
          No products found
        </h2>

        <p className="mt-3 font-[var(--font-manrope)] text-[14px] text-muted">
          Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14">
        {visibleProducts.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}

        {isLoading &&
          Array.from({
            length: Math.min(BATCH_SIZE, products.length - visibleCount),
          }).map((_, index) => <ProductSkeleton key={`skeleton-${index}`} />)}
      </div>

      {hasMore && <div ref={loaderRef} aria-hidden="true" className="h-10" />}
    </>
  );
}

function matchesProductFilters(
  product: Product,
  filters: {
    categories: string[];
    sizes: string[];
    brands: string[];
    minPrice: number;
    maxPrice: number;
  },
) {
  const price = product.price.amount / 100;

  if (price < filters.minPrice || price > filters.maxPrice) {
    return false;
  }

  if (
    filters.categories.length > 0 &&
    !filters.categories.some(
      (category) => normalize(product.category) === normalize(category),
    )
  ) {
    return false;
  }

  if (
    filters.brands.length > 0 &&
    !filters.brands.some(
      (brand) =>
        typeof product.brand === "string" &&
        normalize(product.brand) === normalize(brand),
    )
  ) {
    return false;
  }

  if (filters.sizes.length > 0) {
    const hasMatchingSize = product.colorVariants.some((variant) =>
      variant.sizes.some(
        (size) =>
          filters.sizes.some(
            (selectedSize) => normalize(size.size) === normalize(selectedSize),
          ) &&
          size.available !== false &&
          (size.stock === undefined || size.stock > 0),
      ),
    );

    if (!hasMatchingSize) return false;
  }

  return true;
}

function sortProducts(
  products: Product[],
  sortBy: ProductSortOption,
): Product[] {
  const sorted = [...products];

  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

    case "price-low-to-high":
      return sorted.sort((a, b) => a.price.amount - b.price.amount);

    case "price-high-to-low":
      return sorted.sort((a, b) => b.price.amount - a.price.amount);

    case "default":
    default:
      return sorted;
  }
}

export default function NewArrivalsPage() {
  const products = useMemo(() => getNewArrivals(), []);

  const [sortBy, setSortBy] = useState<ProductSortOption>("default");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE_LIMIT);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) =>
      matchesProductFilters(product, {
        categories: selectedCategories,
        sizes: selectedSizes,
        brands: selectedBrands,
        minPrice,
        maxPrice,
      }),
    );

    return sortProducts(filtered, sortBy);
  }, [
    products,
    sortBy,
    selectedCategories,
    selectedSizes,
    selectedBrands,
    minPrice,
    maxPrice,
  ]);

  const selectedSort =
    sortOptions.find((option) => option.value === sortBy)?.label ??
    "Default Sorting";

  const activeFilterCount =
    selectedCategories.length +
    selectedSizes.length +
    selectedBrands.length +
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < MAX_PRICE_LIMIT ? 1 : 0);

  function toggleFilter(key: FilterKey, value: string) {
    const setters = {
      categories: setSelectedCategories,
      sizes: setSelectedSizes,
      brands: setSelectedBrands,
    };

    const currentValues = {
      categories: selectedCategories,
      sizes: selectedSizes,
      brands: selectedBrands,
    };

    const current = currentValues[key];

    setters[key](
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function updateMinimumPrice(value: number) {
    setMinPrice(Math.max(0, Math.min(value, maxPrice)));
  }

  function updateMaximumPrice(value: number) {
    setMaxPrice(Math.max(minPrice, Math.min(value, MAX_PRICE_LIMIT)));
  }

  function resetPriceFilter() {
    setMinPrice(0);
    setMaxPrice(MAX_PRICE_LIMIT);
  }

  function clearAllFilters() {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    resetPriceFilter();
  }

  const paginationKey = [
    sortBy,
    selectedCategories.join(","),
    selectedSizes.join(","),
    selectedBrands.join(","),
    minPrice,
    maxPrice,
  ].join("-");

  return (
    <section
      aria-labelledby="new-arrivals-title"
      className="min-h-screen bg-[#fff] pb-16 pt-8 sm:pb-20 sm:pt-12 lg:pb-24 lg:pt-14"
    >
      <div className="mx-auto max-w-[1680px] px-[var(--page-gutter)]">
        <header className="mb-6 text-center sm:mb-7 lg:mb-8">
          <h1
            id="new-arrivals-title"
            className="font-[var(--font-cormorant)] text-[clamp(1.8rem,3vw,2.8rem)] font-medium leading-[0.95] tracking-[-0.035em] text-ink"
          >
            New Arrivals
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
                      checked={sortBy === option.value}
                      onChange={() => setSortBy(option.value)}
                      tabIndex={isSortOpen ? 0 : -1}
                      className="size-[15px] cursor-pointer accent-[#292823]"
                    />

                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Filter Options - Four Column Layout */}
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
                        checked={selectedCategories.includes(option)}
                        onChange={() => toggleFilter("categories", option)}
                        tabIndex={isFilterOpen ? 0 : -1}
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
                        checked={selectedSizes.includes(option)}
                        onChange={() => toggleFilter("sizes", option)}
                        tabIndex={isFilterOpen ? 0 : -1}
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
                        checked={selectedBrands.includes(option)}
                        onChange={() => toggleFilter("brands", option)}
                        tabIndex={isFilterOpen ? 0 : -1}
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
                          left: `${(minPrice / MAX_PRICE_LIMIT) * 100}%`,
                          right: `${100 - (maxPrice / MAX_PRICE_LIMIT) * 100}%`,
                        }}
                      />

                      <input
                        type="range"
                        min={0}
                        max={MAX_PRICE_LIMIT}
                        step={10}
                        value={minPrice}
                        aria-label="Minimum price"
                        tabIndex={isFilterOpen ? 0 : -1}
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
                        value={maxPrice}
                        aria-label="Maximum price"
                        tabIndex={isFilterOpen ? 0 : -1}
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
                        max={maxPrice}
                        value={minPrice}
                        aria-label="Minimum price amount"
                        tabIndex={isFilterOpen ? 0 : -1}
                        onChange={(event) =>
                          updateMinimumPrice(Number(event.target.value) || 0)
                        }
                        className="h-[46px] w-full rounded-[5px] border border-[#dedbd3] bg-white px-2 text-center font-[var(--font-manrope)] text-[14px] text-[#777] outline-none focus:border-[#333]"
                      />

                      <span className="text-[15px] text-muted">-</span>

                      <input
                        type="number"
                        min={minPrice}
                        max={MAX_PRICE_LIMIT}
                        value={maxPrice}
                        aria-label="Maximum price amount"
                        tabIndex={isFilterOpen ? 0 : -1}
                        onChange={(event) =>
                          updateMaximumPrice(Number(event.target.value) || 0)
                        }
                        className="h-[46px] w-full rounded-[5px] border border-[#dedbd3] bg-white px-2 text-center font-[var(--font-manrope)] text-[14px] text-[#777] outline-none focus:border-[#333]"
                      />
                    </div>

                    <button
                      type="button"
                      tabIndex={isFilterOpen ? 0 : -1}
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
                  tabIndex={isFilterOpen ? 0 : -1}
                  onClick={clearAllFilters}
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
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "Piece" : "Pieces"}
          </p>

          <p className="font-[var(--font-manrope)] text-[14px] text-muted">
            {selectedSort}
          </p>
        </div>

        <ProductGrid key={paginationKey} products={filteredProducts} />
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
