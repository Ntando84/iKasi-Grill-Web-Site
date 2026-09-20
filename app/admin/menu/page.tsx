"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { getMenuItems, upsertMenuItem, deleteMenuItem } from "@/lib/db";
import { CATEGORY_ORDER } from "@/lib/seed-data";
import type { MenuItem } from "@/lib/types";

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setItems(await getMenuItems());
    } catch {
      toast.error("Could not load the menu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, MenuItem[]>();
    for (const item of items) {
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

  async function save(id: string, patch: Partial<MenuItem>) {
    try {
      await upsertMenuItem({ id, ...patch });
      toast.success("Saved");
      refresh();
    } catch {
      toast.error("Could not save");
    }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Remove "${name}" from the menu?`)) return;
    try {
      await deleteMenuItem(id);
      toast.success("Item removed");
      refresh();
    } catch {
      toast.error("Could not remove that item");
    }
  }

  async function add(item: Omit<MenuItem, "id">) {
    try {
      await upsertMenuItem(item);
      toast.success("Item added");
      setShowAdd(false);
      refresh();
    } catch {
      toast.error("Could not add that item");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-cream">Menu</h1>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="rounded-full bg-ember px-4 py-1.5 text-xs font-bold text-charcoal-deep"
        >
          {showAdd ? "Close" : "Add item"}
        </button>
      </div>

      {showAdd && <AddItemForm existingCategories={CATEGORY_ORDER} onAdd={add} />}
      {loading && <p className="mt-4 text-sm text-ash">Loading menu…</p>}

      <div className="mt-6 space-y-8">
        {grouped.map(([category, categoryItems]) => (
          <div key={category}>
            <h2 className="font-display text-lg text-ember">{category}</h2>
            <div className="mt-3 space-y-3">
              {categoryItems.map((item) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  onSave={(patch) => save(item.id, patch)}
                  onDelete={() => remove(item.id, item.name)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MenuItemRow({
  item,
  onSave,
  onDelete,
}: {
  item: MenuItem;
  onSave: (patch: Partial<MenuItem>) => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [rand, setRand] = useState((item.price_cents / 100).toFixed(2));
  const [priceNote, setPriceNote] = useState(item.price_note);

  const dirty =
    name !== item.name ||
    description !== item.description ||
    priceNote !== item.price_note ||
    Number(rand) !== item.price_cents / 100;

  function save() {
    const price_cents = Math.round(Number(rand) * 100);
    if (Number.isNaN(price_cents) || price_cents < 0) return;
    onSave({ name, description, price_note: priceNote, price_cents });
  }

  return (
    <div className="rounded-2xl bg-charcoal-soft p-4 ring-1 ring-cream/10">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
          placeholder="Name"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-ash">R</span>
          <input
            value={rand}
            onChange={(e) => setRand(e.target.value)}
            inputMode="decimal"
            className="w-24 rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
            placeholder="0.00"
          />
        </div>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="mt-2 w-full rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
        placeholder="Description"
      />
      <input
        value={priceNote}
        onChange={(e) => setPriceNote(e.target.value)}
        className="mt-2 w-full rounded-lg bg-charcoal px-3 py-2 text-xs text-ash"
        placeholder="Price note, e.g. 'R25 - R40 depending on size'"
      />
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
          onClick={() => onSave({ available: !item.available })}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
            item.available ? "bg-cream/10 text-cream" : "bg-chilli/20 text-chilli"
          }`}
        >
          {item.available ? "Available" : "Unavailable — tap to restore"}
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

function AddItemForm({
  existingCategories,
  onAdd,
}: {
  existingCategories: string[];
  onAdd: (item: Omit<MenuItem, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(existingCategories[0] ?? "");
  const [customCategory, setCustomCategory] = useState("");
  const [rand, setRand] = useState("");

  function submit() {
    const finalCategory = category === "__custom__" ? customCategory.trim() : category;
    const price_cents = Math.round(Number(rand) * 100);
    if (!name.trim() || !finalCategory || Number.isNaN(price_cents)) {
      toast.error("Name, category and price are required");
      return;
    }
    onAdd({
      name: name.trim(),
      description: description.trim(),
      category: finalCategory,
      price_cents,
      price_note: "",
      available: true,
      sort_order: 99,
    });
    setName("");
    setDescription("");
    setRand("");
  }

  return (
    <div className="mt-4 rounded-2xl bg-charcoal-soft p-4 ring-1 ring-cream/10">
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New item name"
          className="rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-ash">R</span>
          <input
            value={rand}
            onChange={(e) => setRand(e.target.value)}
            inputMode="decimal"
            placeholder="0.00"
            className="w-24 rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
          />
        </div>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Description"
        className="mt-2 w-full rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
        >
          {existingCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value="__custom__">New category…</option>
        </select>
        {category === "__custom__" && (
          <input
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Category name"
            className="rounded-lg bg-charcoal px-3 py-2 text-sm text-cream"
          />
        )}
        <button
          type="button"
          onClick={submit}
          className="ml-auto rounded-full bg-ember px-4 py-1.5 text-xs font-bold text-charcoal-deep"
        >
          Add to menu
        </button>
      </div>
    </div>
  );
}
