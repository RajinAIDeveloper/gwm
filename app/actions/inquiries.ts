"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { createInquiryRecord } from "@/lib/data/inquiries";
import { getListingById } from "@/lib/data/listings";
import { getProfileByUserId } from "@/lib/data/profiles";
import { validateInquiryFormData } from "@/lib/validation/inquiries";
import type { ActionResult } from "@/types/domain";

export async function submitInquiry(
  _previousState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const sessionUser = await requireRole("buyer");
  const parsed = validateInquiryFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      fieldErrors: parsed.fieldErrors,
      message: "Please correct the inquiry and try again.",
    };
  }

  const listing = await getListingById(parsed.data.listingId, sessionUser.id);

  if (!listing) {
    return {
      ok: false,
      message: "Listing not found.",
    };
  }

  if (listing.viewerOwnsListing) {
    return {
      ok: false,
      message: "You cannot submit an inquiry for your own listing.",
    };
  }

  try {
    const profile = await getProfileByUserId(sessionUser.accessToken, sessionUser.id);

    await createInquiryRecord(sessionUser.accessToken, {
      buyerEmail: sessionUser.email ?? "unknown@example.com",
      buyerId: sessionUser.id,
      buyerName: profile?.displayName ?? null,
      listingId: parsed.data.listingId,
      message: parsed.data.message,
    });

    revalidatePath("/seller/inquiries");
    revalidatePath(`/listings/${parsed.data.listingId}`);

    return {
      ok: true,
      message: "Inquiry sent successfully.",
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return {
        ok: false,
        message: "You have already sent an inquiry for this listing.",
      };
    }

    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to submit your inquiry.",
    };
  }
}
