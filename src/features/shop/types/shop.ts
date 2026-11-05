export interface ShopCategory {
  id: string;
  slug: string;
  label: string;
}

export type ShopSortOption =
  | "default"
  | "newest"
  | "oldest"
  | "price-low-to-high"
  | "price-high-to-low";

export interface ShopFilters {
  categories: string[];
  sizes: string[];
  colors: string[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
}

export interface ShopFilterState {
  filters: ShopFilters;
  sort: ShopSortOption;
}
