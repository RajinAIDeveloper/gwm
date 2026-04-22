import type { FieldErrors, InquiryInput, InquiryReplyInput } from "@/types/domain";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function validateInquiryFormData(formData: FormData) {
  const listingId = getString(formData, "listingId");
  const message = getString(formData, "message");
  const fieldErrors: FieldErrors = {};

  if (!listingId) {
    fieldErrors.listingId = "Listing id is required.";
  }

  if (message.length < 10 || message.length > 1200) {
    fieldErrors.message = "Message must be between 10 and 1200 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors };
  }

  return {
    ok: true as const,
    data: {
      listingId,
      message,
    } satisfies InquiryInput,
  };
}

export function validateInquiryReplyFormData(formData: FormData) {
  const inquiryId = getString(formData, "inquiryId");
  const message = getString(formData, "message");
  const fieldErrors: FieldErrors = {};

  if (!inquiryId) {
    fieldErrors.inquiryId = "Inquiry id is required.";
  }

  if (message.length < 10 || message.length > 1200) {
    fieldErrors.message = "Message must be between 10 and 1200 characters.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors };
  }

  return {
    ok: true as const,
    data: {
      inquiryId,
      message,
    } satisfies InquiryReplyInput,
  };
}
