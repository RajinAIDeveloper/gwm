import Link from "next/link";

import { signOut } from "@/app/actions/auth";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOptionalSessionUser } from "@/lib/auth/session";

function formatRoleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

async function AppHeader() {
  const sessionUser = await getOptionalSessionUser();

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  return (
    <header className="border-b border-border/70 bg-background/90 backdrop-blur">
      <PageContainer className="flex min-h-16 items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-6">
          <Link className="text-sm font-semibold tracking-[0.18em] uppercase" href="/">
            GWM
          </Link>
          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            <Link className="transition-colors hover:text-foreground" href="/browse">
              Browse
            </Link>
            {sessionUser?.role === "seller" ? (
              <Link className="transition-colors hover:text-foreground" href="/seller">
                Seller dashboard
              </Link>
            ) : null}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {sessionUser ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-foreground">
                  {sessionUser.user.user_metadata?.display_name || sessionUser.email || "Marketplace user"}
                </p>
                <div className="mt-1 flex justify-end">
                  <Badge variant="outline">{formatRoleLabel(sessionUser.role)}</Badge>
                </div>
              </div>
              <form action={handleSignOut}>
                <Button type="submit" variant="outline" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Create account</Link>
              </Button>
            </>
          )}
        </div>
      </PageContainer>
    </header>
  );
}

export { AppHeader };
