# iKasi Grill — standalone site

A complete, working version of the iKasi Grill ordering site: home, menu,
cart (quantity edit, remove, special instructions), checkout with optional
delivery, Cash on Delivery, order confirmation/tracking, and four owner
admin pages (orders, menu, promotions, reports).

This does **not** depend on Lovable credits — it's a standalone Next.js
app you can run and deploy yourself.

## Two ways to run it

**Demo mode (no setup):** works immediately with realistic seed data
stored in the browser (localStorage). Good enough to demo the full flow
today. Orders placed won't be seen by other visitors/devices — each
browser has its own local copy.

**Connected mode (real, shared backend):** add your Supabase URL and anon
key (from the same Supabase project Lovable already set up — Lovable
project settings → Supabase, or supabase.com dashboard → Project Settings
→ API) as environment variables, and it talks to your real, shared
database instead — the same `menu_items`, `promotions`, `orders`,
`order_items` and owner-login tables Lovable created.

## Run locally

```bash
npm install
cp .env.example .env.local   # optional — fill in Supabase keys for connected mode
npm run dev
```

Visit http://localhost:3000. Admin is at /admin (demo password is
`changeme` unless you set `NEXT_PUBLIC_ADMIN_PASSWORD` — change this
before showing it to anyone).

## Deploy to Vercel

Vercel doesn't take a text prompt to build a site — that's more what
Lovable or Vercel's own **v0.dev** does. For an already-working Next.js
project like this one, the direct path is faster and more reliable than
re-prompting an AI builder:

1. Push this folder to a GitHub repo (or run `npx vercel` from inside
   this folder and follow the prompts — no GitHub needed for that route).
2. If using GitHub: go to vercel.com → **Add New Project** → import the
   repo → it auto-detects Next.js → click **Deploy**.
3. In the Vercel project's **Settings → Environment Variables**, add
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and
   `NEXT_PUBLIC_ADMIN_PASSWORD` if you want connected mode / a real admin
   password, then redeploy.

That's it — no prompt needed, it just builds.

## If you'd rather use v0.dev to keep iterating visually

v0 (v0.dev) is Vercel's separate AI app builder, similar to Lovable. If
you want to hand this off to v0 instead of deploying the code directly,
paste this as your first message there:

> Build a mobile-first Next.js ordering site for "iKasi Grill", a Shisa
> Nyama in Langa, Cape Town (phone 062 034 5534). Warm charcoal/cream/
> ember/chilli color palette, bold display typography. Pages: home (hero,
> "View Menu" + "WhatsApp Us" buttons, story section, specials, menu
> grouped by category — Inyama, Platter for 2, Sides, iKasi Fizz — photo
> gallery placeholder, contact section), a slide-out cart (quantity edit,
> remove, special instructions like "no sauce"/"extra sauce"/"dry or extra
> grilled"/"spice only"), checkout (name, phone, optional delivery with
> address + landmark, notes, Cash on Delivery only), an order confirmation
> page with a status timeline, and an owner admin area behind a login with
> four pages: orders (today's/completed/cancelled, status updates, print
> receipts), menu management (add/edit/toggle availability/remove), a
> promotions editor (combos, family packs, weekend specials), and reports
> (daily/weekly sales, deliveries, cash collected, popular meals,
> cancellations). Use Rand (R) currency formatting throughout.

That said — since the working code is already sitting in this project,
deploying it directly (above) gets you a live site fastest.

## Known gap vs. the original plan

The order status model here is simplified to **new → completed /
cancelled** (matching what's already live in your Supabase backend) —
not the full Pending → Confirmed → Preparing → Ready/Out for Delivery →
Delivered timeline from the original product brief. Worth a follow-up
once the deadline's past, either here or back in Lovable.
