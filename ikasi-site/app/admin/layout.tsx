"use client";

import { useEffect, useState } from "react";
import Link, { LinkProps } from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/db";
import { isDemoAuthed, clearDemoAuthed } from "@/lib/adminAuth";

const supabase = isSupabaseConfigured
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null;

const TABS = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/menu", label: "Menu" },
  { href: "/admin/promotions", label: "Promotions" },
  { href: "/admin/reports", label: "Reports" },
] as const;

type Status = "checking" | "ok" | "needs-claim";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (pathname === "/admin/login") return;

    if (supabase) {
      supabase.auth.getSession().then(async ({ data }) => {
        if (!data.session) {
          router.replace("/admin/login");
          return;
        }
        const { data: role } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id)
          .eq("role", "admin")
          .maybeSingle();
        setStatus(role ? "ok" : "needs-claim");
      });
    } else {
      if (!isDemoAuthed()) {
        router.replace("/admin/login");
        return;
      }
      setStatus("ok");
    }
  }, [pathname, router]);

  async function claim() {
    if (!supabase) return;
    const { data } = await supabase.rpc("claim_owner");
    if (data) setStatus("ok");
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    clearDemoAuthed();
    router.replace("/admin/login");
  }

  if (pathname === "/admin/login") return <>{children}</>;

  if (status === "checking") {
    return <p className="p-8 text-sm text-ash">Loading…</p>;
  }

  if (status === "needs-claim") {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-sm rounded-3xl bg-charcoal-soft p-6 text-center ring-1 ring-cream/10">
          <h1 className="font-display text-2xl text-cream">Owner access</h1>
          <p className="mt-2 text-sm text-ash">
            This account is not the grill owner yet. If this is your grill, claim the
            owner account now — it can only be done once.
          </p>
          <button
            type="button"
            onClick={claim}
            className="mt-5 w-full rounded-full bg-ember py-3 text-sm font-bold text-charcoal-deep"
          >
            Claim owner account
          </button>
          <button type="button" onClick={signOut} className="mt-3 text-xs text-ash hover:text-ember">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-cream/10 bg-charcoal/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <p className="font-display text-lg tracking-wide text-cream">
            iKasi <span className="text-ember">Admin</span>
          </p>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-ash hover:text-ember">
              View site
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream hover:bg-chilli hover:text-cream"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href as LinkProps["href"]}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${
                pathname === tab.href ? "bg-ember text-charcoal-deep" : "text-ash hover:text-ember"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
