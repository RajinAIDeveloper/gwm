export const LISTING_IMAGES_BUCKET = "listing-images";

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && !value.startsWith("your_") ? value : null;
}

export function getSupabaseUrl() {
  const url = readOptionalEnv("NEXT_PUBLIC_SUPABASE_URL");

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  }

  return url;
}

export function getSupabaseAnonKey() {
  const key = readOptionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (!key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured.");
  }

  return key;
}

export function getOptionalSupabaseServiceRoleKey() {
  return readOptionalEnv("SUPABASE_SERVICE_ROLE_KEY");
}

export function getOptionalResendApiKey() {
  return readOptionalEnv("RESEND_API_KEY");
}

export function getOptionalResendFromEmail() {
  return readOptionalEnv("RESEND_FROM_EMAIL");
}

export function getAppBaseUrl() {
  return (readOptionalEnv("APP_BASE_URL") ?? "http://localhost:3000").replace(/\/$/, "");
}
