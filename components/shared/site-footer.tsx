import Link from "next/link";

import { PageContainer } from "@/components/shared/page-container";

function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background/95">
      <PageContainer className="flex flex-col gap-3 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Garment Waste Marketplace MVP</p>
        <div className="flex items-center gap-4">
          <Link className="transition-colors hover:text-foreground" href="/browse">
            Browse listings
          </Link>
          <Link className="transition-colors hover:text-foreground" href="/sign-up">
            Create account
          </Link>
        </div>
      </PageContainer>
    </footer>
  );
}

export { SiteFooter };
