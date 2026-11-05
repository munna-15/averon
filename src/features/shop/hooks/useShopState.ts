"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type { ShopFilters, ShopSortOption } from "@/features/shop/types/shop";

import {
  buildShopQuery,
  DEFAULT_SHOP_FILTERS,
  DEFAULT_SHOP_SORT,
  parseShopQuery,
} from "@/features/shop/lib/shop-query-utils";

export function useShopState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(
    () => parseShopQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const updateState = useCallback(
    (filters: ShopFilters, sort: ShopSortOption) => {
      const query = buildShopQuery(filters, sort);
      const url = query ? `${pathname}?${query}` : pathname;

      router.replace(url, { scroll: false });
    },
    [pathname, router],
  );

  const updateFilters = useCallback(
    (updates: Partial<ShopFilters>) => {
      updateState({ ...state.filters, ...updates }, state.sort);
    },
    [state, updateState],
  );

  const updateSort = useCallback(
    (sort: ShopSortOption) => {
      updateState(state.filters, sort);
    },
    [state, updateState],
  );

  const clearFilters = useCallback(() => {
    updateState(DEFAULT_SHOP_FILTERS, DEFAULT_SHOP_SORT);
  }, [updateState]);

  return {
    filters: state.filters,
    sort: state.sort,
    updateFilters,
    updateSort,
    clearFilters,
  };
}
