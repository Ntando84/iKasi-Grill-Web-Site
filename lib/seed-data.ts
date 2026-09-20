import type { MenuItem, Promotion } from "./types";

export const SEED_MENU_ITEMS: MenuItem[] = [
  { id: "m1", name: "Pork Chops", description: "Grilled over live coals, seasoned simple.", category: "Inyama", price_cents: 4000, price_note: "R25 - R40 depending on size", available: true, sort_order: 1 },
  { id: "m2", name: "Beef Chops", description: "Thick cut beef chops straight off the fire.", category: "Inyama", price_cents: 5000, price_note: "R25 - R50 depending on size", available: true, sort_order: 2 },
  { id: "m3", name: "Sausage", description: "Grilled sausage, crackling casing.", category: "Inyama", price_cents: 2000, price_note: "", available: true, sort_order: 3 },
  { id: "m4", name: "Wings (from 4)", description: "Four wings, flame grilled and basted.", category: "Inyama", price_cents: 4000, price_note: "", available: true, sort_order: 4 },
  { id: "m5", name: "Pork Platter for 2", description: "Pork, sides and sauce - enough for two.", category: "Platter for 2", price_cents: 15000, price_note: "", available: true, sort_order: 1 },
  { id: "m6", name: "Beef Platter for 2", description: "Beef, sides and sauce - enough for two.", category: "Platter for 2", price_cents: 18000, price_note: "", available: true, sort_order: 2 },
  { id: "m7", name: "Guacamole", description: "House guacamole with our sauces on top.", category: "Sides", price_cents: 3500, price_note: "", available: true, sort_order: 1 },
  { id: "m8", name: "Pap & Chakalaka", description: "Fluffy pap with spicy chakalaka.", category: "Sides", price_cents: 3000, price_note: "", available: true, sort_order: 2 },
  { id: "m9", name: "Passion Fruit", description: "iKasi Fizz - chilled passion fruit.", category: "iKasi Fizz", price_cents: 1500, price_note: "", available: true, sort_order: 1 },
  { id: "m10", name: "Watermelon", description: "iKasi Fizz - chilled watermelon.", category: "iKasi Fizz", price_cents: 1500, price_note: "", available: true, sort_order: 2 },
];

export const SEED_PROMOTIONS: Promotion[] = [
  { id: "p1", title: "Weekend Special", description: "Buy 5 meals and get the 6th at a discount. Saturdays and Sundays only.", kind: "weekend", price_cents: null, active: true, sort_order: 1 },
  { id: "p2", title: "Family Pack", description: "Mixed grill with sides, feeds four to five people.", kind: "family", price_cents: 45000, active: true, sort_order: 2 },
];

export const CATEGORY_ORDER = ["Inyama", "Platter for 2", "Sides", "iKasi Fizz"];

export const RESTAURANT = {
  name: "iKasi Grill",
  tagline: "Shisa Nyama",
  phone: "062 034 5534",
  whatsapp: "27620345534", // wa.me format, no + or leading 0
  location: "Langa, Cape Town",
  hours: "Tue - Sun, 11:00 - 21:00",
  flatDeliveryFeeCents: 3000,
};
