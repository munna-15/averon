import type {
  Product,
  ProductColorVariant,
  ProductImage,
  ProductSizeVariant,
} from "@/types/product";

const sizes = ["S", "M", "L", "XL"] as const;

function createSizes(productId: string): ProductSizeVariant[] {
  return sizes.map((size) => ({
    id: `${productId}-${size.toLowerCase()}`,
    sku: `AV-${productId.toUpperCase()}-${size}`,
    size,
    available: true,
  }));
}

function createProduct(
  id: string,
  slug: string,
  name: string,
  description: string,
  price: number,
  createdAt: string,
): Product {
  const colorId = `${id}-default`;

  const image: ProductImage = {
    id: `${id}-image-01`,
    src: `/images/new-arrivals/${id}.jpg`,
    alt: `${name} by AVÉRON`,
    width: 1200,
    height: 1500,
  };

  const defaultColor: ProductColorVariant = {
    id: colorId,
    name: "Default",
    slug: "default",
    images: [image],
    sizes: createSizes(id),
  };

  return {
    id,
    slug,
    name,
    description,

    price: {
      amount: price,
      currency: "BDT",
    },

    category: "Clothing",
    collectionIds: [],
    tags: [],

    colorVariants: [defaultColor],
    defaultColorId: colorId,

    isNewArrival: true,
    isFeatured: false,
    status: "published",

    createdAt,
    updatedAt: createdAt,
  };
}

export const products: Product[] = [
  createProduct(
    "product-01",
    "everyday-overshirt",
    "Everyday Overshirt",
    "A versatile layer for a considered everyday wardrobe.",
    485000,
    "2026-10-30T10:00:00.000Z",
  ),

  createProduct(
    "product-02",
    "relaxed-form-shirt",
    "Relaxed Form Shirt",
    "An understated silhouette for everyday dressing.",
    395000,
    "2026-10-29T10:00:00.000Z",
  ),

  createProduct(
    "product-03",
    "essential-crew-tee",
    "Essential Crew Tee",
    "A clean everyday wardrobe essential.",
    225000,
    "2026-10-28T10:00:00.000Z",
  ),

  createProduct(
    "product-04",
    "tailored-form-trouser",
    "Tailored Form Trouser",
    "A refined approach to everyday proportions.",
    520000,
    "2026-10-27T10:00:00.000Z",
  ),

  createProduct(
    "product-05",
    "modern-knit-polo",
    "Modern Knit Polo",
    "A contemporary take on a wardrobe classic.",
    365000,
    "2026-10-26T10:00:00.000Z",
  ),

  createProduct(
    "product-06",
    "structured-everyday-jacket",
    "Structured Everyday Jacket",
    "An easy layer with a defined silhouette.",
    690000,
    "2026-10-25T10:00:00.000Z",
  ),

  createProduct(
    "product-07",
    "relaxed-pleat-trouser",
    "Relaxed Pleat Trouser",
    "Comfortable proportions with a considered profile.",
    545000,
    "2026-10-24T10:00:00.000Z",
  ),

  createProduct(
    "product-08",
    "lightweight-layer-shirt",
    "Lightweight Layer Shirt",
    "A versatile addition to a modern wardrobe.",
    425000,
    "2026-10-23T10:00:00.000Z",
  ),

  createProduct(
    "product-09",
    "modern-collar-shirt",
    "Modern Collar Shirt",
    "A clean silhouette designed for effortless styling.",
    445000,
    "2026-10-22T10:00:00.000Z",
  ),

  createProduct(
    "product-10",
    "relaxed-tapered-trouser",
    "Relaxed Tapered Trouser",
    "A balanced everyday silhouette with relaxed proportions.",
    495000,
    "2026-10-21T10:00:00.000Z",
  ),

  createProduct(
    "product-11",
    "minimal-zip-jacket",
    "Minimal Zip Jacket",
    "A refined outer layer with understated detailing.",
    725000,
    "2026-10-20T10:00:00.000Z",
  ),

  createProduct(
    "product-12",
    "everyday-structured-tee",
    "Everyday Structured Tee",
    "An elevated essential for a modern wardrobe.",
    255000,
    "2026-10-19T10:00:00.000Z",
  ),

  createProduct(
    "product-13",
    "classic-knit-layer",
    "Classic Knit Layer",
    "A versatile knit layer with a considered profile.",
    575000,
    "2026-10-18T10:00:00.000Z",
  ),

  createProduct(
    "product-14",
    "modern-straight-trouser",
    "Modern Straight Trouser",
    "A timeless straight silhouette for everyday wear.",
    515000,
    "2026-10-17T10:00:00.000Z",
  ),

  createProduct(
    "product-15",
    "refined-polo-shirt",
    "Refined Polo Shirt",
    "A contemporary wardrobe staple with clean proportions.",
    385000,
    "2026-10-16T10:00:00.000Z",
  ),

  createProduct(
    "product-16",
    "lightweight-overshirt",
    "Lightweight Overshirt",
    "An adaptable layer for a considered everyday wardrobe.",
    465000,
    "2026-10-15T10:00:00.000Z",
  ),
];
