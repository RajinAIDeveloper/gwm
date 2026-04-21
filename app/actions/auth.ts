"use server";

import type { ActionResult } from "@/types/domain";
import { clearCurrentSession } from "@/lib/auth/session";
import { getDefaultRouteForRole } from "@/lib/auth/routes";
import { ensureProfileRecord } from "@/lib/data/profiles";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateSignInFormData, validateSignUpFormData } from "@/lib/validation/auth";
import { setSessionFromAuth } from "@/lib/auth/session";

export async function signUp(_previousState: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = validateSignUpFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      fieldErrors: parsed.fieldErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName || null,
        role: parsed.data.role,
      },
    },
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  if (!data.user) {
    return {
      ok: false,
      message: "Unable to create the account.",
    };
  }

  if (!data.session) {
    return {
      ok: true,
      message: "Account created. Check your email to confirm your account before signing in.",
      redirectTo: "/sign-in",
    };
  }

  await setSessionFromAuth(data.session.access_token, data.session.refresh_token);
  const profile = await ensureProfileRecord(data.session.access_token, data.user);

  return {
    ok: true,
    message: "Account created successfully.",
    redirectTo: getDefaultRouteForRole(profile.role),
  };
}

export async function signIn(_previousState: ActionResult | undefined, formData: FormData): Promise<ActionResult> {
  const parsed = validateSignInFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      fieldErrors: parsed.fieldErrors,
      message: "Please correct the highlighted fields.",
    };
  }

  const client = createSupabaseServerClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.session || !data.user) {
    return {
      ok: false,
      message: error?.message ?? "Invalid email or password.",
    };
  }

  await setSessionFromAuth(data.session.access_token, data.session.refresh_token);
  const profile = await ensureProfileRecord(data.session.access_token, data.user);

  return {
    ok: true,
    message: "Signed in successfully.",
    redirectTo: getDefaultRouteForRole(profile.role),
  };
}

export async function signOut(): Promise<ActionResult> {
  await clearCurrentSession();

  return {
    ok: true,
    redirectTo: "/sign-in",
  };
}
