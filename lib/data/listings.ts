import { randomUUID } from "crypto";

import { getSellerRatingStatsMap } from "@/lib/data/engagement";
import { LISTING_IMAGES_BUCKET } from "@/lib/supabase/config";
import { createSupabaseServerClient, getListingImageUrl } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { BuyerListingEngagementState, CreateListingInput, ListingDetail, ListingFilters, ListingSummary, UpdateListingInput } from "@/types/domain";

type ListingRow = Database["public"]["Tables"]["listings"]["Row"];

type ListingWithSellerRow = ListingRow & {
  seller: {
    display_name: string | null;
    id: string;
  } | null;
};

function parseNumericValue(value: string) {
  return Number.parseFloat(value);
}

function toSummary(
  row: ListingWithSellerRow,
  sellerRating: { average: number | null; count: number },
): ListingSummary {
  return {
    id: row.id,
    sellerId: row.seller_id,
    sellerName: row.seller?.display_name ?? "Verified seller",
    sellerRatingAverage: sellerRating.average,
    sellerRatingCount: sellerRating.count,
    title: row.title,
    description: row.description,
    category: row.category as ListingSummary["category"],
    quantityKg: parseNumericValue(row.quantity_kg),
    pricePerKg: parseNumericValue(row.price_per_kg),
    imageUrl: row.image_paths[0] ? getListingImageUrl(row.image_paths[0]) : null,
    createdAt: row.created_at,
  };
}

function toDetail(
  row: ListingWithSellerRow,
  sellerRating: { average: number | null; count: number },
  viewerId?: string,
  engagement?: BuyerListingEngagementState,
): ListingDetail {
  const summary = toSummary(row, sellerRating);

  return {
    ...summary,
    imageUrls: row.image_paths.map((path) => getListingImageUrl(path)),
    updatedAt: row.updated_at,
    viewerOwnsListing: viewerId === row.seller_id,
    viewerHasWishlisted: engagement?.hasWishlisted ?? false,
    viewerFollowsSeller: engagement?.followsSeller ?? false,
    viewerSellerRating: engagement?.sellerRating ?? null,
  };
}

async function fetchListingById(id: string, accessToken?: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("listings")
    .select(
      `
        *,
        seller:profiles!listings_seller_id_fkey (
          id,
          display_name
        )
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ListingWithSellerRow | null;
}

export async function getPublicListings(filters: ListingFilters = {}) {
  const client = createSupabaseServerClient();
  let query = client
    .from("listings")
    .select(
      `
        *,
        seller:profiles!listings_seller_id_fkey (
          id,
          display_name
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.search) {
    const sanitized = filters.search.replace(/,/g, " ");
    query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = data as ListingWithSellerRow[];
  const sellerRatingMap = await getSellerRatingStatsMap([...new Set(rows.map((row) => row.seller_id))]);

  return rows.map((row) => toSummary(row, sellerRatingMap.get(row.seller_id) ?? { average: null, count: 0 }));
}

export async function getListingById(
  id: string,
  viewerId?: string,
  engagement?: BuyerListingEngagementState,
) {
  const row = await fetchListingById(id);
  if (!row) {
    return null;
  }

  const sellerRatingMap = await getSellerRatingStatsMap([row.seller_id]);

  return toDetail(
    row,
    sellerRatingMap.get(row.seller_id) ?? { average: null, count: 0 },
    viewerId,
    engagement,
  );
}

export async function getSellerListings(sellerId: string, accessToken: string) {
  const client = createSupabaseServerClient(accessToken);
  const { data, error } = await client
    .from("listings")
    .select(
      `
        *,
        seller:profiles!listings_seller_id_fkey (
          id,
          display_name
        )
      `,
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = data as ListingWithSellerRow[];
  const sellerRatingMap = await getSellerRatingStatsMap([...new Set(rows.map((row) => row.seller_id))]);

  return rows.map((row) => toSummary(row, sellerRatingMap.get(row.seller_id) ?? { average: null, count: 0 }));
}

function buildStoragePath(sellerId: string, file: File) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
  return `${sellerId}/${randomUUID()}-${safeName}`;
}

export async function uploadListingImages(accessToken: string, sellerId: string, files: File[]) {
  const client = createSupabaseServerClient(accessToken);
  const uploadedPaths: string[] = [];

  for (const file of files) {
    const path = buildStoragePath(sellerId, file);
    const { error } = await client.storage.from(LISTING_IMAGES_BUCKET).upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      if (uploadedPaths.length > 0) {
        await client.storage.from(LISTING_IMAGES_BUCKET).remove(uploadedPaths);
      }

      throw new Error(error.message);
    }

    uploadedPaths.push(path);
  }

  return uploadedPaths;
}

export async function removeListingImages(accessToken: string, paths: string[]) {
  if (paths.length === 0) {
    return;
  }

  const client = createSupabaseServerClient(accessToken);
  const { error } = await client.storage.from(LISTING_IMAGES_BUCKET).remove(paths);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createListingRecord(accessToken: string, sellerId: string, input: CreateListingInput) {
  const client = createSupabaseServerClient(accessToken);
  const imagePaths = await uploadListingImages(accessToken, sellerId, input.imageFiles);

  const { data, error } = await client
    .from("listings")
    .insert({
      seller_id: sellerId,
      title: input.title,
      description: input.description,
      category: input.category,
      quantity_kg: input.quantityKg.toFixed(2),
      price_per_kg: input.pricePerKg.toFixed(2),
      image_paths: imagePaths,
    })
    .select("id")
    .single();

  if (error) {
    await removeListingImages(accessToken, imagePaths);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    imagePaths,
  };
}

export async function updateListingRecord(accessToken: string, sellerId: string, input: UpdateListingInput) {
  const existingListing = await fetchListingById(input.listingId, accessToken);

  if (!existingListing || existingListing.seller_id !== sellerId) {
    throw new Error("Listing not found.");
  }

  const uploadedPaths = await uploadListingImages(accessToken, sellerId, input.imageFiles);
  const nextImagePaths = [...input.existingImagePaths, ...uploadedPaths];
  const removedPaths = existingListing.image_paths.filter((path) => !nextImagePaths.includes(path));
  const client = createSupabaseServerClient(accessToken);

  const { error } = await client
    .from("listings")
    .update({
      title: input.title,
      description: input.description,
      category: input.category,
      quantity_kg: input.quantityKg.toFixed(2),
      price_per_kg: input.pricePerKg.toFixed(2),
      image_paths: nextImagePaths,
    })
    .eq("id", input.listingId)
    .eq("seller_id", sellerId);

  if (error) {
    await removeListingImages(accessToken, uploadedPaths);
    throw new Error(error.message);
  }

  await removeListingImages(accessToken, removedPaths);
}
