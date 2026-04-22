import { getAppBaseUrl, getOptionalResendApiKey, getOptionalResendFromEmail } from "@/lib/supabase/config";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function sendResendEmail(input: {
  html: string;
  idempotencyKey: string;
  subject: string;
  tags: Array<{ name: string; value: string }>;
  text: string;
  to: string;
}) {
  const apiKey = getOptionalResendApiKey();
  const from = getOptionalResendFromEmail();

  if (!apiKey || !from) {
    return {
      ok: false,
      skipped: true,
      reason: "Email notifications are not configured.",
    } as const;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: JSON.stringify({
      from,
      html: input.html,
      subject: input.subject,
      tags: input.tags,
      text: input.text,
      to: [input.to],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend email send failed (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as { id?: string };

  return {
    ok: true,
    id: data.id ?? null,
  } as const;
}

export async function sendSellerNewInquiryEmail(input: {
  buyerEmail: string;
  buyerName: string;
  inquiryId: string;
  listingTitle: string;
  message: string;
  sellerEmail: string | null;
}) {
  if (!input.sellerEmail) {
    return {
      ok: false,
      skipped: true,
      reason: "Seller email is unavailable.",
    } as const;
  }

  const threadUrl = `${getAppBaseUrl()}/seller/inquiries/${input.inquiryId}`;
  const buyerName = escapeHtml(input.buyerName);
  const listingTitle = escapeHtml(input.listingTitle);
  const message = escapeHtml(input.message);

  return sendResendEmail({
    to: input.sellerEmail,
    subject: `New inquiry for ${input.listingTitle}`,
    idempotencyKey: `new-inquiry-${input.inquiryId}`,
    tags: [
      { name: "event", value: "new_inquiry" },
      { name: "inquiry_id", value: input.inquiryId },
    ],
    text: [
      `You have a new inquiry for "${input.listingTitle}".`,
      "",
      `Buyer: ${input.buyerName} (${input.buyerEmail})`,
      "",
      input.message,
      "",
      `Open the inquiry: ${threadUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="margin:0 0 12px">New marketplace inquiry</h2>
        <p style="margin:0 0 12px">You have a new inquiry for <strong>${listingTitle}</strong>.</p>
        <p style="margin:0 0 16px"><strong>Buyer:</strong> ${buyerName} (${escapeHtml(input.buyerEmail)})</p>
        <div style="margin:0 0 16px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;white-space:pre-wrap">${message}</div>
        <p style="margin:0"><a href="${threadUrl}">Open the inquiry thread</a></p>
      </div>
    `,
  });
}

export async function sendBuyerSellerReplyEmail(input: {
  buyerEmail: string;
  inquiryId: string;
  listingTitle: string;
  message: string;
  sellerName: string;
}) {
  const threadUrl = `${getAppBaseUrl()}/inquiries/${input.inquiryId}`;
  const sellerName = escapeHtml(input.sellerName);
  const listingTitle = escapeHtml(input.listingTitle);
  const message = escapeHtml(input.message);

  return sendResendEmail({
    to: input.buyerEmail,
    subject: `Seller reply for ${input.listingTitle}`,
    idempotencyKey: `seller-reply-${input.inquiryId}-${Buffer.from(input.message).toString("base64url").slice(0, 32)}`,
    tags: [
      { name: "event", value: "seller_reply" },
      { name: "inquiry_id", value: input.inquiryId },
    ],
    text: [
      `${input.sellerName} replied to your inquiry for "${input.listingTitle}".`,
      "",
      input.message,
      "",
      `Open the conversation: ${threadUrl}`,
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="margin:0 0 12px">You have a new supplier reply</h2>
        <p style="margin:0 0 12px"><strong>${sellerName}</strong> replied to your inquiry for <strong>${listingTitle}</strong>.</p>
        <div style="margin:0 0 16px;padding:12px;border:1px solid #e5e7eb;border-radius:12px;background:#f9fafb;white-space:pre-wrap">${message}</div>
        <p style="margin:0"><a href="${threadUrl}">Open the conversation</a></p>
      </div>
    `,
  });
}
