import { signUp } from "@/app/actions/auth";
import { AuthForm } from "@/components/shared/auth-form";
import { AuthShell } from "@/components/shared/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell
      asideDescription="Choose the role that matches your first workflow. Admin remains backend-only in this MVP and is not exposed in sign-up."
      asideTitle="Start with the right role"
      description="Create a buyer or seller account to access the marketplace flows that match your work."
      eyebrow="Create account"
      highlights={[
        "Seller accounts unlock listing creation, editing, and inquiry review.",
        "Buyer accounts unlock browse, detail review, and the single inquiry form.",
        "Your selected role is stored at sign-up and used for redirects and access control.",
      ]}
      title="Create your marketplace account"
    >
      <AuthForm action={signUp} mode="sign-up" />
    </AuthShell>
  );
}
