"use client";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createClient<Database>> | undefined;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return browserClient;
}
