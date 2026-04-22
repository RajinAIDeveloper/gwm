import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { InquiryMessage, InquirySummary, InquiryThread, SessionUser } from "@/types/domain";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];
type InquiryMessageRow = Database["public"]["Tables"]["inquiry_messages"]["Row"];
type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

type InquiryHeaderRow = InquiryRow & {
  listing: (Pick<ListingRow, "id" | "seller_id" | "title"> & {
    seller: {
      display_name: string | null;
      id: string;
    } | null;
  }) | null;
};

function getSellerName(row: InquiryHeaderRow) {
  return row.listing?.seller?.display_name ?? "Verified seller";
}

function getBuyerName(row: InquiryHeaderRow) {
  return row.buyer_name ?? "Marketplace buyer";
}

function isUnreadForRole(row: InquiryHeaderRow, role: SessionUser["role"]) {
  if (role === "seller") {
    return !row.seller_last_read_at || row.last_message_at > row.seller_last_read_at;
  }

  if (role === "buyer") {
    return !row.buyer_last_read_at || row.last_message_at > row.buyer_last_read_at;
  }

  return false;
}

function mapMessage(row: InquiryMessageRow, header: InquiryHeaderRow): InquiryMessage {
  return {
    id: row.id,
    inquiryId: row.inquiry_id,
    senderId: row.sender_id,
    senderRole: row.sender_role === "seller" ? "seller" : "buyer",
    senderName: row.sender_role === "seller" ? getSellerName(header) : getBuyerName(header),
    message: row.message,
    createdAt: row.created_at,
  };
}

function mapSummary(
  row: InquiryHeaderRow,
  latestMessage: InquiryMessageRow | null,
  viewerRole: SessionUser["role"],
): InquirySummary {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing?.title ?? "Listing",
    sellerId: row.listing?.seller_id ?? "",
    sellerName: getSellerName(row),
    buyerId: row.buyer_id,
    buyerName: getBuyerName(row),
    buyerEmail: row.buyer_email,
    latestMessage: latestMessage?.message ?? row.message,
    latestMessageAt: row.last_message_at,
    createdAt: row.created_at,
    unread: isUnreadForRole(row, viewerRole),
  };
}

