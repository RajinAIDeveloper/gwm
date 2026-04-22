"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import {
  toggleListingWishlistRecord,
  toggleSellerFollowRecord,
  upsertSupplierRatingRecord,
} from "@/lib/data/engagement";
import type { ActionResult } from "@/types/domain";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  return Number(getString(formData, key));
}

export async function toggleListingWishlist(
  _previousState: ActionResult<{ active: boolean }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ active: boolean }>> {
  const sessionUser = await requireRole("buyer");
  const listingId = getString(formData, "listingId");

  if (!listingId) {
    return {
      ok: false,
      message: "Listing id is required.",
    };
  }

  try {
    const result = await toggleListingWishlistRecord(sessionUser.accessToken, sessionUser.id, listingId);

    revalidatePath("/browse");
    revalidatePath("/wishlist");
    revalidatePath(`/listings/${listingId}`);

    return {
      ok: true,
      message: result.active ? "Added to wishlist." : "Removed from wishlist.",
      data: result,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to update wishlist.",
    };
  }
}

export async function toggleSellerFollow(
  _previousState: ActionResult<{ active: boolean }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ active: boolean }>> {
  const sessionUser = await requireRole("buyer");
  const sellerId = getString(formData, "sellerId");

  if (!sellerId) {
    return {
      ok: false,
      message: "Seller id is required.",
    };
  }

  try {
    const result = await toggleSellerFollowRecord(sessionUser.accessToken, sessionUser.id, sellerId);

    revalidatePath("/following");
    revalidatePath(`/listings`);
    revalidatePath("/browse");

    return {
      ok: true,
      message: result.active ? "Supplier followed." : "Supplier unfollowed.",
      data: result,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to update followed suppliers.",
    };
  }
}

export async function submitSupplierRating(
  _previousState: ActionResult<{ rating: number }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ rating: number }>> {
  const sessionUser = await requireRole("buyer");
  const sellerId = getString(formData, "sellerId");
  const listingId = getString(formData, "listingId");
  const rating = getNumber(formData, "rating");

  if (!sellerId || !listingId) {
    return {
      ok: false,
      message: "Seller and listing ids are required.",
    };
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return {
      ok: false,
      message: "Rating must be between 1 and 5 stars.",
    };
  }

  try {
    await upsertSupplierRatingRecord(sessionUser.accessToken, sessionUser.id, sellerId, rating);

    revalidatePath("/browse");
    revalidatePath("/following");
    revalidatePath(`/listings/${listingId}`);

    return {
      ok: true,
      message: "Supplier rating saved.",
      data: { rating },
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to save supplier rating.",
    };
  }
}
