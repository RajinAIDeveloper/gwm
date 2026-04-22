import Link from "next/link";

import { PageContainer } from "@/components/shared/page-container";

function SiteFooter() {
  return (
    <footer className="pb-5 pt-8">
      <PageContainer>
        <div className="market-surface flex flex-col gap-6 px-5 py-6 text-sm text-muted-foreground sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div className="max-w-2xl space-y-2">
            <p className="text-sm font-semibold tracking-[0.24em] text-foreground uppercase">Garment Waste Marketplace</p>
            <p className="max-w-xl leading-6">
              A lean sourcing workspace for deadstock, offcuts, trims, and textile surplus. Built to keep discovery,
              inquiry, and supplier follow-up simple.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link className="transition-colors hover:text-foreground" href="/browse">
              Browse listings
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/wishlist">
              Wishlist
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/sign-up">
              Create account
            </Link>
          </div>
        </div>
      </PageContainer>
    </footer>
  );
}

export { SiteFooter };
