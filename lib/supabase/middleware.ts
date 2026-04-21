import { type NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

import { applyAuthSessionCookies, AUTH_COOKIE_NAMES, clearAuthSessionCookies } from "@/lib/auth/cookies";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/types/domain";

async function getUserFromAccessToken(accessToken: string) {
  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.getUser(accessToken);

  if (error) {
    return null;
  }

  return data.user;
}

async function getRole(accessToken: string, userId: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client.from("profiles").select("role").eq("id", userId).maybeSingle();

  if (error || !data) {
    return null;
  }

  return data.role;
}

async function refreshSession(refreshToken: string) {
  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.session || !data.user) {
    return null;
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: data.user,
    session: data.session,
  };
}

async function buildSessionUser(user: User, accessToken: string, refreshToken: string | null): Promise<SessionUser | null> {
  const role = await getRole(accessToken, user.id);

  if (!role) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role,
    accessToken,
    refreshToken,
    user,
  };
}

export async function getMiddlewareSession(request: NextRequest) {
  const response = NextResponse.next();
  const accessToken = request.cookies.get(AUTH_COOKIE_NAMES.accessToken)?.value ?? null;
  const refreshToken = request.cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value ?? null;

  if (!accessToken && !refreshToken) {
    return { response, sessionUser: null };
  }

  let resolvedAccessToken = accessToken;
  let resolvedRefreshToken = refreshToken;
  let user = accessToken ? await getUserFromAccessToken(accessToken) : null;

  if (!user && refreshToken) {
    const refreshed = await refreshSession(refreshToken);

    if (refreshed) {
      resolvedAccessToken = refreshed.accessToken;
      resolvedRefreshToken = refreshed.refreshToken;
      user = refreshed.user;
      applyAuthSessionCookies(response.cookies, refreshed.session);
    }
  }

  if (!user || !resolvedAccessToken) {
    clearAuthSessionCookies(response.cookies);
    return { response, sessionUser: null };
  }

  const sessionUser = await buildSessionUser(user, resolvedAccessToken, resolvedRefreshToken);

  if (!sessionUser) {
    clearAuthSessionCookies(response.cookies);
    return { response, sessionUser: null };
  }

  return { response, sessionUser };
}
