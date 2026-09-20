"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { RESTAURANT } from "@/lib/seed-data";

export function Header({ onCartClick }: { onCartClick: () => void }) {
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-cream/10 bg-charcoal/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-xl tracking-wide text-cream">
          {RESTAURANT.name} <span className="text-ember">{RESTAURANT.tagline}</span>
        </Link>
        <button
          type="button"
          onClick={onCartClick}
          className="relative rounded-full bg-cream/10 p-2.5 text-cream hover:bg-ember hover:text-charcoal-deep"
          aria-label="Open cart"
        >
          <ShoppingCart size={20} />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ember text-xs font-bold text-charcoal-deep">
              {itemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

export function WhatsAppBar() {
  return (
    <a
      href={`https://wa.me/${RESTAURANT.whatsapp}`}
      target="_blank"
      rel="noreferrer"
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-center gap-2 bg-[#25D366] py-3 text-sm font-bold text-charcoal-deep"
    >
      WhatsApp us — {RESTAURANT.phone}
    </a>
  );
}
