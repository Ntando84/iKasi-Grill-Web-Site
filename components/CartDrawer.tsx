"use client";

import { X, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart, formatRand } from "@/lib/cart";

const QUICK_NOTES = ["No sauce", "Extra sauce", "Dry / extra grilled", "Spice only"];

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, setQuantity, setInstructions, removeItem, subtotalCents } = useCart();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-md flex-col bg-charcoal-soft p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">Your cart</h2>
          <button type="button" onClick={onClose} className="text-ash hover:text-ember" aria-label="Close cart">
            <X size={22} />
          </button>
        </div>

        <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
          {lines.length === 0 && <p className="text-sm text-ash">Your cart is empty.</p>}
          {lines.map((line) => (
            <div key={line.menuItemId} className="rounded-xl bg-charcoal p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-cream">{line.name}</p>
                <button
                  type="button"
                  onClick={() => removeItem(line.menuItemId)}
                  className="text-ash hover:text-chilli"
                  aria-label={`Remove ${line.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(line.menuItemId, line.quantity - 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-cream/10 text-cream"
                >
                  <Minus size={14} />
                </button>
                <span className="w-4 text-center text-sm text-cream">{line.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(line.menuItemId, line.quantity + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-cream/10 text-cream"
                >
                  <Plus size={14} />
                </button>
                <span className="ml-auto text-sm text-ember">
                  {formatRand(line.unit_price_cents * line.quantity)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_NOTES.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => setInstructions(line.menuItemId, note)}
                    className={`rounded-full px-2.5 py-1 text-xs ${
                      line.instructions === note
                        ? "bg-ember text-charcoal-deep"
                        : "bg-cream/10 text-ash hover:text-cream"
                    }`}
                  >
                    {note}
                  </button>
                ))}
              </div>
              <input
                value={line.instructions}
                onChange={(e) => setInstructions(line.menuItemId, e.target.value)}
                placeholder="Other instructions…"
                className="mt-2 w-full rounded-lg bg-charcoal-soft px-3 py-1.5 text-xs text-cream ring-1 ring-cream/10"
              />
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="mt-4 border-t border-cream/10 pt-4">
            <div className="flex justify-between text-sm text-ash">
              <span>Subtotal</span>
              <span className="text-cream">{formatRand(subtotalCents)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="mt-3 block rounded-full bg-ember py-3 text-center text-sm font-bold text-charcoal-deep"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
