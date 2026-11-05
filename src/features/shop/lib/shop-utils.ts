import { shopProducts } from "@/data/shop-products";

import type { Product } from "@/types/product";

export function getShopProducts(): Product[] {
  return shopProducts.filter((product) => product.status === "published");
}

export function getShopProductBySlug(slug: string): Product | undefined {
  return getShopProducts().find((product) => product.slug === slug);
}

export function getShopProductById(id: string): Product | undefined {
  return getShopProducts().find((product) => product.id === id);
}
