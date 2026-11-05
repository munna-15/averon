import type { Product } from "@/types/product";

import { isSizeAvailable } from "./new-arrival-utils";

export type ProductSortOption =
  | "default"
  | "newest"
  | "oldest"
  | "price-low-to-high"
  | "price-high-to-low";

export interface ProductFilters {
  categories?: string[];
  colors?: string[];
  sizes?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sortBy?: ProductSortOption;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesCategory(product: Product, categories: string[]): boolean {
  if (categories.length === 0) return true;

  return categories.some(
    (category) => normalize(product.category) === normalize(category),
  );
}

function matchesColorAndSize(
  product: Product,
  colors: string[],
  sizes: string[],
): boolean {
  if (colors.length === 0 && sizes.length === 0) {
    return true;
  }

  return product.colorVariants.some((variant) => {
    const matchesColor =
      colors.length === 0 ||
      colors.some(
        (color) =>
          normalize(variant.name) === normalize(color) ||
          normalize(variant.slug) === normalize(color),
      );

    const matchesSize =
      sizes.length === 0 ||
      sizes.some((size) => isSizeAvailable(variant, size));

    return matchesColor && matchesSize;
  });
}

function matchesPrice(
  product: Product,
  minPrice?: number,
  maxPrice?: number,
): boolean {
  const amount = product.price.amount;

  if (minPrice !== undefined && amount < minPrice) {
    return false;
  }

  if (maxPrice !== undefined && amount > maxPrice) {
    return false;
  }

  return true;
}

function matchesStock(product: Product): boolean {
  return product.colorVariants.some((variant) =>
    variant.sizes.some((size) => isSizeAvailable(variant, size.size)),
  );
}

export function sortProducts(
  products: Product[],
  sortBy: ProductSortOption = "default",
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

export function filterProducts(
  products: Product[],
  filters: ProductFilters = {},
): Product[] {
  const {
    categories = [],
    colors = [],
    sizes = [],
    minPrice,
    maxPrice,
    inStockOnly = false,
    sortBy = "default",
  } = filters;

  const filtered = products.filter((product) => {
    if (!matchesCategory(product, categories)) return false;

    if (!matchesColorAndSize(product, colors, sizes)) return false;

    if (!matchesPrice(product, minPrice, maxPrice)) return false;

    if (inStockOnly && !matchesStock(product)) return false;

    return true;
  });

  return sortProducts(filtered, sortBy);
}
