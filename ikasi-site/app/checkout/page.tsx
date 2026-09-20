"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, formatRand } from "@/lib/cart";
import { createOrder } from "@/lib/db";
import { RESTAURANT } from "@/lib/seed-data";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotalCents, clear } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isDelivery, setIsDelivery] = useState(false);
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const deliveryFeeCents = isDelivery ? RESTAURANT.flatDeliveryFeeCents : 0;
  const totalCents = subtotalCents + deliveryFeeCents;

  async function placeOrder() {
    setError("");
    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    if (isDelivery && !address.trim()) {
      setError("Please enter a delivery address.");
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        customer_name: name.trim(),
        phone: phone.trim(),
        is_delivery: isDelivery,
        address: isDelivery ? address.trim() : "",
        landmark: isDelivery ? landmark.trim() : "",
        delivery_zone: "",
        note: note.trim(),
        subtotal_cents: subtotalCents,
        delivery_fee_cents: deliveryFeeCents,
        total_cents: totalCents,
        items: lines.map((l) => ({
          item_name: l.name,
          unit_price_cents: l.unit_price_cents,
          quantity: l.quantity,
          instructions: l.instructions,
        })),
      });
      clear();
      router.push(`/order/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong placing your order.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-ash">Your cart is empty.</p>
        <Link href="/" className="mt-4 inline-block rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-charcoal-deep">
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-2xl text-cream">Checkout</h1>

      <div className="mt-4 space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          className="w-full rounded-lg bg-charcoal-soft px-4 py-3 text-sm text-cream ring-1 ring-cream/10"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number (calls/WhatsApp)"
          className="w-full rounded-lg bg-charcoal-soft px-4 py-3 text-sm text-cream ring-1 ring-cream/10"
        />

        <label className="flex items-center gap-2 text-sm text-ash">
          <input
            type="checkbox"
            checked={isDelivery}
            onChange={(e) => setIsDelivery(e.target.checked)}
          />
          I need delivery (optional — flat fee {formatRand(RESTAURANT.flatDeliveryFeeCents)})
        </label>

        {isDelivery && (
          <>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Delivery address"
              className="w-full rounded-lg bg-charcoal-soft px-4 py-3 text-sm text-cream ring-1 ring-cream/10"
            />
            <input
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Landmark, e.g. opposite Astron Garage"
              className="w-full rounded-lg bg-charcoal-soft px-4 py-3 text-sm text-cream ring-1 ring-cream/10"
            />
          </>
        )}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Order notes (optional)"
          rows={2}
          className="w-full rounded-lg bg-charcoal-soft px-4 py-3 text-sm text-cream ring-1 ring-cream/10"
        />

        <div className="rounded-lg bg-charcoal-soft p-4 text-sm ring-1 ring-cream/10">
          <p className="font-semibold text-cream">Payment: Cash on Delivery</p>
        </div>

        <div className="space-y-1 text-sm text-ash">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-cream">{formatRand(subtotalCents)}</span>
          </div>
          {isDelivery && (
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span className="text-cream">{formatRand(deliveryFeeCents)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-ember">
            <span>Total</span>
            <span>{formatRand(totalCents)}</span>
          </div>
        </div>

        {error && <p className="text-sm text-chilli">{error}</p>}

        <button
          type="button"
          onClick={placeOrder}
          disabled={submitting}
          className="w-full rounded-full bg-ember py-3 text-sm font-bold text-charcoal-deep disabled:opacity-50"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </div>
    </div>
  );
}
