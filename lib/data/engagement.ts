import { createSupabaseServerClient, getListingImageUrl } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { BuyerListingEngagementState, FollowedSellerSummary, ListingSummary } from "@/types/domain";

type SupplierRatingRow = Database["public"]["Tables"]["supplier_ratings"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

type SellerRatingStats = {
  average: number | null;
  count: number;
};

type WishlistedListingRow = ListingRow & {
  seller: Pick<ProfileRow, "id" | "display_name"> | null;
};

function roundRating(value: number) {
  return Math.round(value * 10) / 10;
}

export async function getSellerRatingStatsMap(sellerIds: string[]) {
  if (sellerIds.length === 0) {
    return new Map<string, SellerRatingStats>();
  }

  const client = createSupabaseServerClient();
  const { data, error } = await client
    .from("supplier_ratings")
    .select("seller_id, rating")
    .in("seller_id", sellerIds);

  if (error) {
    throw new Error(error.message);
  }

  const rows = data as Pick<SupplierRatingRow, "seller_id" | "rating">[];
  const grouped = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    const current = grouped.get(row.seller_id) ?? { total: 0, count: 0 };
    current.total += row.rating;
    current.count += 1;
    grouped.set(row.seller_id, current);
  }

  const stats = new Map<string, SellerRatingStats>();

  for (const sellerId of sellerIds) {
    const current = grouped.get(sellerId);
    stats.set(sellerId, current ? { average: roundRating(current.total / current.count), count: current.count } : { average: null, count: 0 });
  }

  return stats;
}

export async function getBuyerListingEngagementState(
  buyerId: string,
  listingId: string,
  sellerId: string,
  accessToken: string,
): Promise<BuyerListingEngagementState> {
  const client = createSupabaseServerClient(accessToken);

  const [{ data: wishlistedRow, error: wishlistError }, { data: followedRow, error: followError }, { data: ratingRow, error: ratingError }] = await Promise.all([
    client.from("listing_wishlists").select("id").eq("buyer_id", buyerId).eq("listing_id", listingId).maybeSingle(),
    client.from("seller_follows").select("id").eq("buyer_id", buyerId).eq("seller_id", sellerId).maybeSingle(),
    client.from("supplier_ratings").select("rating").eq("buyer_id", buyerId).eq("seller_id", sellerId).maybeSingle(),
  ]);

  if (wishlistError) {
    throw new Error(wishlistError.message);
  }

  if (followError) {
    throw new Error(followError.message);
  }

  if (ratingError) {
    throw new Error(ratingError.message);
  }

  return {
    listingId,
    sellerId,
    hasWishlisted: Boolean(wishlistedRow),
    followsSeller: Boolean(followedRow),
    sellerRating: ratingRow?.rating ?? null,
  };
}

export async function toggleListingWishlistRecord(accessToken: string, buyerId: string, listingId: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("listing_wishlists")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("listing_id", listingId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    const { error: deleteError } = await client.from("listing_wishlists").delete().eq("id", data.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return { active: false };
  }

  const { error: insertError } = await client.from("listing_wishlists").insert({
    buyer_id: buyerId,
    listing_id: listingId,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { active: true };
}

export async function toggleSellerFollowRecord(accessToken: string, buyerId: string, sellerId: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("seller_follows")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    const { error: deleteError } = await client.from("seller_follows").delete().eq("id", data.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return { active: false };
  }

  const { error: insertError } = await client.from("seller_follows").insert({
    buyer_id: buyerId,
    seller_id: sellerId,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { active: true };
}

export async function upsertSupplierRatingRecord(accessToken: string, buyerId: string, sellerId: string, rating: number) {
  const client = createSupabaseServerClient(accessToken);
  const { error } = await client
    .from("supplier_ratings")
    .upsert(
      {
        buyer_id: buyerId,
        seller_id: sellerId,
        rating,
      },
      {
        onConflict: "buyer_id,seller_id",
      },
    );

  if (error) {
    throw new Error(error.message);
  }
}

function parseNumericValue(value: string) {
  return Number.parseFloat(value);
}

export async function getWishlistedListings(buyerId: string, accessToken: string): Promise<ListingSummary[]> {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("listing_wishlists")
    .select(
      `
        listing:listings!listing_wishlists_listing_id_fkey (
          *,
          seller:profiles!listings_seller_id_fkey (
            id,
            display_name
          )
        )
      `,
    )
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const listings = (data ?? [])
    .map((row) => row.listing as WishlistedListingRow | null)
    .filter((listing): listing is WishlistedListingRow => Boolean(listing));

  const ratingMap = await getSellerRatingStatsMap([...new Set(listings.map((listing) => listing.seller_id))]);

  return listings.map((listing) => {
    const sellerRating = ratingMap.get(listing.seller_id) ?? { average: null, count: 0 };

    return {
      id: listing.id,
      sellerId: listing.seller_id,
      sellerName: listing.seller?.display_name ?? "Verified seller",
      sellerRatingAverage: sellerRating.average,
      sellerRatingCount: sellerRating.count,
      title: listing.title,
      description: listing.description,
      category: listing.category as ListingSummary["category"],
      quantityKg: parseNumericValue(listing.quantity_kg),
      pricePerKg: parseNumericValue(listing.price_per_kg),
      imageUrl: listing.image_paths[0] ? getListingImageUrl(listing.image_paths[0]) : null,
      createdAt: listing.created_at,
    };
  });
}

export async function getFollowedSellers(buyerId: string, accessToken: string): Promise<FollowedSellerSummary[]> {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("seller_follows")
    .select(
      `
        seller:profiles!seller_follows_seller_id_fkey (
          id,
          display_name
        )
      `,
    )
    .eq("buyer_id", buyerId);

  if (error) {
    throw new Error(error.message);
  }

  const sellers = (data ?? [])
    .map((row) => row.seller as Pick<ProfileRow, "id" | "display_name"> | null)
    .filter((seller): seller is Pick<ProfileRow, "id" | "display_name"> => Boolean(seller));

  const sellerIds = sellers.map((seller) => seller.id);

  if (sellerIds.length === 0) {
    return [];
  }

  const ratingMap = await getSellerRatingStatsMap(sellerIds);

  const { data: listingsData, error: listingsError } = await client
    .from("listings")
    .select("seller_id")
    .in("seller_id", sellerIds);

  if (listingsError) {
    throw new Error(listingsError.message);
  }

  const listingCountMap = new Map<string, number>();

  for (const row of (listingsData ?? []) as Pick<ListingRow, "seller_id">[]) {
    listingCountMap.set(row.seller_id, (listingCountMap.get(row.seller_id) ?? 0) + 1);
  }

  return sellers.map((seller) => {
    const rating = ratingMap.get(seller.id) ?? { average: null, count: 0 };

    return {
      id: seller.id,
      displayName: seller.display_name ?? "Verified seller",
      ratingAverage: rating.average,
      ratingCount: rating.count,
      activeListingCount: listingCountMap.get(seller.id) ?? 0,
    };
  });
}
