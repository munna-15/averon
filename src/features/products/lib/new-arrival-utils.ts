import { products } from "@/data/new-arrivals";

import type {
  Product,
  ProductColorVariant,
  ProductSizeVariant,
} from "@/types/product";

/**
 * Get all published products.
 */
export function getPublishedProducts(): Product[] {
  return products.filter((product) => product.status === "published");
}

/**
 * Get all new arrivals.
 */
export function getNewArrivals(limit?: number): Product[] {
  const newArrivals = getPublishedProducts()
    .filter((product) => product.isNewArrival)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return limit === undefined
    ? newArrivals
    : newArrivals.slice(0, Math.max(0, limit));
}

/**
 * Get featured products.
 */
export function getFeaturedProducts(): Product[] {
  return getPublishedProducts().filter((product) => product.isFeatured);
}

/**
 * Find a product by ID.
 */
export function getProductById(id: string): Product | undefined {
  return getPublishedProducts().find((product) => product.id === id);
}

/**
 * Find a product by slug.
 */
export function getProductBySlug(slug: string): Product | undefined {
  return getPublishedProducts().find((product) => product.slug === slug);
}

/**
 * Get the default color variant.
 */
export function getDefaultColorVariant(
  product: Product,
): ProductColorVariant | undefined {
  return (
    product.colorVariants.find(
      (variant) => variant.id === product.defaultColorId,
    ) ?? product.colorVariants[0]
  );
}

/**
 * Find a color variant by ID.
 */
export function getColorVariant(
  product: Product,
  colorId: string,
): ProductColorVariant | undefined {
  return product.colorVariants.find((variant) => variant.id === colorId);
}

/**
 * Find a size variant within a color.
 */
export function getSizeVariant(
  color: ProductColorVariant,
  size: string,
): ProductSizeVariant | undefined {
  return color.sizes.find(
    (variant) => variant.size.toLowerCase() === size.toLowerCase(),
  );
}

/**
 * Check whether a size is available.
 */
export function isSizeAvailable(
  color: ProductColorVariant,
  size: string,
): boolean {
  const variant = getSizeVariant(color, size);

  if (!variant) return false;

  if (variant.stock !== undefined) {
    return variant.stock > 0;
  }

  return variant.available === true;
}

/**
 * Get available sizes for a color.
 */
export function getAvailableSizes(
  color: ProductColorVariant,
): ProductSizeVariant[] {
  return color.sizes.filter((variant) => {
    if (variant.stock !== undefined) {
      return variant.stock > 0;
    }

    return variant.available === true;
  });
}

/**
 * Get total stock across all color and size variants.
 * Returns undefined when exact stock is unknown.
 */
export function getTotalProductStock(product: Product): number | undefined {
  let total = 0;

  for (const color of product.colorVariants) {
    for (const size of color.sizes) {
      if (size.stock === undefined) {
        return undefined;
      }

      total += Math.max(0, size.stock);
    }
  }

  return total;
}

/**
 * Check whether a product has at least one available size.
 */
export function isProductAvailable(product: Product): boolean {
  return product.colorVariants.some((color) =>
    color.sizes.some((size) => {
      if (size.stock !== undefined) {
        return size.stock > 0;
      }

      return size.available === true;
    }),
  );
}

/**
 * Get product price in major currency units.
 */
export function getProductPrice(product: Product): number {
  return product.price.amount / 100;
}

/**
 * Format product price.
 */
export function formatProductPrice(product: Product): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: product.price.currency,
    maximumFractionDigits: 0,
  }).format(getProductPrice(product));
}
