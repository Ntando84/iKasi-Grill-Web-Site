import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { MenuItem, Order, OrderItem, OrderStatus, Promotion } from "./types";
import { SEED_MENU_ITEMS, SEED_PROMOTIONS } from "./seed-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

let client: SupabaseClient | null = null;
function supabase() {
  if (!client && isSupabaseConfigured) {
    client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }
  return client;
}

// ---------------------------------------------------------------------------
// localStorage fallback (demo mode — data lives only in this browser)
// ---------------------------------------------------------------------------
const LS_KEYS = {
  menu: "ikasi_menu_items",
  promos: "ikasi_promotions",
  orders: "ikasi_orders",
  orderSeq: "ikasi_order_seq",
};

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function ensureSeeded() {
  if (lsGet<MenuItem[] | null>(LS_KEYS.menu, null) === null) {
    lsSet(LS_KEYS.menu, SEED_MENU_ITEMS);
  }
  if (lsGet<Promotion[] | null>(LS_KEYS.promos, null) === null) {
    lsSet(LS_KEYS.promos, SEED_PROMOTIONS);
  }
  if (lsGet<Order[] | null>(LS_KEYS.orders, null) === null) {
    lsSet(LS_KEYS.orders, []);
  }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ---------------------------------------------------------------------------
// Public API — same shape regardless of backend
// ---------------------------------------------------------------------------

export async function getMenuItems(): Promise<MenuItem[]> {
  const sb = supabase();
  if (sb) {
    const { data, error } = await sb.from("menu_items").select("*").order("category").order("sort_order");
    if (error) throw error;
    return data as MenuItem[];
  }
  ensureSeeded();
  return lsGet<MenuItem[]>(LS_KEYS.menu, SEED_MENU_ITEMS);
}

export async function getPromotions(): Promise<Promotion[]> {
  const sb = supabase();
  if (sb) {
    const { data, error } = await sb.from("promotions").select("*").order("sort_order");
    if (error) throw error;
    return data as Promotion[];
  }
  ensureSeeded();
  return lsGet<Promotion[]>(LS_KEYS.promos, SEED_PROMOTIONS);
}

export async function getOrders(): Promise<Order[]> {
  const sb = supabase();
  if (sb) {
    const { data, error } = await sb
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Order[];
  }
  ensureSeeded();
  return lsGet<Order[]>(LS_KEYS.orders, []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export async function getOrder(id: string): Promise<Order | null> {
  const sb = supabase();
  if (sb) {
    const { data, error } = await sb.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as Order) ?? null;
  }
  ensureSeeded();
  const orders = lsGet<Order[]>(LS_KEYS.orders, []);
  return orders.find((o) => o.id === id) ?? null;
}

export async function createOrder(input: {
  customer_name: string;
  phone: string;
  is_delivery: boolean;
  address: string;
  landmark: string;
  delivery_zone: string;
  note: string;
  subtotal_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  items: Omit<OrderItem, "id">[];
}): Promise<Order> {
  const sb = supabase();
  if (sb) {
    // The live schema only has these order columns — no subtotal/fee/zone split.
    const { data: orderRow, error: orderErr } = await sb
      .from("orders")
      .insert({
        customer_name: input.customer_name,
        phone: input.phone,
        is_delivery: input.is_delivery,
        address: input.address,
        landmark: input.landmark,
        note: input.note,
        total_cents: input.total_cents,
        status: "new",
      })
      .select()
      .single();
    if (orderErr) throw orderErr;

    const itemRows = input.items.map((it) => ({ ...it, order_id: orderRow.id }));
    const { error: itemsErr } = await sb.from("order_items").insert(itemRows);
    if (itemsErr) throw itemsErr;

    return getOrder(orderRow.id) as Promise<Order>;
  }

  ensureSeeded();
  const seq = lsGet<number>(LS_KEYS.orderSeq, 1000) + 1;
  lsSet(LS_KEYS.orderSeq, seq);

  const order: Order = {
    id: uid(),
    order_number: seq,
    customer_name: input.customer_name,
    phone: input.phone,
    is_delivery: input.is_delivery,
    address: input.address,
    landmark: input.landmark,
    delivery_zone: input.delivery_zone,
    note: input.note,
    subtotal_cents: input.subtotal_cents,
    delivery_fee_cents: input.delivery_fee_cents,
    total_cents: input.total_cents,
    status: "new",
    created_at: new Date().toISOString(),
    order_items: input.items.map((it) => ({ ...it, id: uid() })),
  };
  const orders = lsGet<Order[]>(LS_KEYS.orders, []);
  orders.unshift(order);
  lsSet(LS_KEYS.orders, orders);
  return order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
    return;
  }
  const orders = lsGet<Order[]>(LS_KEYS.orders, []);
  const next = orders.map((o) => (o.id === id ? { ...o, status } : o));
  lsSet(LS_KEYS.orders, next);
}

export async function upsertMenuItem(item: Partial<MenuItem> & { id?: string }): Promise<void> {
  const sb = supabase();
  if (sb) {
    if (item.id) {
      const { id, ...patch } = item;
      const { error } = await sb.from("menu_items").update(patch).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("menu_items").insert(item);
      if (error) throw error;
    }
    return;
  }
  ensureSeeded();
  const items = lsGet<MenuItem[]>(LS_KEYS.menu, SEED_MENU_ITEMS);
  if (item.id) {
    lsSet(LS_KEYS.menu, items.map((m) => (m.id === item.id ? { ...m, ...item } : m)));
  } else {
    const newItem: MenuItem = {
      id: uid(),
      name: "",
      description: "",
      category: "",
      price_cents: 0,
      price_note: "",
      available: true,
      sort_order: 99,
      ...item,
    };
    lsSet(LS_KEYS.menu, [...items, newItem]);
  }
}

export async function deleteMenuItem(id: string): Promise<void> {
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from("menu_items").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const items = lsGet<MenuItem[]>(LS_KEYS.menu, SEED_MENU_ITEMS);
  lsSet(LS_KEYS.menu, items.filter((m) => m.id !== id));
}

export async function upsertPromotion(promo: Partial<Promotion> & { id?: string }): Promise<void> {
  const sb = supabase();
  if (sb) {
    if (promo.id) {
      const { id, ...patch } = promo;
      const { error } = await sb.from("promotions").update(patch).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await sb.from("promotions").insert(promo);
      if (error) throw error;
    }
    return;
  }
  ensureSeeded();
  const promos = lsGet<Promotion[]>(LS_KEYS.promos, SEED_PROMOTIONS);
  if (promo.id) {
    lsSet(LS_KEYS.promos, promos.map((p) => (p.id === promo.id ? { ...p, ...promo } : p)));
  } else {
    const newPromo: Promotion = {
      id: uid(),
      title: "",
      description: "",
      kind: "combo",
      price_cents: null,
      active: true,
      sort_order: 99,
      ...promo,
    };
    lsSet(LS_KEYS.promos, [...promos, newPromo]);
  }
}

export async function deletePromotion(id: string): Promise<void> {
  const sb = supabase();
  if (sb) {
    const { error } = await sb.from("promotions").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const promos = lsGet<Promotion[]>(LS_KEYS.promos, SEED_PROMOTIONS);
  lsSet(LS_KEYS.promos, promos.filter((p) => p.id !== id));
}
