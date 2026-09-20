"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getOrders, updateOrderStatus } from "@/lib/db";
import { formatRand } from "@/lib/cart";
import type { Order, OrderStatus } from "@/lib/types";

const TABS = [
  { key: "new", label: "Today's Orders" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["key"]>("new");
  const [printBatch, setPrintBatch] = useState<Order[] | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setOrders(await getOrders());
    } catch {
      toast.error("Could not load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!printBatch) return;
    const id = setTimeout(() => {
      window.print();
      setPrintBatch(null);
    }, 50);
    return () => clearTimeout(id);
  }, [printBatch]);

  async function setStatus(id: string, status: OrderStatus) {
    try {
      await updateOrderStatus(id, status);
      toast.success("Order updated");
      refresh();
    } catch {
      toast.error("Could not update the order");
    }
  }

  const filtered = useMemo(() => orders.filter((o) => o.status === activeTab), [orders, activeTab]);
  const today = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const d = new Date(o.created_at);
      return (
        o.status !== "cancelled" &&
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }, [orders]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-cream">Orders</h1>
        <button
          type="button"
          onClick={() => setPrintBatch(today)}
          disabled={today.length === 0}
          className="rounded-full bg-cream/10 px-4 py-1.5 text-xs font-semibold text-cream hover:bg-ember hover:text-charcoal-deep disabled:opacity-40"
        >
          Print today's receipts ({today.length})
        </button>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${
              activeTab === tab.key ? "bg-ember text-charcoal-deep" : "text-ash hover:text-ember"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3 print:hidden">
        {loading && <p className="text-sm text-ash">Loading orders…</p>}
        {!loading && filtered.length === 0 && (
          <p className="rounded-2xl bg-charcoal-soft p-4 text-sm text-ash ring-1 ring-cream/10">
            No orders here yet.
          </p>
        )}
        {filtered.map((order) => (
          <div key={order.id} className="rounded-2xl bg-charcoal-soft p-4 ring-1 ring-cream/10">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-display text-lg text-cream">
                  #{order.order_number} — {order.customer_name}
                </p>
                <p className="text-xs text-ash">
                  {new Date(order.created_at).toLocaleString("en-ZA")} · {order.phone}
                </p>
              </div>
              <p className="font-display text-lg text-ember">{formatRand(order.total_cents)}</p>
            </div>

            <ul className="mt-3 space-y-1 text-sm text-cream">
              {order.order_items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>
                    {item.quantity}× {item.item_name}
                    {item.instructions && (
                      <span className="block text-xs italic text-ash">Note: {item.instructions}</span>
                    )}
                  </span>
                  <span className="text-ash">{formatRand(item.unit_price_cents * item.quantity)}</span>
                </li>
              ))}
            </ul>

            {order.is_delivery && (
              <div className="mt-3 rounded-xl bg-charcoal p-3 text-xs text-ash">
                <p className="font-semibold text-cream">Delivery</p>
                <p>{order.address}</p>
                {order.landmark && <p>Landmark: {order.landmark}</p>}
              </div>
            )}
            {order.note && <p className="mt-2 text-xs italic text-ash">Order note: {order.note}</p>}

            <div className="mt-4 flex flex-wrap gap-2">
              {order.status === "new" && (
                <>
                  <button
                    type="button"
                    onClick={() => setStatus(order.id, "completed")}
                    className="rounded-full bg-ember px-4 py-1.5 text-xs font-bold text-charcoal-deep"
                  >
                    Mark completed
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(order.id, "cancelled")}
                    className="rounded-full bg-chilli/20 px-4 py-1.5 text-xs font-semibold text-chilli"
                  >
                    Cancel order
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setPrintBatch([order])}
                className="rounded-full bg-cream/10 px-4 py-1.5 text-xs font-semibold text-cream hover:bg-ember hover:text-charcoal-deep"
              >
                Print receipt
              </button>
            </div>
          </div>
        ))}
      </div>

      {printBatch && (
        <div className="hidden print:block">
          {printBatch.map((order) => (
            <div key={order.id} className="mb-8 break-after-page text-black">
              <h2 className="text-lg font-bold">iKasi Grill — Receipt</h2>
              <p>Order #{order.order_number}</p>
              <p>{new Date(order.created_at).toLocaleString("en-ZA")}</p>
              <p>Customer: {order.customer_name} ({order.phone})</p>
              {order.is_delivery && (
                <p>Delivery: {order.address} {order.landmark && `(near ${order.landmark})`}</p>
              )}
              <hr className="my-2" />
              {order.order_items.map((item) => (
                <p key={item.id}>
                  {item.quantity}× {item.item_name}
                  {item.instructions ? ` — ${item.instructions}` : ""} —{" "}
                  {formatRand(item.unit_price_cents * item.quantity)}
                </p>
              ))}
              <hr className="my-2" />
              <p className="font-bold">Total: {formatRand(order.total_cents)}</p>
              <p>Payment: Cash on Delivery</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
