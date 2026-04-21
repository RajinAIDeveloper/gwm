export const LISTING_IMAGES_BUCKET = "listing-images";

export function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url || url === "your_url") {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return url;
}

export function getSupabaseAnonKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!key || key === "your_key") {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.");
  }

  return key;
}
