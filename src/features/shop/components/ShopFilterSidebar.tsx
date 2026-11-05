"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";

import type { ShopFilters } from "@/features/shop/types/shop";

interface ShopColorOption {
  name: string;
  slug: string;
  hex?: string;
}

interface ShopFilterSidebarProps {
  filters: ShopFilters;
  sizes: string[];
  colors: ShopColorOption[];
  priceRange: {
    min: number;
    max: number;
  };
  onFiltersChange: (filters: Partial<ShopFilters>) => void;
  onClear: () => void;
}

export function ShopFilterSidebar({
  filters,
  sizes,
  colors,
  priceRange,
  onFiltersChange,
  onClear,
}: ShopFilterSidebarProps) {
  const [openSections, setOpenSections] = useState({
    price: true,
    size: true,
    color: true,
  });

  function toggleSection(section: keyof typeof openSections) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  function toggleValue(key: "sizes" | "colors", value: string) {
    const current = filters[key];

    const updated = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    onFiltersChange({ [key]: updated });
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.minPrice !== priceRange.min ||
    filters.maxPrice !== priceRange.max ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0;

  function sectionHeader(label: string, section: keyof typeof openSections) {
    return (
      <button
        type="button"
        onClick={() => toggleSection(section)}
        aria-expanded={openSections[section]}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-[var(--font-manrope)] text-[12px] font-semibold text-[#292721]">
          {label}
        </span>

        <ChevronDown
          size={15}
          strokeWidth={1.6}
          className={`text-[#777168] transition-transform duration-200 ${
            openSections[section] ? "rotate-180" : ""
          }`}
        />
      </button>
    );
  }

  return (
    <aside className="w-full">
      <div className="flex items-center justify-between border-b border-[#E8E4DD] pb-4">
        <h2 className="font-[var(--font-manrope)] text-[13px] font-semibold text-[#292721]">
          Filters
        </h2>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1.5 font-[var(--font-manrope)] text-[11px] font-medium text-[#82796F] transition-colors hover:text-[#292721]"
          >
            <RotateCcw size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Price Range */}
      <section className="border-b border-[#E8E4DD]">
        {sectionHeader("Price Range", "price")}

        {openSections.price && (
          <div className="grid grid-cols-2 gap-3 pb-5">
            <label className="block">
              <span className="mb-2 block font-[var(--font-manrope)] text-[10px] text-[#82796F]">
                Minimum
              </span>

              <input
                type="number"
                min={priceRange.min}
                max={filters.maxPrice}
                value={filters.minPrice}
                placeholder={String(priceRange.min)}
                onChange={(event) => {
                  const value = event.target.value;
                  const nextValue =
                    value === ""
                      ? priceRange.min
                      : Math.max(
                          priceRange.min,
                          Math.min(Number(value), filters.maxPrice),
                        );

                  onFiltersChange({
                    minPrice: nextValue,
                  });
                }}
                className="h-10 w-full rounded-sm border border-[#E5E0D8] bg-transparent px-3 font-[var(--font-manrope)] text-[12px] text-[#292721] outline-none transition-colors focus:border-[#81786C]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block font-[var(--font-manrope)] text-[10px] text-[#82796F]">
                Maximum
              </span>

              <input
                type="number"
                min={filters.minPrice}
                max={priceRange.max}
                value={filters.maxPrice}
                placeholder={String(priceRange.max)}
                onChange={(event) => {
                  const value = event.target.value;
                  const nextValue =
                    value === ""
                      ? priceRange.max
                      : Math.min(
                          priceRange.max,
                          Math.max(Number(value), filters.minPrice),
                        );

                  onFiltersChange({
                    maxPrice: nextValue,
                  });
                }}
                className="h-10 w-full rounded-sm border border-[#E5E0D8] bg-transparent px-3 font-[var(--font-manrope)] text-[12px] text-[#292721] outline-none transition-colors focus:border-[#81786C]"
              />
            </label>
          </div>
        )}
      </section>

      {/* Size */}
      <section className="border-b border-[#E8E4DD]">
        {sectionHeader("Size", "size")}

        {openSections.size && (
          <div className="flex flex-wrap gap-2 pb-5">
            {sizes.map((size) => {
              const active = filters.sizes.includes(size);

              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleValue("sizes", size)}
                  className={`grid h-9 min-w-10 place-items-center rounded-sm border px-3 font-[var(--font-manrope)] text-[11px] font-medium transition-colors ${
                    active
                      ? "border-[#292721] bg-[#292721] text-white"
                      : "border-[#E5E0D8] text-[#625D55] hover:border-[#82796F]"
                  }`}
                >
                  {size}
                </button>
              );
            })}

            {sizes.length === 0 && (
              <p className="text-[11px] text-[#91897E]">No sizes available</p>
            )}
          </div>
        )}
      </section>

      {/* Color */}
      <section className="border-b border-[#E8E4DD]">
        {sectionHeader("Color", "color")}

        {openSections.color && (
          <div className="space-y-3 pb-5">
            {colors.map((color) => {
              const active = filters.colors.includes(color.slug);

              return (
                <button
                  key={color.slug}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleValue("colors", color.slug)}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                      active
                        ? "border-[#292721] ring-1 ring-[#292721] ring-offset-2"
                        : "border-[#D8D2C8]"
                    }`}
                    style={{
                      backgroundColor: color.hex || "#E5E0D8",
                    }}
                  />

                  <span className="font-[var(--font-manrope)] text-[11px] text-[#625D55]">
                    {color.name}
                  </span>
                </button>
              );
            })}

            {colors.length === 0 && (
              <p className="text-[11px] text-[#91897E]">No colors available</p>
            )}
          </div>
        )}
      </section>
    </aside>
  );
}
