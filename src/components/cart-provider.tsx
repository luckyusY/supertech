"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const CART_STORAGE_KEY = "supertech-marketplace-cart";
const CART_SYNC_EVENT = "supertech-marketplace-cart-sync";
const EMPTY_CART: CartItem[] = [];

let cachedCartRaw: string | null | undefined;
let cachedCartSnapshot: CartItem[] = EMPTY_CART;

export type CartItem = {
  slug: string;
  name: string;
  vendorSlug: string;
  vendorName: string;
  heroImage: string;
  price: number;
  badge: string;
  accent: string;
  quantity: number;
};

type CartContextValue = {
  isReady: boolean;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeCartItems(value: unknown) {
  if (!Array.isArray(value)) {
    return EMPTY_CART;
  }

  const sanitized = value.filter(
    (item): item is CartItem =>
      typeof item === "object" &&
      item !== null &&
      "slug" in item &&
      typeof item.slug === "string" &&
      item.slug.length > 0 &&
      "quantity" in item &&
      typeof item.quantity === "number" &&
      Number.isFinite(item.quantity),
  );

  return sanitized.length > 0 ? sanitized : EMPTY_CART;
}

function getStoredCart() {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (raw === cachedCartRaw) {
      return cachedCartSnapshot;
    }

    cachedCartRaw = raw;

    if (!raw) {
      cachedCartSnapshot = EMPTY_CART;
      return cachedCartSnapshot;
    }

    const parsed = JSON.parse(raw) as unknown;
    cachedCartSnapshot = normalizeCartItems(parsed);

    return cachedCartSnapshot;
  } catch {
    cachedCartRaw = null;
    cachedCartSnapshot = EMPTY_CART;
    return cachedCartSnapshot;
  }
}

function subscribeToCart(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(CART_SYNC_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(CART_SYNC_EVENT, handleChange);
  };
}

function commitCart(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  const nextItems = items.length > 0 ? items : EMPTY_CART;

  if (nextItems.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    cachedCartRaw = null;
    cachedCartSnapshot = EMPTY_CART;
  } else {
    const raw = JSON.stringify(nextItems);

    window.localStorage.setItem(CART_STORAGE_KEY, raw);
    cachedCartRaw = raw;
    cachedCartSnapshot = nextItems;
  }

  window.dispatchEvent(new Event(CART_SYNC_EVENT));
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = useSyncExternalStore(subscribeToCart, getStoredCart, () => EMPTY_CART);
  const isReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    const existing = items.find((entry) => entry.slug === item.slug);

    if (!existing) {
      commitCart([...items, { ...item, quantity }]);
      return;
    }

    commitCart(
      items.map((entry) =>
        entry.slug === item.slug
          ? { ...entry, quantity: entry.quantity + quantity }
          : entry,
      ),
    );
  }

  function updateQuantity(slug: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(slug);
      return;
    }

    commitCart(items.map((item) => (item.slug === slug ? { ...item, quantity } : item)));
  }

  function removeItem(slug: string) {
    commitCart(items.filter((item) => item.slug !== slug));
  }

  function clearCart() {
    commitCart([]);
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        isReady,
        items,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