async function getLatestMessagesMap(accessToken: string, inquiryIds: string[]) {
  if (inquiryIds.length === 0) {
    return new Map<string, InquiryMessageRow>();
  }

  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("inquiry_messages")
    .select("*")
    .in("inquiry_id", inquiryIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const latestByInquiry = new Map<string, InquiryMessageRow>();

  for (const row of data as InquiryMessageRow[]) {
    if (!latestByInquiry.has(row.inquiry_id)) {
      latestByInquiry.set(row.inquiry_id, row);
    }
  }

  return latestByInquiry;
}

async function fetchAccessibleInquiryHeaders(accessToken: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("inquiries")
    .select(
      `
        *,
        listing:listings!inquiries_listing_id_fkey (
          id,
          seller_id,
          title,
          seller:profiles!listings_seller_id_fkey (
            id,
            display_name
          )
        )
      `,
    )
    .order("last_message_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as InquiryHeaderRow[];
}

export async function getSellerInquirySummaries(sellerId: string, accessToken: string) {
  const rows = await fetchAccessibleInquiryHeaders(accessToken);
  const sellerRows = rows.filter((row) => row.listing?.seller_id === sellerId);
  const latestMessages = await getLatestMessagesMap(
    accessToken,
    sellerRows.map((row) => row.id),
  );

  return sellerRows.map((row) => mapSummary(row, latestMessages.get(row.id) ?? null, "seller"));
}

export async function getBuyerInquirySummaries(buyerId: string, accessToken: string) {
  const rows = await fetchAccessibleInquiryHeaders(accessToken);
  const buyerRows = rows.filter((row) => row.buyer_id === buyerId);
  const latestMessages = await getLatestMessagesMap(
    accessToken,
    buyerRows.map((row) => row.id),
  );

  return buyerRows.map((row) => mapSummary(row, latestMessages.get(row.id) ?? null, "buyer"));
}

export async function getUnreadInquiryCountForSeller(sellerId: string, accessToken: string) {
  const summaries = await getSellerInquirySummaries(sellerId, accessToken);
  return summaries.filter((summary) => summary.unread).length;
}

export async function getUnreadInquiryCountForBuyer(buyerId: string, accessToken: string) {
  const summaries = await getBuyerInquirySummaries(buyerId, accessToken);
  return summaries.filter((summary) => summary.unread).length;
}

export async function getBuyerInquiryByListing(buyerId: string, listingId: string, accessToken: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("inquiries")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

async function getInquiryHeaderById(inquiryId: string, accessToken: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("inquiries")
    .select(
      `
        *,
        listing:listings!inquiries_listing_id_fkey (
          id,
          seller_id,
          title,
          seller:profiles!listings_seller_id_fkey (
            id,
            display_name
          )
        )
      `,
    )
    .eq("id", inquiryId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as InquiryHeaderRow | null;
}

export async function getInquiryThread(inquiryId: string, sessionUser: SessionUser): Promise<InquiryThread | null> {
  const header = await getInquiryHeaderById(inquiryId, sessionUser.accessToken);

  if (!header) {
    return null;
  }

  const client = createSupabaseServerClient(sessionUser.accessToken);
  const { data, error } = await client
    .from("inquiry_messages")
    .select("*")
    .eq("inquiry_id", inquiryId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  const messages = (data as InquiryMessageRow[]).map((row) => mapMessage(row, header));
  const latestMessage = messages.at(-1)?.message ?? header.message;

  return {
    id: header.id,
    listingId: header.listing_id,
    listingTitle: header.listing?.title ?? "Listing",
    sellerId: header.listing?.seller_id ?? "",
    sellerName: getSellerName(header),
    buyerId: header.buyer_id,
    buyerName: getBuyerName(header),
    buyerEmail: header.buyer_email,
    latestMessage,
    latestMessageAt: header.last_message_at,
    createdAt: header.created_at,
    unread: isUnreadForRole(header, sessionUser.role),
    sellerLastReadAt: header.seller_last_read_at,
    buyerLastReadAt: header.buyer_last_read_at,
    messages,
  };
}

export async function markInquiryRead(inquiryId: string, sessionUser: SessionUser) {
  if (sessionUser.role !== "seller" && sessionUser.role !== "buyer") {
    return;
  }

  const client = createSupabaseServerClient(sessionUser.accessToken);
  const now = new Date().toISOString();
  const patch =
    sessionUser.role === "seller"
      ? { seller_last_read_at: now }
      : { buyer_last_read_at: now };

  const { error } = await client.from("inquiries").update(patch).eq("id", inquiryId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createInquiryRecord(
  accessToken: string,
  input: {
    buyerEmail: string;
    buyerId: string;
    buyerName: string | null;
    listingId: string;
    message: string;
  },
) {
  const client = createSupabaseServerClient(accessToken);
  const now = new Date().toISOString();
  const { data, error } = await client
    .from("inquiries")
    .insert({
      buyer_email: input.buyerEmail,
      buyer_id: input.buyerId,
      buyer_name: input.buyerName,
      buyer_last_read_at: now,
      last_message_at: now,
      listing_id: input.listingId,
      message: input.message,
      seller_last_read_at: null,
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  const inquiryId = data.id;
  const { error: messageError } = await client.from("inquiry_messages").insert({
    inquiry_id: inquiryId,
    message: input.message,
    sender_id: input.buyerId,
    sender_role: "buyer",
  });

  if (messageError) {
    throw messageError;
  }

  return {
    id: inquiryId,
  };
}

export async function appendInquiryMessage(
  accessToken: string,
  input: {
    inquiryId: string;
    senderId: string;
    senderRole: "seller" | "buyer";
    message: string;
  },
) {
  const client = createSupabaseServerClient(accessToken);
  const now = new Date().toISOString();

  const { error: messageError } = await client.from("inquiry_messages").insert({
    inquiry_id: input.inquiryId,
    message: input.message,
    sender_id: input.senderId,
    sender_role: input.senderRole,
  });

  if (messageError) {
    throw messageError;
  }

  const updatePatch =
    input.senderRole === "seller"
      ? {
          last_message_at: now,
          seller_last_read_at: now,
        }
      : {
          last_message_at: now,
          buyer_last_read_at: now,
        };

  const { error: updateError } = await client
    .from("inquiries")
    .update(updatePatch)
    .eq("id", input.inquiryId);

  if (updateError) {
    throw updateError;
  }
}
