"use client";

import { useMemo } from "react";

import { useShopState } from "@/features/shop/hooks/useShopState";
import {
  filterShopProducts,
  sortShopProducts,
} from "@/features/shop/lib/shop-filter-utils";
import { getShopProducts } from "@/features/shop/lib/shop-utils";

export function useShopProducts() {
  const { filters, sort, updateFilters, updateSort, clearFilters } =
    useShopState();

  const products = useMemo(() => {
    const catalogue = getShopProducts();
    const filtered = filterShopProducts(catalogue, filters);

    return sortShopProducts(filtered, sort);
  }, [filters, sort]);

  return {
    products,
    totalProducts: products.length,
    filters,
    sort,
    updateFilters,
    updateSort,
    clearFilters,
  };
}
