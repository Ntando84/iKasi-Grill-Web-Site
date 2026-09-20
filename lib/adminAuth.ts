export const DEMO_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "changeme";
const LS_KEY = "ikasi_admin_authed";

// Demo-mode gate only (used when Supabase isn't configured). This is a lightweight
// stand-in for real auth — fine for a quick demo, not for a real launch. Once
// NEXT_PUBLIC_SUPABASE_URL/ANON_KEY are set, real Supabase auth takes over instead.
export function isDemoAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LS_KEY) === "1";
}

export function setDemoAuthed() {
  window.localStorage.setItem(LS_KEY, "1");
}

export function clearDemoAuthed() {
  window.localStorage.removeItem(LS_KEY);
}
