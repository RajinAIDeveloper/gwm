import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RatingStars } from "@/components/shared/rating-stars";
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
    <Card className="market-panel overflow-hidden border-border/70 bg-card/90 py-0 transition-transform duration-200 hover:-translate-y-1">
      <div className="px-4 pt-4 sm:px-5 sm:pt-5">
        <div
          className="market-grid relative h-56 rounded-[1.75rem] border border-border/60 bg-muted sm:h-64"
          style={listing.imageUrl ? { backgroundImage: `url(${listing.imageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge className="bg-background/85 text-foreground shadow-sm">{formatListingCategory(listing.category)}</Badge>
            <Badge variant="outline" className="border-white/30 bg-black/25 text-white">
              {listing.quantityKg.toFixed(0)} kg
            </Badge>
          </div>
          {!listing.imageUrl ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Image pending</div>
          ) : null}
        </div>
      </div>

      <CardContent className="space-y-5 px-4 pb-0 pt-5 sm:px-5">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{listing.title}</h3>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{listing.description}</p>
        </div>

        <div className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-[0.18em] uppercase">Supplier</p>
            <p className="mt-1 truncate text-foreground">{listing.sellerName}</p>
            <RatingStars
              average={listing.sellerRatingAverage}
              className="mt-2"
              count={listing.sellerRatingCount}
            />
          </div>
          <div>
            <p className="text-xs font-medium tracking-[0.18em] uppercase">Price</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatPricePerKg(listing.pricePerKg)}</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="items-center justify-between gap-3 px-4 py-5 sm:px-5">
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
