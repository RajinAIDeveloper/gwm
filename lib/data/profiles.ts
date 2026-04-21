import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { AppRole, Profile } from "@/types/domain";
import { APP_ROLES } from "@/types/domain";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    role: row.role,
    displayName: row.display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && APP_ROLES.includes(value as AppRole);
}

export function getDisplayNameFromMetadata(user: User) {
  const rawValue = user.user_metadata?.display_name;

  if (typeof rawValue !== "string") {
    return null;
  }

  const normalized = rawValue.trim();
  return normalized.length > 0 ? normalized : null;
}

export function getRoleFromMetadata(user: User): AppRole | null {
  const rawValue = user.user_metadata?.role;
  return isAppRole(rawValue) ? rawValue : null;
}

export async function getProfileByUserId(accessToken: string, userId: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapProfile(data) : null;
}

export async function ensureProfileRecord(accessToken: string, user: User) {
  const existingProfile = await getProfileByUserId(accessToken, user.id);
  if (existingProfile) {
    return existingProfile;
  }

  const role = getRoleFromMetadata(user);
  if (!role) {
    throw new Error("Account role is missing. Please sign up again.");
  }

  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("profiles")
    .insert({
      id: user.id,
      role,
      display_name: getDisplayNameFromMetadata(user),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapProfile(data);
}
