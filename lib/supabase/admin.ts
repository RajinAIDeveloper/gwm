import { createClient } from "@supabase/supabase-js";

import { getOptionalSupabaseServiceRoleKey, getSupabaseUrl } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createSupabaseAdminClient() {
  const serviceRoleKey = getOptionalSupabaseServiceRoleKey();

  if (!serviceRoleKey) {
    return null;
  }

  return createClient<Database>(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getAuthUserEmailById(userId: string) {
  const client = createSupabaseAdminClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client.auth.admin.getUserById(userId);

  if (error) {
    throw new Error(error.message);
  }

  return data.user?.email ?? null;
}
