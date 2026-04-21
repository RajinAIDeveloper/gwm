import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
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
    <div className="pb-16">
      <section className="border-b border-border/70">
        <PageContainer className="grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-20">
          <div className="max-w-2xl space-y-6">
            <Badge variant="outline">Lean B2B marketplace MVP</Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Move garment waste inventory into active supply instead of storage.
              </h1>
              <p className="text-lg leading-8 text-muted-foreground">
                Garment Waste Marketplace connects sellers holding surplus textiles with buyers looking for deadstock,
                offcuts, trims, and mixed scraps. The MVP focuses on listing, browsing, and one clear inquiry path.
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

          <div className="grid gap-4 rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard label="Seller flow" value="Create + edit listings" />
              <StatCard label="Buyer flow" value="Browse + inquire" />
              <StatCard label="Auth model" value="Role-aware routes" />
            </div>
            <div className="rounded-[1.75rem] border border-border/70 bg-muted/35 p-5">
              <p className="text-sm font-medium tracking-[0.18em] text-muted-foreground uppercase">MVP scope</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
                <li>Supabase Auth, Postgres, Storage, and RLS</li>
                <li>Seller dashboard, listing creation, and editing</li>
                <li>Public browse, listing detail, and a single inquiry form</li>
              </ul>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-14 sm:py-16">
        <PageContainer className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold tracking-[0.22em] text-muted-foreground uppercase">Shared card preview</p>
            <h2 className="text-3xl font-semibold tracking-tight text-foreground">The listing card contract is ready for buyer and seller pages.</h2>
            <p className="text-base leading-7 text-muted-foreground">
              Buyer browse can use it as-is for public discovery. Seller pages can reuse the same surface with custom
              footer actions instead of duplicating layout.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {sampleListings.map((listing) => (
              <ListingCard key={listing.id} href="/browse" listing={listing} />
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="pb-4">
        <PageContainer>
          <EmptyState
            action={
              <Button asChild variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            }
            description="The live landing route still depends on moving the existing root page into the marketing group. This component is ready to be wired by the Architect or an approved root-route change."
            title="Marketing page component prepared"
          />
        </PageContainer>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-background p-4">
      <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 text-base font-medium text-foreground">{value}</p>
    </div>
  );
}

export default MarketingLandingPage;
