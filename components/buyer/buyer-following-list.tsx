import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { RatingStars } from "@/components/shared/rating-stars";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FollowedSellerSummary } from "@/types/domain";

type BuyerFollowingListProps = {
  sellers: FollowedSellerSummary[];
};

function BuyerFollowingList({ sellers }: BuyerFollowingListProps) {
  if (sellers.length === 0) {
    return (
      <EmptyState
        action={
          <Button asChild>
            <Link href="/browse">Browse listings</Link>
          </Button>
        }
        description="Followed suppliers will appear here so you can keep an eye on trusted sources across the marketplace."
        title="No followed suppliers yet"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sellers.map((seller) => (
        <Card key={seller.id} className="border border-border/70 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">{seller.displayName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RatingStars average={seller.ratingAverage} count={seller.ratingCount} />
            <div className="text-sm text-muted-foreground">
              <p>{seller.activeListingCount} active listing{seller.activeListingCount === 1 ? "" : "s"}</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/browse">Browse supplier listings</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { BuyerFollowingList };
