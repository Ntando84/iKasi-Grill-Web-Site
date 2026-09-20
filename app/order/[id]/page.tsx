"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { getOrder } from "@/lib/db";
import { formatRand } from "@/lib/cart";
import { RESTAURANT } from "@/lib/seed-data";
import type { Order } from "@/lib/types";

const STEPS = ["new", "completed"] as const;
const STEP_LABELS: Record<string, string> = {
  new: "Order received",
  completed: "Delivered / Collected",
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null | "loading">("loading");

  useEffect(() => {
    getOrder(params.id).then(setOrder).catch(() => setOrder(null));
    const interval = setInterval(() => {
      getOrder(params.id).then(setOrder).catch(() => {});
    }, 15_000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (order === "loading") {
    return <p className="p-8 text-center text-sm text-ash">Loading order…</p>;
  }
  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <p className="text-sm text-ash">We couldn't find that order.</p>
        <Link href="/" className="mt-4 inline-block rounded-full bg-ember px-5 py-2.5 text-sm font-bold text-charcoal-deep">
          Back to menu
        </Link>
      </div>
    );
  }

  const cancelled = order.status === "cancelled";
  const currentStepIndex = cancelled ? -1 : STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ember">
          <Check className="text-charcoal-deep" />
        </div>
        <h1 className="mt-4 font-display text-2xl text-cream">
          Order #{order.order_number} confirmed
        </h1>
        <p className="mt-1 text-sm text-ash">
          Thank you, {order.customer_name}! Payment is Cash on Delivery.
        </p>
      </div>

      {/* Status timeline */}
      <div className="mt-8 rounded-2xl bg-charcoal-soft p-5 ring-1 ring-cream/10">
        {cancelled ? (
          <p className="text-center font-semibold text-chilli">This order was cancelled.</p>
        ) : (
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center text-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    i <= currentStepIndex
                      ? "bg-ember text-charcoal-deep"
                      : "bg-cream/10 text-ash"
                  }`}
                >
                  {i + 1}
                </div>
                <p className="mt-1 text-[11px] text-ash">{STEP_LABELS[step]}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl bg-charcoal-soft p-5 ring-1 ring-cream/10">
        <h2 className="font-display text-lg text-ember">Order summary</h2>
        <ul className="mt-3 space-y-1 text-sm text-cream">
          {order.order_items.map((item) => (
            <li key={item.id} className="flex justify-between gap-3">
              <span>
                {item.quantity}× {item.item_name}
                {item.instructions && (
                  <span className="block text-xs italic text-ash">{item.instructions}</span>
                )}
              </span>
              <span className="text-ash">
                {formatRand(item.unit_price_cents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-cream/10 pt-3 font-bold text-ember">
          <span>Total</span>
          <span>{formatRand(order.total_cents)}</span>
        </div>
        {order.is_delivery && (
          <div className="mt-3 rounded-xl bg-charcoal p-3 text-xs text-ash">
            <p className="font-semibold text-cream">Delivering to</p>
            <p>{order.address}</p>
            {order.landmark && <p>Landmark: {order.landmark}</p>}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-ash">
        Questions about your order? WhatsApp us on {RESTAURANT.phone}.
      </p>
      <Link
        href="/"
        className="mt-4 block rounded-full bg-cream/10 py-3 text-center text-sm font-bold text-cream"
      >
        Back to menu
      </Link>
    </div>
  );
}
