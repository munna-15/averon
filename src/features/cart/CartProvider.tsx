"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { CartLine, CartSnapshot } from "@/types/cart";

const STORAGE_KEY = "averon-cart";

const SERVER_SNAPSHOT: CartSnapshot = {
  items: [],
  hydrated: false,
};

let snapshot: CartSnapshot = SERVER_SNAPSHOT;
let initialized = false;

const listeners = new Set<() => void>();

interface CartContextValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  isCartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleCartDrawer: () => void;
  addToCart: (item: Omit<CartLine, "qty">, quantity?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;

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

function readCart(): CartLine[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isCartLine);
  } catch {
    return [];
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function updateCart(items: CartLine[], persist = true) {
  snapshot = {
    items,
    hydrated: true,
  };

  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Cart remains available for the current session.
    }
  }

  notifyListeners();
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;

  updateCart(readCart(), false);
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (typeof window !== "undefined") {
    if (!initialized) {
      initialized = true;

      snapshot = {
        items: readCart(),
        hydrated: true,
      };
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

export function CartProvider({ children }: { children: ReactNode }) {
  const currentSnapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const { items, hydrated } = currentSnapshot;

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const count = useMemo(
    () => items.reduce((total, item) => total + item.qty, 0),
    [items],
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.qty, 0),
    [items],
  );

  const openCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(true);
  }, []);

  const closeCartDrawer = useCallback(() => {
    setIsCartDrawerOpen(false);
  }, []);

  const toggleCartDrawer = useCallback(() => {
    setIsCartDrawerOpen((current) => !current);
  }, []);

  const addToCart = useCallback((item: Omit<CartLine, "qty">, quantity = 1) => {
    if (
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      !item.key ||
      !item.productId ||
      !Number.isFinite(item.price) ||
      item.price < 0
    ) {
      return;
    }

    const existing = snapshot.items.find((current) => current.key === item.key);

    if (existing) {
      updateCart(
        snapshot.items.map((current) =>
          current.key === item.key
            ? {
                ...current,
                qty: current.qty + quantity,
              }
            : current,
        ),
      );

      return;
    }

    updateCart([
      ...snapshot.items,
      {
        ...item,
        qty: quantity,
      },
    ]);
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (!Number.isSafeInteger(quantity)) return;

    if (quantity <= 0) {
      updateCart(snapshot.items.filter((item) => item.key !== key));
      return;
    }

    updateCart(
      snapshot.items.map((item) =>
        item.key === key ? { ...item, qty: quantity } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((key: string) => {
    updateCart(snapshot.items.filter((item) => item.key !== key));
  }, []);

  const clearCart = useCallback(() => {
    updateCart([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      hydrated,
      isCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      toggleCartDrawer,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      count,
      subtotal,
      hydrated,
      isCartDrawerOpen,
      openCartDrawer,
      closeCartDrawer,
      toggleCartDrawer,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider.");
  }

  return context;
}
