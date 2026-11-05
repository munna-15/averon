import { shopProducts } from "@/data/shop-products";
import { products as newArrivalProducts } from "@/data/new-arrivals";

import type { Product } from "@/types/product";

export interface SearchResult {
  product: Product;
  image: string;
  imageAlt: string;
}

function getProductImage(product: Product): {
  image: string;
  imageAlt: string;
} {
  const defaultVariant = product.colorVariants.find(
    (variant) => variant.id === product.defaultColorId,
  );

  const image =
    defaultVariant?.images[0] ??
    product.colorVariants.find((variant) => variant.images.length > 0)
      ?.images[0];

  return {
    image: image?.src ?? "",
    imageAlt: image?.alt ?? product.name,
  };
}

export function getSearchableProducts(): Product[] {
  const uniqueProducts = new Map<string, Product>();

  for (const product of [...newArrivalProducts, ...shopProducts]) {
    if (product.status !== "published") continue;

    if (!uniqueProducts.has(product.id)) {
      uniqueProducts.set(product.id, product);
    }
  }

  return Array.from(uniqueProducts.values());
}

export function searchProducts(query: string): SearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return [];

  const searchableProducts = getSearchableProducts();

  return searchableProducts
    .map((product) => {
      const searchableFields = [
        product.name,
        product.slug,
        product.description,
        product.category,
        ...product.collectionIds,
        ...product.tags,
        ...product.colorVariants.flatMap((variant) => [
          variant.name,
          variant.slug,
          ...variant.sizes.map((size) => size.sku),
          ...variant.sizes.map((size) => size.size),
        ]),
      ];

      const matched = searchableFields.some((field) =>
        field.toLowerCase().includes(normalizedQuery),
      );

      if (!matched) return null;

      return {
        product,
        ...getProductImage(product),
      };
    })
    .filter((result): result is SearchResult => result !== null);
}
