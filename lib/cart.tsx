"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { CartLine } from "./types";

type CartContextValue = {
  lines: CartLine[];
  addItem: (item: { menuItemId: string; name: string; unit_price_cents: number }) => void;
  setQuantity: (menuItemId: string, quantity: number) => void;
  setInstructions: (menuItemId: string, instructions: string) => void;
  removeItem: (menuItemId: string) => void;
  clear: () => void;
  subtotalCents: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const LS_KEY = "ikasi_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt cart data
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(LS_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  function addItem(item: { menuItemId: string; name: string; unit_price_cents: number }) {
    setLines((prev) => {
      const existing = prev.find((l) => l.menuItemId === item.menuItemId);
      if (existing) {
        return prev.map((l) =>
          l.menuItemId === item.menuItemId ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { ...item, quantity: 1, instructions: "" }];
    });
  }

  function setQuantity(menuItemId: string, quantity: number) {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.menuItemId !== menuItemId)
        : prev.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l)),
    );
  }

  function setInstructions(menuItemId: string, instructions: string) {
    setLines((prev) =>
      prev.map((l) => (l.menuItemId === menuItemId ? { ...l, instructions } : l)),
    );
  }

  function removeItem(menuItemId: string) {
    setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }

  function clear() {
    setLines([]);
  }

  const subtotalCents = lines.reduce((sum, l) => sum + l.unit_price_cents * l.quantity, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <CartContext.Provider
      value={{ lines, addItem, setQuantity, setInstructions, removeItem, clear, subtotalCents, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatRand(cents: number) {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
