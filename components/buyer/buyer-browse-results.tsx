import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { ListingCard } from "@/components/shared/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ListingCategory, ListingSummary } from "@/types/domain";

type BuyerBrowseResultsProps = {
  listings: ListingSummary[];
  search: string;
  category?: ListingCategory;
};

export function BuyerBrowseResults({ listings, search, category }: BuyerBrowseResultsProps) {
  if (listings.length === 0) {
    return (
      <EmptyState
        action={
          <Button asChild>
            <Link href="/browse">Clear filters</Link>
          </Button>
        }
        description={
          search || category
            ? "Try a broader search term or switch back to all categories."
            : "No public listings are live yet. Sellers will appear here as soon as stock is published."
        }
        title={search || category ? "No listings match these filters" : "No listings available yet"}
      />
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{listings.length} results</Badge>
          {search ? <Badge variant="outline">Search: {search}</Badge> : null}
        </div>
        <p className="text-sm text-muted-foreground">Open a listing to review details and send one inquiry.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
