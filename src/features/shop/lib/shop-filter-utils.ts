import type { ShopFilters, ShopSortOption } from "@/features/shop/types/shop";
import type { Product } from "@/types/product";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesCategory(product: Product, categories: string[]): boolean {
  if (categories.length === 0) return true;

  return categories.some(
    (category) => normalize(product.category) === normalize(category),
  );
}

function matchesBrand(product: Product, brands: string[]): boolean {
  if (brands.length === 0) return true;

  const brand = "brand" in product ? product.brand : undefined;

  return (
    typeof brand === "string" &&
    brands.some((value) => normalize(value) === normalize(brand))
  );
}

function matchesVariants(
  product: Product,
  colors: string[],
  sizes: string[],
): boolean {
  if (colors.length === 0 && sizes.length === 0) return true;

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
      variant.sizes.some(
        (size) =>
          sizes.some((value) => normalize(value) === normalize(size.size)) &&
          (size.stock !== undefined
            ? size.stock > 0
            : size.available !== false),
      );

    return matchesColor && matchesSize;
  });
}

export function filterShopProducts(
  products: Product[],
  filters: ShopFilters,
): Product[] {
  const { categories, sizes, colors, brands, minPrice, maxPrice } = filters;

  return products.filter((product) => {
    const price = product.price.amount / 100;

    if (!matchesCategory(product, categories)) return false;
    if (!matchesBrand(product, brands)) return false;
    if (!matchesVariants(product, colors, sizes)) return false;
    if (price < minPrice || price > maxPrice) return false;

    return true;
  });
}

export function sortShopProducts(
  products: Product[],
  sortBy: ShopSortOption = "default",
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
