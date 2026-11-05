import { getShopProducts } from "@/features/shop/lib/shop-utils";

export function getShopSizes(): string[] {
  const sizes = getShopProducts().flatMap((product) =>
    product.colorVariants.flatMap((color) =>
      color.sizes
        .filter((size) =>
          size.stock !== undefined ? size.stock > 0 : size.available === true,
        )
        .map((size) => size.size),
    ),
  );

  return [...new Set(sizes)].sort((a, b) => {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

    const aIndex = order.indexOf(a.toUpperCase());
    const bIndex = order.indexOf(b.toUpperCase());

    if (aIndex === -1 && bIndex === -1) {
      return a.localeCompare(b);
    }

    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;

    return aIndex - bIndex;
  });
}

export function getShopColors(): {
  name: string;
  slug: string;
  hex?: string;
}[] {
  const colors = getShopProducts().flatMap((product) =>
    product.colorVariants.map((color) => ({
      name: color.name,
      slug: color.slug,
      hex: color.hex,
    })),
  );

  return Array.from(
    new Map(colors.map((color) => [color.slug, color])).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));
}

export function getShopPriceRange(): {
  min: number;
  max: number;
} {
  const prices = getShopProducts().map((product) => product.price.amount / 100);

  if (prices.length === 0) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
