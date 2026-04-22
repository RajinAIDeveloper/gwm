"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUser } from "@/lib/auth/session";
import { appendInquiryMessage, createInquiryRecord, getBuyerInquiryByListing, getInquiryThread } from "@/lib/data/inquiries";
import { getListingById } from "@/lib/data/listings";
import { getProfileByUserId } from "@/lib/data/profiles";
import { sendBuyerSellerReplyEmail, sendSellerNewInquiryEmail } from "@/lib/notifications/email";
import { getAuthUserEmailById } from "@/lib/supabase/admin";
import { validateInquiryFormData, validateInquiryReplyFormData } from "@/lib/validation/inquiries";
import type { ActionResult } from "@/types/domain";

function logNotificationError(event: string, error: unknown) {
  console.error(`[notifications] ${event}`, error);
}

export async function submitInquiry(
  _previousState: ActionResult<{ id: string }> | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const sessionUser = await requireSessionUser();

  if (sessionUser.role !== "buyer") {
    return {
      ok: false,
      message: "Only buyer accounts can submit inquiries.",
    };
  }

  const parsed = validateInquiryFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      fieldErrors: parsed.fieldErrors,
      message: "Please correct the inquiry and try again.",
    };
  }

  const existingInquiryId = await getBuyerInquiryByListing(
    sessionUser.id,
    parsed.data.listingId,
    sessionUser.accessToken,
  );

  if (existingInquiryId) {
    return {
      ok: true,
      message: "You already contacted this seller. Opening the existing conversation.",
      data: { id: existingInquiryId },
      redirectTo: `/inquiries/${existingInquiryId}`,
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

    const inquiry = await createInquiryRecord(sessionUser.accessToken, {
      buyerEmail: sessionUser.email ?? "unknown@example.com",
      buyerId: sessionUser.id,
      buyerName: profile?.displayName ?? null,
      listingId: parsed.data.listingId,
      message: parsed.data.message,
    });

    try {
      const sellerEmail = await getAuthUserEmailById(listing.sellerId);

      await sendSellerNewInquiryEmail({
        buyerEmail: sessionUser.email ?? "unknown@example.com",
        buyerName: profile?.displayName ?? "Marketplace buyer",
        inquiryId: inquiry.id,
        listingTitle: listing.title,
        message: parsed.data.message,
        sellerEmail,
      });
    } catch (notificationError) {
      logNotificationError("new inquiry email failed", notificationError);
    }

    revalidatePath("/seller");
    revalidatePath("/seller/inquiries");
    revalidatePath("/inquiries");
    revalidatePath(`/inquiries/${inquiry.id}`);
    revalidatePath(`/listings/${parsed.data.listingId}`);

    return {
      ok: true,
      message: "Inquiry sent successfully.",
      data: { id: inquiry.id },
      redirectTo: `/inquiries/${inquiry.id}`,
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      const inquiryId = await getBuyerInquiryByListing(
        sessionUser.id,
        parsed.data.listingId,
        sessionUser.accessToken,
      );

      return {
        ok: true,
        message: "You already contacted this seller. Opening the existing conversation.",
        data: inquiryId ? { id: inquiryId } : undefined,
        redirectTo: inquiryId ? `/inquiries/${inquiryId}` : undefined,
      };
    }

    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to submit your inquiry.",
    };
  }
}

export async function sendInquiryReply(
  _previousState: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const sessionUser = await requireSessionUser();

  if (sessionUser.role !== "seller" && sessionUser.role !== "buyer") {
    return {
      ok: false,
      message: "Only buyer or seller accounts can reply to inquiries.",
    };
  }

  const parsed = validateInquiryReplyFormData(formData);

  if (!parsed.ok) {
    return {
      ok: false,
      fieldErrors: parsed.fieldErrors,
      message: "Please correct the reply and try again.",
    };
  }

  try {
    const thread =
      sessionUser.role === "seller" ? await getInquiryThread(parsed.data.inquiryId, sessionUser) : null;

    await appendInquiryMessage(sessionUser.accessToken, {
      inquiryId: parsed.data.inquiryId,
      message: parsed.data.message,
      senderId: sessionUser.id,
      senderRole: sessionUser.role,
    });

    if (sessionUser.role === "seller" && thread?.buyerEmail) {
      try {
        await sendBuyerSellerReplyEmail({
          buyerEmail: thread.buyerEmail,
          inquiryId: parsed.data.inquiryId,
          listingTitle: thread.listingTitle,
          message: parsed.data.message,
          sellerName: thread.sellerName,
        });
      } catch (notificationError) {
        logNotificationError("seller reply email failed", notificationError);
      }
    }

    revalidatePath("/seller");
    revalidatePath("/seller/inquiries");
    revalidatePath(`/seller/inquiries/${parsed.data.inquiryId}`);
    revalidatePath("/inquiries");
    revalidatePath(`/inquiries/${parsed.data.inquiryId}`);

    return {
      ok: true,
      message: "Reply sent successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Unable to send your reply.",
    };
  }
}
