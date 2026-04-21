import type { Session } from "@supabase/supabase-js";

export const AUTH_COOKIE_NAMES = {
  accessToken: "gwm-access-token",
  refreshToken: "gwm-refresh-token",
} as const;

const ACCESS_COOKIE_MAX_AGE = 60 * 60;
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type CookieTarget = {
  set: (name: string, value: string, options: Record<string, unknown>) => void;
  delete: (name: string) => void;
};

function getBaseCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function applyAuthSessionCookies(target: CookieTarget, session: Session) {
  target.set(
    AUTH_COOKIE_NAMES.accessToken,
    session.access_token,
    getBaseCookieOptions(session.expires_in ?? ACCESS_COOKIE_MAX_AGE),
  );

  target.set(
    AUTH_COOKIE_NAMES.refreshToken,
    session.refresh_token,
    getBaseCookieOptions(REFRESH_COOKIE_MAX_AGE),
  );
}

export function clearAuthSessionCookies(target: CookieTarget) {
  target.delete(AUTH_COOKIE_NAMES.accessToken);
  target.delete(AUTH_COOKIE_NAMES.refreshToken);
}
