"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ActionResult } from "@/types/domain";

type AuthAction = (
  previousState: ActionResult | undefined,
  formData: FormData,
) => Promise<ActionResult>;

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  action: AuthAction;
};

const initialState: ActionResult = {
  ok: false,
};

function AuthForm({ mode, action }: AuthFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isSignUp = mode === "sign-up";
  const [selectedRole, setSelectedRole] = useState<"seller" | "buyer">("seller");

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-6">
      {state.message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-destructive/20 bg-destructive/5 text-destructive"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="grid gap-5">
        {isSignUp ? (
          <FormField
            label="Display name"
            error={state.fieldErrors?.displayName}
            hint="Optional. This appears on listings and inquiries."
          >
            <Input
              aria-invalid={Boolean(state.fieldErrors?.displayName)}
              name="displayName"
              placeholder="Factory outlet, stockroom, or buyer name"
            />
          </FormField>
        ) : null}

        <FormField label="Email" error={state.fieldErrors?.email}>
          <Input
            aria-invalid={Boolean(state.fieldErrors?.email)}
            autoComplete="email"
            name="email"
            placeholder="name@company.com"
            type="email"
          />
        </FormField>

        <FormField label="Password" error={state.fieldErrors?.password} hint="Use at least 8 characters.">
          <Input
            aria-invalid={Boolean(state.fieldErrors?.password)}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            name="password"
            placeholder="Enter your password"
            type="password"
          />
        </FormField>

        {isSignUp ? (
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">Account role</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <RoleOption
                checked={selectedRole === "seller"}
                description="List available garment waste, manage stock, and review inquiries."
                error={state.fieldErrors?.role}
                label="Seller"
                onSelect={setSelectedRole}
                value="seller"
              />
              <RoleOption
                checked={selectedRole === "buyer"}
                description="Browse available stock and contact sellers with a single inquiry."
                error={state.fieldErrors?.role}
                label="Buyer"
                onSelect={setSelectedRole}
                value="buyer"
              />
            </div>
            {state.fieldErrors?.role ? <p className="text-sm text-destructive">{state.fieldErrors.role}</p> : null}
          </fieldset>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button disabled={isPending} size="lg" type="submit">
          {isPending ? "Working..." : isSignUp ? "Create account" : "Sign in"}
        </Button>
        <p className="text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "New to the marketplace?"}{" "}
          <Link
            className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
            href={isSignUp ? "/sign-in" : "/sign-up"}
          >
            {isSignUp ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </form>
  );
}

type FormFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

function FormField({ label, error, hint, children }: FormFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
      {!error && hint ? <span className="text-sm text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

type RoleOptionProps = {
  label: string;
  value: "seller" | "buyer";
  description: string;
  error?: string;
  checked: boolean;
  onSelect: (value: "seller" | "buyer") => void;
};

function RoleOption({ label, value, description, error, checked, onSelect }: RoleOptionProps) {
  return (
    <label
      className={`cursor-pointer rounded-3xl border p-4 transition-colors ${
        error
          ? "border-destructive/40"
          : checked
            ? "border-foreground bg-accent"
            : "border-border hover:border-foreground/30"
      }`}
    >
      <input
        checked={checked}
        className="sr-only"
        name="role"
        onChange={() => onSelect(value)}
        type="radio"
        value={value}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-base font-medium text-foreground">{label}</span>
        <Badge variant="outline">{value}</Badge>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </label>
  );
}

export { AuthForm };
