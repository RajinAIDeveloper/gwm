import Link from "next/link";

import { signOut } from "@/app/actions/auth";
import { MobileNavDrawer } from "@/components/shared/mobile-nav-drawer";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getOptionalSessionUser } from "@/lib/auth/session";
import { getUnreadInquiryCountForBuyer, getUnreadInquiryCountForSeller } from "@/lib/data/inquiries";

function formatRoleLabel(role: string) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

type NavigationLink = {
  href: string;
  label: string;
  emphasized?: boolean;
  count?: number;
};

function navigationLinkClass(emphasized = false) {
  return cn(
    "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors",
    emphasized
      ? "border-primary/25 bg-primary/10 text-foreground hover:bg-primary/14"
      : "border-transparent bg-transparent text-muted-foreground hover:border-border/70 hover:bg-background/70 hover:text-foreground",
  );
}

async function AppHeader() {
  const sessionUser = await getOptionalSessionUser();
  const unreadInquiryCount =
    sessionUser?.role === "seller"
      ? await getUnreadInquiryCountForSeller(sessionUser.id, sessionUser.accessToken)
      : sessionUser?.role === "buyer"
        ? await getUnreadInquiryCountForBuyer(sessionUser.id, sessionUser.accessToken)
        : 0;
  const sellerLinks: NavigationLink[] = [
    { href: "/browse", label: "Browse" },
    { href: "/seller", label: "Dashboard", emphasized: true },
    {
      href: "/seller/inquiries",
      label: "Inquiries",
      count: unreadInquiryCount,
    },
  ];
  const buyerLinks: NavigationLink[] = [
    { href: "/browse", label: "Browse", emphasized: true },
    { href: "/inquiries", label: "My inquiries", count: unreadInquiryCount },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/following", label: "Following" },
  ];
  const guestLinks: NavigationLink[] = [
    { href: "/browse", label: "Browse", emphasized: true },
    { href: "/sign-in", label: "Sign in" },
  ];
  const navigationLinks =
    sessionUser?.role === "seller" ? sellerLinks : sessionUser?.role === "buyer" ? buyerLinks : guestLinks;

  async function handleSignOut() {
    "use server";
    await signOut();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <PageContainer className="py-3 sm:py-4">
        <div className="market-surface flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-6">
          <div className="flex items-start justify-between gap-4 sm:items-center">
            <Link className="min-w-0" href="/">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold tracking-[0.22em] text-primary-foreground shadow-lg shadow-primary/20">
                  GWM
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold tracking-[0.28em] text-foreground uppercase">Garment Waste Marketplace</p>
                  <p className="truncate text-xs text-muted-foreground">Resale, recovery, and sourcing for garment surplus</p>
                </div>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              {sessionUser ? <Badge variant="outline">{formatRoleLabel(sessionUser.role)}</Badge> : null}
              <MobileNavDrawer
                links={navigationLinks}
                roleLabel={sessionUser ? formatRoleLabel(sessionUser.role) : undefined}
                unreadInquiryCount={unreadInquiryCount}
                userLabel={
                  sessionUser
                    ? sessionUser.user.user_metadata?.display_name || sessionUser.email || "Marketplace user"
                    : undefined
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:min-w-0 lg:flex-1 lg:flex-row lg:items-center lg:justify-between">
            <nav className="hidden overflow-x-auto lg:block">
              <div className="flex min-w-max items-center gap-2 rounded-full border border-border/70 bg-background/75 p-1.5 shadow-sm">
                {navigationLinks.map((link) => (
                  <Link key={link.href} className={navigationLinkClass(link.emphasized)} href={link.href}>
                    <span>{link.label}</span>
                    {link.count && link.count > 0 ? (
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                        {link.count}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="hidden flex-wrap items-center justify-between gap-3 lg:flex lg:justify-end">
              {sessionUser ? (
                <>
                  <div className="min-w-0 rounded-3xl border border-border/70 bg-background/70 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {sessionUser.user.user_metadata?.display_name || sessionUser.email || "Marketplace user"}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{formatRoleLabel(sessionUser.role)}</Badge>
                      {unreadInquiryCount > 0 ? <Badge>{unreadInquiryCount} unread</Badge> : null}
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
          </div>
        </div>
      </PageContainer>
    </header>
  );
}

export { AppHeader };
