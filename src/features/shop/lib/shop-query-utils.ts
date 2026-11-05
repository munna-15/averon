import type { ShopFilters, ShopSortOption } from "@/features/shop/types/shop";

export const DEFAULT_SHOP_FILTERS: ShopFilters = {
  categories: [],
  sizes: [],
  colors: [],
  brands: [],
  minPrice: 0,
  maxPrice: 10000,
};

export const DEFAULT_SHOP_SORT: ShopSortOption = "default";

const VALID_SORT_OPTIONS: ShopSortOption[] = [
  "default",
  "newest",
  "oldest",
  "price-low-to-high",
  "price-high-to-low",
];

function parsePrice(value: string | null, fallback: number): number {
  if (value === null || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseList(searchParams: URLSearchParams, key: string): string[] {
  return [
    ...new Set(
      searchParams
        .getAll(key)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

export function parseShopQuery(searchParams: URLSearchParams): {
  filters: ShopFilters;
  sort: ShopSortOption;
} {
  const sortValue = searchParams.get("sort") as ShopSortOption | null;

  return {
    filters: {
      categories: parseList(searchParams, "category"),
      sizes: parseList(searchParams, "size"),
      colors: parseList(searchParams, "color"),
      brands: parseList(searchParams, "brand"),
      minPrice: parsePrice(
        searchParams.get("minPrice"),
        DEFAULT_SHOP_FILTERS.minPrice,
      ),
      maxPrice: parsePrice(
        searchParams.get("maxPrice"),
        DEFAULT_SHOP_FILTERS.maxPrice,
      ),
    },
    sort:
      sortValue && VALID_SORT_OPTIONS.includes(sortValue)
        ? sortValue
        : DEFAULT_SHOP_SORT,
  };
}

export function buildShopQuery(
  filters: ShopFilters,
  sort: ShopSortOption,
): string {
  const params = new URLSearchParams();

  filters.categories.forEach((value) => params.append("category", value));
  filters.sizes.forEach((value) => params.append("size", value));
  filters.colors.forEach((value) => params.append("color", value));
  filters.brands.forEach((value) => params.append("brand", value));

  if (filters.minPrice !== DEFAULT_SHOP_FILTERS.minPrice) {
    params.set("minPrice", String(filters.minPrice));
  }

  if (filters.maxPrice !== DEFAULT_SHOP_FILTERS.maxPrice) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (sort !== DEFAULT_SHOP_SORT) {
    params.set("sort", sort);
  }

  return params.toString();
}
