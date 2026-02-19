"use client";

import { createBrowserClient } from "@supabase/ssr";

type BrowserClient = ReturnType<typeof createBrowserClient>;
let supabaseInstance: BrowserClient | null = null;

export function createClient(): BrowserClient {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || !url.startsWith("http")) {
    const stub = {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: {}, error: { message: "Not configured" } }),
        signInWithOAuth: async () => ({ error: { message: "Not configured" } }),
        signUp: async () => ({ data: {}, error: { message: "Not configured" } }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
    } as unknown as BrowserClient;
    return stub;
  }

  supabaseInstance = createBrowserClient(url, key);
  return supabaseInstance;
}
