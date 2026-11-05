"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { WishlistItem } from "@/types/wishlist";

const STORAGE_KEY = "averon-wishlist";

interface WishlistContextValue {
  items: WishlistItem[];
  count: number;
  hydrated: boolean;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  removeWishlistItem: (productId: string) => void;
  clearWishlist: () => void;
}

interface WishlistSnapshot {
  items: WishlistItem[];
  hydrated: boolean;
}

const SERVER_SNAPSHOT: WishlistSnapshot = {
  items: [],
  hydrated: false,
};

let snapshot: WishlistSnapshot = SERVER_SNAPSHOT;
let initialized = false;

const listeners = new Set<() => void>();

const WishlistContext = createContext<WishlistContextValue | null>(null);

function isWishlistItem(value: unknown): value is WishlistItem {
  if (typeof value !== "object" || value === null) return false;

  const item = value as Record<string, unknown>;

  return typeof item.productId === "string" && typeof item.addedAt === "string";
}

function readWishlist(): WishlistItem[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isWishlistItem);
  } catch {
    return [];
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function updateWishlist(items: WishlistItem[], persist = true) {
  snapshot = {
    items,
    hydrated: true,
  };

  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Wishlist remains available for the current session.
    }
  }

  notifyListeners();
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;

  updateWishlist(readWishlist(), false);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (typeof window !== "undefined") {
    if (!initialized) {
      initialized = true;
      snapshot = {
        items: readWishlist(),
        hydrated: true,
      };

      notifyListeners();
    }

    window.addEventListener("storage", handleStorageChange);
  }

  return () => {
    listeners.delete(listener);

    if (typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const currentSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const { items, hydrated } = currentSnapshot;

  const productIds = useMemo(
    () => new Set(items.map((item) => item.productId)),
    [items],
  );

  const isWishlisted = useCallback(
    (productId: string) => productIds.has(productId),
    [productIds],
  );

  const toggleWishlist = useCallback((productId: string) => {
    const exists = snapshot.items.some((item) => item.productId === productId);

    if (exists) {
      updateWishlist(
        snapshot.items.filter((item) => item.productId !== productId),
      );

      return;
    }

    updateWishlist([
      ...snapshot.items,
      {
        productId,
        addedAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const removeWishlistItem = useCallback((productId: string) => {
    updateWishlist(
      snapshot.items.filter((item) => item.productId !== productId),
    );
  }, []);

  const clearWishlist = useCallback(() => {
    updateWishlist([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      hydrated,
      isWishlisted,
      toggleWishlist,
      removeWishlistItem,
      clearWishlist,
    }),
    [
      items,
      hydrated,
      isWishlisted,
      toggleWishlist,
      removeWishlistItem,
      clearWishlist,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider.");
  }

  return context;
}
