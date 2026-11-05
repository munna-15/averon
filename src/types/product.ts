export interface Money {
  amount: number;
  currency: string;
}

export interface ProductImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductSizeVariant {
  id: string;
  sku: string;
  size: string;
  stock?: number;
  available?: boolean;
}

export interface ProductColorVariant {
  id: string;
  name: string;
  slug: string;
  hex?: string;
  images: ProductImage[];
  sizes: ProductSizeVariant[];
}

export type ProductStatus = "draft" | "published" | "archived";

export interface ProductDetails {
  material?: string;
  fabric?: string;
  fit?: string;
  careInstructions?: string[];
  features?: string[];
}

export interface ProductSEO {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  description: string;

  price: Money;
  compareAtPrice?: Money;

  category: string;
  collectionIds: string[];
  tags: string[];

  colorVariants: ProductColorVariant[];
  defaultColorId: string;

  details?: ProductDetails;

  isNewArrival: boolean;
  isFeatured: boolean;

  status: ProductStatus;

  seo?: ProductSEO;

  createdAt: string;
  updatedAt: string;
}
