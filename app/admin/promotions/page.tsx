"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPromotions, upsertPromotion, deletePromotion } from "@/lib/db";
import { formatRand } from "@/lib/cart";
import type { Promotion } from "@/lib/types";

const KINDS = [
  { value: "combo", label: "Meal combo" },
  { value: "family", label: "Family pack" },
  { value: "weekend", label: "Weekend special" },
];

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setPromos(await getPromotions());
    } catch {
      toast.error("Could not load promotions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function save(id: string, patch: Partial<Promotion>) {
    try {
      await upsertPromotion({ id, ...patch });
      toast.success("Saved");
      refresh();
    } catch {
      toast.error("Could not save");
    }
  }

  async function remove(id: string, title: string) {
    if (!confirm(`Remove "${title}"?`)) return;
    try {
      await deletePromotion(id);
      toast.success("Promotion removed");
      refresh();
    } catch {
      toast.error("Could not remove that promotion");
    }
  }

  async function add(promo: Omit<Promotion, "id">) {
    try {
      await upsertPromotion(promo);
      toast.success("Promotion added");
      setShowAdd(false);
      refresh();
    } catch {
      toast.error("Could not add that promotion");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-cream">Promotions</h1>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="rounded-full bg-ember px-4 py-1.5 text-xs font-bold text-charcoal-deep"
        >
          {showAdd ? "Close" : "Add promotion"}
        </button>
      </div>

      {showAdd && <AddPromoForm onAdd={add} />}
      {loading && <p className="mt-4 text-sm text-ash">Loading promotions…</p>}

      <div className="mt-6 space-y-3">
        {promos.map((promo) => (
          <PromoRow
            key={promo.id}
            promo={promo}
            onSave={(patch) => save(promo.id, patch)}
            onDelete={() => remove(promo.id, promo.title)}
          />
        ))}
        {!loading && promos.length === 0 && (
          <p className="rounded-2xl bg-charcoal-soft p-4 text-sm text-ash ring-1 ring-cream/10">
            No promotions yet — add a combo, family pack or weekend special above.
          </p>
        )}
      </div>
    </div>
  );
}

function PromoRow({
  promo,
  onSave,
  onDelete,
}: {
  promo: Promotion;
  onSave: (patch: Partial<Promotion>) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(promo.title);
  const [description, setDescription] = useState(promo.description);
  const [rand, setRand] = useState(promo.price_cents != null ? (promo.price_cents / 100).toFixed(2) : "");

  const dirty =
    title !== promo.title ||
    description !== promo.description ||
    rand !== (promo.price_cents != null ? (promo.price_cents / 100).toFixed(2) : "");

  function save() {
    const price_cents = rand.trim() === "" ? null : Math.round(Number(rand) * 100);
    onSave({ title, description, price_cents });
  }

  return (
    <div className="rounded-2xl bg-charcoal-soft p-4 ring-1 ring-cream/10">
      <span className="rounded-full bg-cream/10 px-3 py-1 text-xs font-semibold text-cream">
        {KINDS.find((k) => k.value === promo.kind)?.label ?? promo.kind}
      </span>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-2 w-full rounded-lg bg-charcoal px-3 py-2 text-sm font-semibold text-cream"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-2 w-full rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
      />
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm text-ash">R</span>
        <input
          value={rand}
          onChange={(e) => setRand(e.target.value)}
          inputMode="decimal"
          placeholder="Leave blank if price varies"
          className="w-40 rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
        />
        {promo.price_cents != null && (
          <span className="text-xs text-ash">now {formatRand(promo.price_cents)}</span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!dirty}
          className="rounded-full bg-ember px-4 py-1.5 text-xs font-bold text-charcoal-deep disabled:opacity-40"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => onSave({ active: !promo.active })}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            promo.active ? "bg-cream/10 text-cream" : "bg-chilli/20 text-chilli"
          }`}
        >
          {promo.active ? "Active" : "Inactive — tap to activate"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto rounded-full bg-cream/10 px-4 py-1.5 text-xs font-semibold text-ash hover:bg-chilli/20 hover:text-chilli"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function AddPromoForm({ onAdd }: { onAdd: (promo: Omit<Promotion, "id">) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState(KINDS[0].value);
  const [rand, setRand] = useState("");

  function submit() {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    onAdd({
      title: title.trim(),
      description: description.trim(),
      kind,
      price_cents: rand.trim() === "" ? null : Math.round(Number(rand) * 100),
      active: true,
      sort_order: 99,
    });
    setTitle("");
    setDescription("");
    setRand("");
  }

  return (
    <div className="mt-4 rounded-2xl bg-charcoal-soft p-4 ring-1 ring-cream/10">
      <select
        value={kind}
        onChange={(e) => setKind(e.target.value)}
        className="rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
      >
        {KINDS.map((k) => (
          <option key={k.value} value={k.value}>
            {k.label}
          </option>
        ))}
      </select>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title, e.g. 'Buy 5 get 6th free'"
        className="mt-2 w-full rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Description"
        className="mt-2 w-full rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
      />
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm text-ash">R</span>
        <input
          value={rand}
          onChange={(e) => setRand(e.target.value)}
          inputMode="decimal"
          placeholder="Leave blank if price varies"
          className="w-40 rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
        />
        <button
          type="button"
          onClick={submit}
          className="ml-auto rounded-full bg-ember px-4 py-1.5 text-xs font-bold text-charcoal-deep"
        >
          Add promotion
        </button>
      </div>
    </div>
  );
}
