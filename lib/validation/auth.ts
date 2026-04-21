import type { AuthFormInput, FieldErrors } from "@/types/domain";
import { APP_ROLES } from "@/types/domain";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function validateSignInFormData(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const fieldErrors: FieldErrors = {};

  if (!email || !email.includes("@")) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (password.length < 8) {
    fieldErrors.password = "Password must be at least 8 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors };
  }

  return {
    ok: true as const,
    data: { email, password } satisfies AuthFormInput,
  };
}

export function validateSignUpFormData(formData: FormData) {
  const base = validateSignInFormData(formData);
  const role = getString(formData, "role");
  const displayName = getString(formData, "displayName");
  const fieldErrors: FieldErrors = base.ok ? {} : { ...base.fieldErrors };

  if (!APP_ROLES.includes(role as (typeof APP_ROLES)[number])) {
    fieldErrors.role = "Select a valid account role.";
  }

  if (displayName.length > 80) {
    fieldErrors.displayName = "Display name must be 80 characters or fewer.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors };
  }

  if (!base.ok) {
    return { ok: false as const, fieldErrors };
  }

  return {
    ok: true as const,
    data: {
      email: base.data.email,
      password: base.data.password,
      role: role as AuthFormInput["role"],
      displayName,
    } satisfies AuthFormInput,
  };
}
