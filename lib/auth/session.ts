import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { applyAuthSessionCookies, AUTH_COOKIE_NAMES, clearAuthSessionCookies } from "@/lib/auth/cookies";
import { ensureProfileRecord, getProfileByUserId } from "@/lib/data/profiles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppRole, SessionUser } from "@/types/domain";

async function readStoredTokens() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value ?? null,
    refreshToken: cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value ?? null,
    cookieStore,
  };
}

async function getUserFromAccessToken(accessToken: string) {
  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.getUser(accessToken);

  if (error) {
    return null;
  }

  return data.user;
}

async function refreshSession(refreshToken: string) {
  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    return null;
  }

  const cookieStore = await cookies();
  applyAuthSessionCookies(cookieStore, data.session);

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: data.user,
  };
}

async function buildSessionUser(user: User, accessToken: string, refreshToken: string | null) {
  const profile = await ensureProfileRecord(accessToken, user);

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role,
    accessToken,
    refreshToken,
    user,
  } satisfies SessionUser;
}

export async function setSessionFromAuth(accessToken: string, refreshToken: string) {
  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? "Unable to store the current session.");
  }

  const cookieStore = await cookies();
  applyAuthSessionCookies(cookieStore, data.session);
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();
  clearAuthSessionCookies(cookieStore);
}

export async function getOptionalSessionUser(): Promise<SessionUser | null> {
  const { accessToken, refreshToken, cookieStore } = await readStoredTokens();

  if (!accessToken && !refreshToken) {
    return null;
  }

  let user: User | null = accessToken ? await getUserFromAccessToken(accessToken) : null;
  let resolvedAccessToken = accessToken;
  let resolvedRefreshToken = refreshToken;

  if (!user && refreshToken) {
    const refreshed = await refreshSession(refreshToken);

    if (refreshed) {
      resolvedAccessToken = refreshed.accessToken;
      resolvedRefreshToken = refreshed.refreshToken;
      user = refreshed.user;
    }
  }

  if (!user || !resolvedAccessToken) {
    clearAuthSessionCookies(cookieStore);
    return null;
  }

  return buildSessionUser(user, resolvedAccessToken, resolvedRefreshToken);
}

export async function requireSessionUser() {
  const sessionUser = await getOptionalSessionUser();

  if (!sessionUser) {
    throw new Error("You must be signed in to continue.");
  }

  return sessionUser;
}

export async function requireRole(role: AppRole) {
  const sessionUser = await requireSessionUser();

  if (sessionUser.role !== role) {
    throw new Error("You do not have permission to perform this action.");
  }

  return sessionUser;
}

export async function getCurrentProfile() {
  const sessionUser = await getOptionalSessionUser();

  if (!sessionUser) {
    return null;
  }

  return getProfileByUserId(sessionUser.accessToken, sessionUser.id);
}
