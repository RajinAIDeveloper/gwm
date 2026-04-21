import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl, LISTING_IMAGES_BUCKET } from "@/lib/supabase/config";

export function createSupabaseServerClient(accessToken?: string) {
  return createClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function getListingImageUrl(path: string) {
  const client = createSupabaseServerClient();
  const { data } = client.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(path);

  return data.publicUrl;
}
