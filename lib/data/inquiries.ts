import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { Inquiry } from "@/types/domain";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];
type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

type InquiryWithListingRow = InquiryRow & {
  listing: Pick<ListingRow, "id" | "seller_id" | "title"> | null;
};

function mapInquiry(row: InquiryWithListingRow): Inquiry {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing?.title ?? "Listing",
    buyerId: row.buyer_id,
    buyerName: row.buyer_name ?? "Marketplace buyer",
    buyerEmail: row.buyer_email,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function getSellerInquiries(sellerId: string, accessToken: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data: listings, error: listingError } = await client
    .from("listings")
    .select("id")
    .eq("seller_id", sellerId);

  if (listingError) {
    throw new Error(listingError.message);
  }

  const listingIds = (listings ?? []).map((listing) => listing.id);

  if (listingIds.length === 0) {
    return [] satisfies Inquiry[];
  }

  const { data, error } = await client
    .from("inquiries")
    .select(
      `
        *,
        listing:listings!inquiries_listing_id_fkey (
          id,
          seller_id,
          title
        )
      `,
    )
    .in("listing_id", listingIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as InquiryWithListingRow[]).map(mapInquiry);
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
  const { error } = await client.from("inquiries").insert({
    buyer_email: input.buyerEmail,
    buyer_id: input.buyerId,
    buyer_name: input.buyerName,
    listing_id: input.listingId,
    message: input.message,
  });

  if (error) {
    throw error;
  }
}
