import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  getProductBySlug,
  getPublishedProducts,
} from "@/features/products/lib/new-arrival-utils";

import {
  getShopProductBySlug,
  getShopProducts,
} from "@/features/shop/lib/shop-utils";

import ProductDetailsPage from "@/features/product-details/ProductDetailsPage";

import type { Product } from "@/types/product";

type ProductRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductCatalogueResult = {
  product: Product;
  catalogueProducts: Product[];
};

function getProductFromCatalogues(
  slug: string,
): ProductCatalogueResult | undefined {
  const shopProduct = getShopProductBySlug(slug);

  if (shopProduct) {
    return {
      product: shopProduct,
      catalogueProducts: getShopProducts(),
    };
  }

  const newArrivalProduct = getProductBySlug(slug);

  if (newArrivalProduct) {
    return {
      product: newArrivalProduct,
      catalogueProducts: getPublishedProducts(),
    };
  }

  return undefined;
}

export function generateStaticParams() {
  const newArrivalProducts = getPublishedProducts();
  const shopProducts = getShopProducts();

  const productsBySlug = new Map<string, Product>();

  [...newArrivalProducts, ...shopProducts].forEach((product) => {
    productsBySlug.set(product.slug, product);
  });

  return Array.from(productsBySlug.keys()).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: ProductRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const result = getProductFromCatalogues(slug);

  if (!result) {
    return {
      title: "Product Not Found | AVÉRON",
    };
  }

  return {
    title: `${result.product.name} | AVÉRON`,
    description: result.product.description,
  };
}

function ProductDetailsFallback() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading product details"
      className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10"
    >
      <div className="grid gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="aspect-[4/5] animate-pulse bg-[#E9E4DC]" />

        <div className="space-y-7 pt-4">
          <div className="h-3 w-24 animate-pulse bg-[#E9E4DC]" />
          <div className="h-10 w-3/4 animate-pulse bg-[#E9E4DC]" />
          <div className="h-5 w-28 animate-pulse bg-[#E9E4DC]" />

          <div className="space-y-3 pt-5">
            <div className="h-3 w-full animate-pulse bg-[#E9E4DC]" />
            <div className="h-3 w-4/5 animate-pulse bg-[#E9E4DC]" />
          </div>

          <div className="h-20 w-full animate-pulse bg-[#E9E4DC]" />
          <div className="h-12 w-full animate-pulse bg-[#E9E4DC]" />
        </div>
      </div>
    </div>
  );
}

async function ProductRouteContent({ params }: ProductRouteProps) {
  const { slug } = await params;
  const result = getProductFromCatalogues(slug);

  if (!result) {
    notFound();
  }

  return (
    <ProductDetailsPage
      product={result.product}
      catalogueProducts={result.catalogueProducts}
    />
  );
}

export default function ProductRoute({ params }: ProductRouteProps) {
  return (
    <Suspense fallback={<ProductDetailsFallback />}>
      <ProductRouteContent params={params} />
    </Suspense>
  );
}
