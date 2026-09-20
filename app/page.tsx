"use client";

import { useEffect, useMemo, useState } from "react";
import { Header, WhatsAppBar } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { useCart, formatRand } from "@/lib/cart";
import { getMenuItems, getPromotions } from "@/lib/db";
import { CATEGORY_ORDER, RESTAURANT } from "@/lib/seed-data";
import type { MenuItem, Promotion } from "@/lib/types";

export default function HomePage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    getMenuItems().then(setItems).catch(() => setItems([]));
    getPromotions().then(setPromos).catch(() => setPromos([]));
  }, []);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    for (const item of items) {
      if (!item.available) continue;
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    }
    const orderedKeys = [
      ...CATEGORY_ORDER.filter((c) => byCategory.has(c)),
      ...[...byCategory.keys()].filter((c) => !CATEGORY_ORDER.includes(c)),
    ];
    return orderedKeys.map((cat) => [cat, byCategory.get(cat)!] as const);
  }, [items]);

  return (
    <div className="pb-20">
      <Header onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Hero */}
      <section className="border-b border-cream/10 bg-gradient-to-b from-charcoal-deep to-charcoal px-4 py-16 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-ember">{RESTAURANT.location}</p>
        <h1 className="mt-3 font-display text-4xl text-cream sm:text-5xl">
          {RESTAURANT.name}
        </h1>
        <p className="mt-2 text-lg text-ash">{RESTAURANT.tagline}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#menu"
            className="rounded-full bg-ember px-6 py-3 text-sm font-bold text-charcoal-deep"
          >
            View Menu
          </a>
          <a
            href={`https://wa.me/${RESTAURANT.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-cream/10 px-6 py-3 text-sm font-bold text-cream"
          >
            WhatsApp Us
          </a>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="font-display text-2xl text-ember">Our Story</h2>
        <p className="mt-3 text-sm leading-relaxed text-ash">
          {RESTAURANT.name} is a local Shisa Nyama grill in {RESTAURANT.location}, serving
          flame-grilled meat, hearty platters and cold drinks the way the neighbourhood
          likes it — simple, generous, and always fresh off the fire.
        </p>
      </section>

      {/* Promotions */}
      {promos.filter((p) => p.active).length > 0 && (
        <section className="mx-auto max-w-5xl px-4 py-8">
          <h2 className="font-display text-2xl text-ember">Specials</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {promos
              .filter((p) => p.active)
              .map((promo) => (
                <div key={promo.id} className="rounded-2xl bg-charcoal-soft p-4 ring-1 ring-cream/10">
                  <p className="font-display text-lg text-cream">{promo.title}</p>
                  <p className="mt-1 text-sm text-ash">{promo.description}</p>
                  {promo.price_cents != null && (
                    <p className="mt-2 text-sm font-bold text-ember">
                      {formatRand(promo.price_cents)}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Menu */}
      <section id="menu" className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="font-display text-2xl text-ember">Menu</h2>
        {grouped.length === 0 && <p className="mt-4 text-sm text-ash">Loading menu…</p>}
        <div className="mt-4 space-y-8">
          {grouped.map(([category, categoryItems]) => (
            <div key={category}>
              <h3 className="font-display text-lg text-cream">{category}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-3 rounded-2xl bg-charcoal-soft p-4 ring-1 ring-cream/10"
                  >
                    <div>
                      <p className="font-semibold text-cream">{item.name}</p>
                      <p className="mt-1 text-xs text-ash">{item.description}</p>
                      <p className="mt-2 text-sm font-bold text-ember">
                        {item.price_note || formatRand(item.price_cents)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          menuItemId: item.id,
                          name: item.name,
                          unit_price_cents: item.price_cents,
                        })
                      }
                      className="shrink-0 rounded-full bg-ember px-3 py-1.5 text-xs font-bold text-charcoal-deep"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery (placeholders — swap for your real photos) */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="font-display text-2xl text-ember">Gallery</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square rounded-xl bg-gradient-to-br from-ember/40 to-chilli/40"
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-ash">
          Placeholder images — drop your real photos into /public and swap these in.
        </p>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h2 className="font-display text-2xl text-ember">Find Us</h2>
        <p className="mt-3 text-sm text-ash">{RESTAURANT.location}</p>
        <p className="text-sm text-ash">{RESTAURANT.phone}</p>
        <p className="text-sm text-ash">{RESTAURANT.hours}</p>
      </section>

      <WhatsAppBar />
    </div>
  );
}
