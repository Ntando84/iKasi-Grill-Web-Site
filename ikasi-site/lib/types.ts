export type MenuItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  price_cents: number;
  price_note: string;
  available: boolean;
  sort_order: number;
};

export type Promotion = {
  id: string;
  title: string;
  description: string;
  kind: string; // 'combo' | 'family' | 'weekend' | custom
  price_cents: number | null;
  active: boolean;
  sort_order: number;
};

export type DeliveryZone = {
  id: string;
  name: string;
  fee_cents: number;
};

export type OrderStatus = "new" | "completed" | "cancelled";

export type OrderItem = {
  id: string;
  item_name: string;
  unit_price_cents: number;
  quantity: number;
  instructions: string;
};

export type Order = {
  id: string;
  order_number: number;
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
  status: OrderStatus;
  created_at: string;
  order_items: OrderItem[];
};

export type CartLine = {
  menuItemId: string;
  name: string;
  unit_price_cents: number;
  quantity: number;
  instructions: string;
};
