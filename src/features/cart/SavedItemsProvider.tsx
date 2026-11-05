"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

import type { ReactNode } from "react";

import type { CartLine, CartSnapshot } from "@/types/cart";
import { useCart } from "@/features/cart/CartProvider";

const STORAGE_KEY = "averon-saved-items";

const EMPTY_ITEMS: CartLine[] = [];

const SERVER_SNAPSHOT: CartSnapshot = {
  items: EMPTY_ITEMS,
  hydrated: false,
};

let snapshot: CartSnapshot = SERVER_SNAPSHOT;

const listeners = new Set<() => void>();

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.key === "string" &&
    item.key.length > 0 &&
    typeof item.productId === "string" &&
    typeof item.slug === "string" &&
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    typeof item.color === "string" &&
    typeof item.size === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price >= 0 &&
    typeof item.qty === "number" &&
    Number.isSafeInteger(item.qty) &&
    item.qty > 0
  );
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function setSnapshot(items: CartLine[], hydrated = true) {
  snapshot = {
    items,
    hydrated,
  };

  notifyListeners();
}

function readSavedItems(): CartLine[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    const validItems = parsed.filter(isCartLine);

    const uniqueItems = new Map<string, CartLine>();

    validItems.forEach((item) => {
      uniqueItems.set(item.key, item);
    });

    return Array.from(uniqueItems.values());
  } catch {
    return [];
  }
}

function persistItems(items: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage may be unavailable or full.
  }
}

function handleStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY) {
    setSnapshot(readSavedItems());
  }

  if (event.key === null) {
    setSnapshot([]);
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (typeof window !== "undefined" && !snapshot.hydrated) {
    snapshot = {
      items: readSavedItems(),
      hydrated: true,
    };

    window.addEventListener("storage", handleStorage);
    notifyListeners();
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

interface SavedItemsContextValue {
  items: CartLine[];
  hydrated: boolean;
  count: number;
  saveItem: (item: CartLine) => void;
  removeSavedItem: (key: string) => void;
  moveToCart: (key: string) => boolean;
  clearSavedItems: () => void;
  isSaved: (key: string) => boolean;
}

const SavedItemsContext = createContext<SavedItemsContextValue | null>(null);

export function SavedItemsProvider({ children }: { children: ReactNode }) {
  const { addToCart } = useCart();

  const currentSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const items = currentSnapshot.items;

  const saveItem = useCallback((item: CartLine) => {
    if (!isCartLine(item)) return;

    const updatedItems = [
      ...snapshot.items.filter((savedItem) => savedItem.key !== item.key),
      item,
    ];

    persistItems(updatedItems);
    setSnapshot(updatedItems);
  }, []);

  const removeSavedItem = useCallback((key: string) => {
    const updatedItems = snapshot.items.filter((item) => item.key !== key);

    persistItems(updatedItems);
    setSnapshot(updatedItems);
  }, []);

  const moveToCart = useCallback(
    (key: string) => {
      const item = snapshot.items.find((savedItem) => savedItem.key === key);

      if (!item) return false;

      const { qty, ...cartItem } = item;

      addToCart(cartItem, qty);
      removeSavedItem(key);

      return true;
    },
    [addToCart, removeSavedItem],
  );

  const clearSavedItems = useCallback(() => {
    persistItems([]);
    setSnapshot([]);
  }, []);

  const isSaved = useCallback(
    (key: string) => items.some((item) => item.key === key),
    [items],
  );

  const value = useMemo<SavedItemsContextValue>(
    () => ({
      items,
      hydrated: currentSnapshot.hydrated,
      count: items.reduce((total, item) => total + item.qty, 0),
      saveItem,
      removeSavedItem,
      moveToCart,
      clearSavedItems,
      isSaved,
    }),
    [
      items,
      currentSnapshot.hydrated,
      saveItem,
      removeSavedItem,
      moveToCart,
      clearSavedItems,
      isSaved,
    ],
  );

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems() {
  const context = useContext(SavedItemsContext);

  if (!context) {
    throw new Error("useSavedItems must be used within a SavedItemsProvider");
  }

  return context;
}
