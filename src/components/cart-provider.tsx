"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

const CART_STORAGE_KEY = "supertech-marketplace-cart";
const CART_SYNC_EVENT = "supertech-marketplace-cart-sync";

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

function getStoredCart() {
  if (typeof window === "undefined") {
    return [] as CartItem[];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!raw) {
      return [] as CartItem[];
    }

    const parsed = JSON.parse(raw) as CartItem[];

    return Array.isArray(parsed)
      ? parsed.filter((item) => item.slug && Number.isFinite(item.quantity))
      : [];
  } catch {
    return [] as CartItem[];
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

  if (items.length === 0) {
    window.localStorage.removeItem(CART_STORAGE_KEY);
  } else {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }

  window.dispatchEvent(new Event(CART_SYNC_EVENT));
}

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = useSyncExternalStore(subscribeToCart, getStoredCart, () => []);
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
