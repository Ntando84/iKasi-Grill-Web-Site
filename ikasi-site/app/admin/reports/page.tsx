"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getOrders } from "@/lib/db";
import { formatRand } from "@/lib/cart";
import type { Order } from "@/lib/types";

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isWithinDays(iso: string, days: number) {
  return new Date(iso).getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;
}

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => toast.error("Could not load reports"))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const today = orders.filter((o) => isToday(o.created_at));
    const thisWeek = orders.filter((o) => isWithinDays(o.created_at, 7));
    const completed = (list: Order[]) => list.filter((o) => o.status === "completed");
    const sum = (list: Order[]) => list.reduce((t, o) => t + o.total_cents, 0);

    const todayCompleted = completed(today);
    const weekCompleted = completed(thisWeek);

    const popular = new Map<string, number>();
    const source = weekCompleted.length ? weekCompleted : completed(orders);
    for (const o of source) {
      for (const item of o.order_items) {
        popular.set(item.item_name, (popular.get(item.item_name) ?? 0) + item.quantity);
      }
    }
    const topMeals = [...popular.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      dailySalesCents: sum(todayCompleted),
      dailyDeliveries: todayCompleted.filter((o) => o.is_delivery).length,
      weeklySalesCents: sum(weekCompleted),
      cashCollectedCents: sum(todayCompleted),
      cancelledToday: today.filter((o) => o.status === "cancelled").length,
      cancelledWeek: thisWeek.filter((o) => o.status === "cancelled").length,
      topMeals,
    };
  }, [orders]);

  return (
    <div>
      <h1 className="font-display text-2xl text-cream">Reports</h1>
      {loading && <p className="mt-4 text-sm text-ash">Crunching the numbers…</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Today's sales" value={formatRand(stats.dailySalesCents)} />
        <StatCard label="Today's deliveries" value={String(stats.dailyDeliveries)} />
        <StatCard label="Cash collected today" value={formatRand(stats.cashCollectedCents)} />
        <StatCard label="This week's sales" value={formatRand(stats.weeklySalesCents)} />
        <StatCard label="Cancelled today" value={String(stats.cancelledToday)} />
        <StatCard label="Cancelled this week" value={String(stats.cancelledWeek)} />
      </div>

      <div className="mt-6 rounded-2xl bg-charcoal-soft p-4 ring-1 ring-cream/10">
        <h2 className="font-display text-lg text-ember">Most popular meals</h2>
        {stats.topMeals.length === 0 ? (
          <p className="mt-2 text-sm text-ash">Not enough completed orders yet.</p>
        ) : (
          <ol className="mt-3 space-y-1 text-sm text-cream">
            {stats.topMeals.map(([name, qty], i) => (
              <li key={name} className="flex justify-between">
                <span>{i + 1}. {name}</span>
                <span className="text-ash">{qty} sold</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <p className="mt-4 text-xs text-ash">
        "Cash collected" assumes Cash on Delivery and counts completed orders only.
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-charcoal-soft p-4 ring-1 ring-cream/10">
      <p className="text-xs text-ash">{label}</p>
      <p className="mt-1 font-display text-2xl text-cream">{value}</p>
    </div>
  );
}
