import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { ListingCategory, ListingSummary } from "@/types/domain";

function formatListingCategory(category: ListingCategory) {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPricePerKg(value: number) {
  return `$${value.toFixed(2)}/kg`;
}

type ListingCardProps = {
  listing: ListingSummary;
  href?: string;
  footer?: ReactNode;
};

function ListingCard({ listing, href = `/listings/${listing.id}`, footer }: ListingCardProps) {
  return (
    <Card className="overflow-hidden border border-border/70 bg-card py-0 shadow-sm">
      <div className="px-4 pt-4">
        <div
          className="h-52 rounded-[1.5rem] border border-border/60 bg-muted"
          style={listing.imageUrl ? { backgroundImage: `url(${listing.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {!listing.imageUrl ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Image pending</div>
          ) : null}
        </div>
      </div>

      <CardContent className="space-y-4 px-4 pb-0 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{formatListingCategory(listing.category)}</Badge>
          <Badge variant="outline">{listing.quantityKg.toFixed(0)} kg available</Badge>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground">{listing.title}</h3>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{listing.description}</p>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase">Seller</p>
            <p className="mt-1 text-foreground">{listing.sellerName}</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase">Price</p>
            <p className="mt-1 text-foreground">{formatPricePerKg(listing.pricePerKg)}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="items-center justify-between gap-3 px-4 py-4">
        <p className="text-sm text-muted-foreground">
          Added {new Date(listing.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        {footer ?? (
          <Button asChild size="sm">
            <Link href={href}>View listing</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export { ListingCard, formatListingCategory };
