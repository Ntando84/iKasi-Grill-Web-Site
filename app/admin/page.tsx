"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const DEMO_ADMIN_PASSWORD = "admin";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (password === DEMO_ADMIN_PASSWORD) {
        // Claim owner role on initial setup
        try {
          await supabase.rpc("claim_owner");
        } catch (err) {
          // Silently handle if claim_owner fails or was already claimed
        }

        toast.success("Welcome back!");
        router.push("/admin");
      } else {
        toast.error("Incorrect password");
      }
    } catch {
      toast.error("An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-charcoal-soft p-6 ring-1 ring-cream/10"
      >
        <h1 className="font-display text-xl text-cream">Admin Sign In</h1>
        <div>
          <label className="block text-xs font-semibold text-ash mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl bg-charcoal px-3 py-2 text-sm text-cream ring-1 ring-cream/10 focus:outline-none focus:ring-ember"
            placeholder="Enter password"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-ember py-2 text-sm font-bold text-charcoal-deep hover:bg-ember/90 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}
