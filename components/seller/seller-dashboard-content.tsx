import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "@/components/shared/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingSummary } from "@/types/domain";

type SellerDashboardContentProps = {
  displayName: string;
  listings: ListingSummary[];
};

function SellerDashboardContent({ displayName, listings }: SellerDashboardContentProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border/70 bg-card px-6 py-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="outline">Seller workspace</Badge>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Manage your available waste stock</h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {displayName}, publish material listings, keep pricing current, and review buyer inquiries from one lean dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline">
              <Link href="/seller/inquiries">View inquiries</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/seller/listings/new">Create listing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Your listings</h2>
            <p className="mt-1 text-sm text-muted-foreground">Edit core listing details and keep current images attached.</p>
          </div>
          <Badge variant="secondary">{listings.length} active</Badge>
        </div>

        {listings.length === 0 ? (
          <EmptyState
            action={
              <Button asChild>
                <Link href="/seller/listings/new">Add your first listing</Link>
              </Button>
            }
            description="You do not have any published material yet. Add one listing to make inventory visible to buyers."
            title="No listings yet"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                footer={
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/listings/${listing.id}`}>Preview</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link href={`/seller/listings/${listing.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                }
                href={`/seller/listings/${listing.id}/edit`}
                listing={listing}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export { SellerDashboardContent };
