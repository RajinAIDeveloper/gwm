"use server";

import { revalidatePath } from "next/cache";

import { requireRole } from "@/lib/auth/session";
import { createListingRecord, updateListingRecord } from "@/lib/data/listings";
import { validateCreateListingFormData, validateUpdateListingFormData } from "@/lib/validation/listings";
import type { ActionResult } from "@/types/domain";

export async function createListing(
  _previousState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const sessionUser = await requireRole("seller");
  const parsed = validateCreateListingFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      fieldErrors: parsed.fieldErrors,
      message: "Please correct the listing details and try again.",
    };
  }

  try {
    const listing = await createListingRecord(sessionUser.accessToken, sessionUser.id, parsed.data);

    revalidatePath("/seller");
    revalidatePath("/browse");
    revalidatePath(`/listings/${listing.id}`);

    return {
      ok: true,
      message: "Listing created successfully.",
      data: { id: listing.id },
      redirectTo: "/seller",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to create the listing.",
    };
  }
}

export async function updateListing(
  _previousState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const sessionUser = await requireRole("seller");
  const parsed = validateUpdateListingFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      fieldErrors: parsed.fieldErrors,
      message: "Please correct the listing details and try again.",
    };
  }

  try {
    await updateListingRecord(sessionUser.accessToken, sessionUser.id, parsed.data);

    revalidatePath("/seller");
    revalidatePath(`/seller/listings/${parsed.data.listingId}/edit`);
    revalidatePath("/browse");
    revalidatePath(`/listings/${parsed.data.listingId}`);

    return {
      ok: true,
      message: "Listing updated successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to update the listing.",
    };
  }
}
