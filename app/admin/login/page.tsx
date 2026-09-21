"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/db";
import { DEMO_ADMIN_PASSWORD, setDemoAuthed } from "@/lib/adminAuth";

const supabase = isSupabaseConfigured
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  : null;

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      if (supabase) {
        if (mode === "signup") {
          const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
          if (signUpError) throw signUpError;

          if (!data.session) {
            // Project has email confirmation turned on — no session yet.
            setInfo("Account created. Check your email to confirm it, then sign in below.");
            setMode("signin");
            return;
          }
          // First account created claims the owner role automatically — this only
          // succeeds once, matching the one-time "claim owner" step already set
          // up in your Supabase project.
          await supabase.rpc("claim_owner").catch(() => {});
          router.push("/admin");
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          await supabase.rpc("claim_owner").catch(() => {});
          router.push("/admin");
        }
      } else {
        if (password !== DEMO_ADMIN_PASSWORD) {
          throw new Error("Incorrect password.");
        }
        setDemoAuthed();
        router.push("/admin");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <div className="rounded-3xl bg-charcoal-soft p-6 ring-1 ring-cream/10">
        <h1 className="font-display text-2xl text-cream">
          {mode === "signup" ? "Create owner account" : "Owner login"}
        </h1>
        <p className="mt-1 text-sm text-ash">
          {!supabase
            ? "Demo mode — enter the admin password to continue."
            : mode === "signup"
              ? "First time here? Create the owner account below — this only works once."
              : "Sign in with your owner email and password."}
        </p>

        <div className="mt-5 space-y-3">
          {supabase && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
              className="w-full rounded-lg bg-charcoal px-4 py-3 text-sm text-cream ring-1 ring-cream/10"
            />
          )}
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded-lg bg-charcoal px-4 py-3 text-sm text-cream ring-1 ring-cream/10"
          />
          {error && <p className="text-sm text-chilli">{error}</p>}
          {info && <p className="text-sm text-ember">{info}</p>}
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="w-full rounded-full bg-ember py-3 text-sm font-bold text-charcoal-deep disabled:opacity-50"
          >
            {loading ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>

          {supabase && (
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError("");
                setInfo("");
              }}
              className="w-full text-center text-xs text-ash hover:text-ember"
            >
              {mode === "signup"
                ? "Already have an account? Sign in instead"
                : "First time? Create the owner account"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
