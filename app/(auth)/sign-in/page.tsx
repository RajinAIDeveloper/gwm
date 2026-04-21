import { signIn } from "@/app/actions/auth";
import { AuthForm } from "@/components/shared/auth-form";
import { AuthShell } from "@/components/shared/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell
      asideDescription="Public browse is open to everyone, but inquiry submission and seller tools require an authenticated account."
      asideTitle="Lean MVP access"
      description="Sign in to manage listings as a seller or contact suppliers as a buyer."
      eyebrow="Marketplace access"
      highlights={[
        "Sellers can create listings, update stock details, and review inbound inquiries.",
        "Buyers can browse public listings and send a single inquiry per listing.",
        "Route protection is role-aware and enforced by the backend session contract.",
      ]}
      title="Sign in to Garment Waste Marketplace"
    >
      <AuthForm action={signIn} mode="sign-in" />
    </AuthShell>
  );
}
