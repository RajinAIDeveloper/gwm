import type { User } from "@supabase/supabase-js";

export const APP_ROLES = ["seller", "buyer", "admin"] as const;
export const LISTING_CATEGORIES = [
  "fabric-scraps",
  "deadstock",
  "offcuts",
  "trim-accessories",
  "mixed-textiles",
] as const;
export const LISTING_MAIN_IMAGE_COUNT = 1 as const;
export const LISTING_MAX_DETAIL_IMAGES = 4 as const;
export const LISTING_MAX_IMAGES = LISTING_MAIN_IMAGE_COUNT + LISTING_MAX_DETAIL_IMAGES;

export type AppRole = (typeof APP_ROLES)[number];
export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

export interface Profile {
  id: string;
  role: AppRole;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  email: string | null;
  role: AppRole;
  accessToken: string;
  refreshToken: string | null;
  user: User;
}

export interface ListingSummary {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerRatingAverage: number | null;
  sellerRatingCount: number;
  title: string;
  description: string;
  category: ListingCategory;
  quantityKg: number;
  pricePerKg: number;
  imageUrl: string | null;
  createdAt: string;
}

export interface ListingDetail extends ListingSummary {
  imageUrls: string[];
  updatedAt: string;
  viewerOwnsListing: boolean;
  viewerHasWishlisted: boolean;
  viewerFollowsSeller: boolean;
  viewerSellerRating: number | null;
}

export interface InquirySummary {
  id: string;
  listingId: string;
  listingTitle: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  latestMessage: string;
  latestMessageAt: string;
  createdAt: string;
  unread: boolean;
}

export interface InquiryMessage {
  id: string;
  inquiryId: string;
  senderId: string;
  senderRole: "seller" | "buyer";
  senderName: string;
  message: string;
  createdAt: string;
}

export interface InquiryThread extends InquirySummary {
  sellerLastReadAt: string | null;
  buyerLastReadAt: string | null;
  messages: InquiryMessage[];
}

export interface ListingFilters {
  search?: string;
  category?: ListingCategory;
}

export interface AuthFormInput {
  email: string;
  password: string;
  role?: AppRole;
  displayName?: string;
}

export interface CreateListingInput {
  title: string;
  description: string;
  category: ListingCategory;
  quantityKg: number;
  pricePerKg: number;
  existingImagePaths: string[];
  imageFiles: File[];
}

export interface UpdateListingInput extends CreateListingInput {
  listingId: string;
}

export interface InquiryInput {
  listingId: string;
  message: string;
}

export interface InquiryReplyInput {
  inquiryId: string;
  message: string;
}

export interface FollowedSellerSummary {
  id: string;
  displayName: string;
  ratingAverage: number | null;
  ratingCount: number;
  activeListingCount: number;
}

export interface BuyerListingEngagementState {
  listingId: string;
  sellerId: string;
  hasWishlisted: boolean;
  followsSeller: boolean;
  sellerRating: number | null;
}

export type FieldErrors = Partial<Record<string, string>>;

export interface ActionResult<TData = void> {
  ok: boolean;
  message?: string;
  fieldErrors?: FieldErrors;
  data?: TData;
  redirectTo?: string;
}
