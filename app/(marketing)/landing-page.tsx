import Link from "next/link";

import { ListingCard } from "@/components/shared/listing-card";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingSummary } from "@/types/domain";

const sampleListings: ListingSummary[] = [
  {
    id: "sample-deadstock-rolls",
    sellerId: "sample-seller",
    sellerName: "Dhaka Knit Surplus",
    sellerRatingAverage: 4.8,
    sellerRatingCount: 12,
    title: "Deadstock cotton jersey rolls",
    description: "Clean surplus rolls from a completed export run. Suitable for sampling, patchwork, and small-batch production.",
    category: "deadstock",
    quantityKg: 180,
    pricePerKg: 1.8,
    imageUrl: null,
    createdAt: "2026-04-21T00:00:00.000Z",
  },
  {
    id: "sample-mixed-offcuts",
    sellerId: "sample-seller-2",
    sellerName: "Factory Floor Recovery",
    sellerRatingAverage: 4.3,
    sellerRatingCount: 7,
    title: "Mixed woven offcuts",
    description: "Sorted bundles of woven offcuts ready for upcycling, insulation, stuffing, and textile recycling pilots.",
    category: "offcuts",
    quantityKg: 95,
    pricePerKg: 0.95,
    imageUrl: null,
    createdAt: "2026-04-20T00:00:00.000Z",
  },
];

function MarketingLandingPage() {
  return (
    <div className="pb-20 pt-6 sm:pt-8 lg:pt-10">
      <section>
        <PageContainer className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="market-panel market-grid overflow-hidden px-5 py-8 sm:px-7 sm:py-10 lg:px-10 lg:py-12">
            <div className="relative z-10 max-w-3xl space-y-6">
              <Badge variant="outline">Lean B2B marketplace MVP</Badge>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  Move garment waste inventory into active supply instead of storage.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  Garment Waste Marketplace connects sellers holding surplus textiles with buyers looking for
                  deadstock, offcuts, trims, and mixed scraps. The MVP focuses on listing, browsing, trust signals,
                  and one clear inquiry path.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg">
                  <Link href="/sign-up">Create an account</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/browse">Browse listings</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="market-panel space-y-5 px-5 py-6 sm:px-7 lg:px-8">
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <StatCard label="Seller flow" value="Create, edit, and track inquiries" />
              <StatCard label="Buyer flow" value="Browse, save, follow, and rate" />
              <StatCard label="Responsive shell" value="Built for mobile to widescreen" />
            </div>

            <div className="rounded-[1.75rem] border border-border/70 bg-background/70 p-5">
              <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">MVP scope</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
                <li>Supabase Auth, Postgres, Storage, and RLS</li>
                <li>Seller dashboard, listing creation, and inbox management</li>
                <li>Buyer browse, rating, wishlist, following, and inquiry threads</li>
              </ul>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-14 sm:py-16 lg:py-20">
        <PageContainer className="space-y-8">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">Shared card preview</p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Reusable listing cards carry supplier trust, stock, and price in one compact surface.
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              The same card contract works in public discovery, wishlist views, and future supplier collections without
              duplicating layout logic.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {sampleListings.map((listing) => (
              <ListingCard key={listing.id} href="/browse" listing={listing} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section>
        <PageContainer>
          <div className="market-panel grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">Ready to use</p>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Buyers and sellers now share the same polished responsive shell.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                The current root route already uses this marketing page, so the visual system is live across landing,
                browse, detail, and account flows.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild size="lg">
                <Link href="/browse">Explore listings</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        </PageContainer>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 text-base font-medium text-foreground">{value}</p>
    </div>
  );
}

export default MarketingLandingPage;
