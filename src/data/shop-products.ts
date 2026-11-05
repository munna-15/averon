import type { Product } from "@/types/product";

const sizes = ["S", "M", "L", "XL"];

export const shopProducts: Product[] = Array.from(
  { length: 30 },
  (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const productId = `shop-product-${number}`;
    const colorId = `${productId}-default`;

    return {
      id: productId,
      slug: `shop-product-${number}`,
      name: `Shop Product ${number}`,
      description: "A considered addition to the AVÉRON collection.",

      price: {
        amount: 0,
        currency: "BDT",
      },

      category: "Clothing",
      collectionIds: [],
      tags: [],

      colorVariants: [
        {
          id: colorId,
          name: "Default",
          slug: "default",
          images: [
            {
              id: `${productId}-image`,
              src: `/images/shop/product-${number}.jpg`,
              alt: `AVÉRON Shop Product ${number}`,
              width: 1200,
              height: 1500,
            },
          ],
          sizes: sizes.map((size) => ({
            id: `${productId}-${size.toLowerCase()}`,
            sku: `${productId.toUpperCase()}-${size}`,
            size,
            stock: 10,
          })),
        },
      ],

      defaultColorId: colorId,

      isNewArrival: false,
      isFeatured: false,

      status: "published",

      createdAt: new Date(2026, 9, 1).toISOString(),
      updatedAt: new Date(2026, 9, 1).toISOString(),
    };
  },
);
