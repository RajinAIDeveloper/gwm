"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { submitSupplierRating, toggleListingWishlist, toggleSellerFollow } from "@/app/actions/engagement";
import { RatingStars } from "@/components/shared/rating-stars";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/types/domain";

type BuyerEngagementControlsProps = {
  listingId: string;
  sellerId: string;
  sellerName: string;
  sellerRatingAverage: number | null;
  sellerRatingCount: number;
  initialHasWishlisted: boolean;
  initialFollowsSeller: boolean;
  initialSellerRating: number | null;
};

const toggleInitialState: ActionResult<{ active: boolean }> = { ok: false };
const ratingInitialState: ActionResult<{ rating: number }> = { ok: false };

function BuyerEngagementControls({
  listingId,
  sellerId,
  sellerName,
  sellerRatingAverage,
  sellerRatingCount,
  initialHasWishlisted,
  initialFollowsSeller,
  initialSellerRating,
}: BuyerEngagementControlsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <WishlistButton initialActive={initialHasWishlisted} listingId={listingId} />
        <FollowSellerButton initialActive={initialFollowsSeller} sellerId={sellerId} />
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">Supplier rating</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Rate {sellerName} from 1 to 5 stars. The public average and exact rating count update after you save.
          </p>
        </div>
        <RatingStars average={sellerRatingAverage} count={sellerRatingCount} />
        <SupplierRatingForm
          initialRating={initialSellerRating}
          listingId={listingId}
          sellerId={sellerId}
        />
      </div>
    </div>
  );
}

function WishlistButton({ listingId, initialActive }: { listingId: string; initialActive: boolean }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(toggleListingWishlist, toggleInitialState);
  const active = state.ok && state.data ? state.data.active : initialActive;

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form action={formAction}>
      <input name="listingId" type="hidden" value={listingId} />
      <Button type="submit" variant={active ? "default" : "outline"}>
        {isPending ? "Saving..." : active ? "Wishlisted" : "Add to wishlist"}
      </Button>
    </form>
  );
}

function FollowSellerButton({ sellerId, initialActive }: { sellerId: string; initialActive: boolean }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(toggleSellerFollow, toggleInitialState);
  const active = state.ok && state.data ? state.data.active : initialActive;

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form action={formAction}>
      <input name="sellerId" type="hidden" value={sellerId} />
      <Button type="submit" variant={active ? "default" : "outline"}>
        {isPending ? "Saving..." : active ? "Following supplier" : "Follow supplier"}
      </Button>
    </form>
  );
}

function SupplierRatingForm({
  sellerId,
  listingId,
  initialRating,
}: {
  sellerId: string;
  listingId: string;
  initialRating: number | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(initialRating ?? 5);
  const [state, formAction, isPending] = useActionState(submitSupplierRating, ratingInitialState);
  const isRated = (state.ok && state.data?.rating) || initialRating;

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form action={formAction} className="space-y-3">
      <input name="sellerId" type="hidden" value={sellerId} />
      <input name="listingId" type="hidden" value={listingId} />
      <input name="rating" type="hidden" value={rating} />

      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            className={`rounded-full border px-3 py-2 text-sm transition-colors ${
              rating === value
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-border bg-background text-foreground hover:border-foreground/30"
            }`}
            onClick={() => setRating(value)}
            type="button"
          >
            {value} ★
          </button>
        ))}
      </div>

      {state.message ? (
        <p className={`text-sm ${state.ok ? "text-emerald-700" : "text-destructive"}`}>{state.message}</p>
      ) : null}

      <Button type="submit" variant="outline">
        {isPending ? "Saving..." : isRated ? "Update rating" : "Rate supplier"}
      </Button>
    </form>
  );
}

export { BuyerEngagementControls };
