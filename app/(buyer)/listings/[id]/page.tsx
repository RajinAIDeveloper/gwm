import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyerEngagementControls } from "@/components/buyer/buyer-engagement-controls";
import { BuyerInquiryPanel } from "@/components/buyer/buyer-inquiry-panel";
import { ImageGallery } from "@/components/shared/image-gallery";
import { ListingFormSection } from "@/components/shared/listing-form-section";
import { PageContainer } from "@/components/shared/page-container";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatListingCategory } from "@/components/shared/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOptionalSessionUser } from "@/lib/auth/session";
import { getBuyerInquiryByListing } from "@/lib/data/inquiries";
import { getBuyerListingEngagementState } from "@/lib/data/engagement";
import { getListingById } from "@/lib/data/listings";

type ListingDetailPageProps = {
  params: Promise<{ id: string }>;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const sessionUser = await getOptionalSessionUser();
  const { id } = await params;
  const listing = await getListingById(id, sessionUser?.id);

  if (sessionUser?.role === "buyer" && listing) {
    const refreshedEngagement = await getBuyerListingEngagementState(
      sessionUser.id,
      id,
      listing.sellerId,
      sessionUser.accessToken,
    );
    Object.assign(listing, {
      viewerHasWishlisted: refreshedEngagement.hasWishlisted,
      viewerFollowsSeller: refreshedEngagement.followsSeller,
      viewerSellerRating: refreshedEngagement.sellerRating,
    });
  }
  const existingInquiryId =
    sessionUser?.role === "buyer"
      ? await getBuyerInquiryByListing(sessionUser.id, id, sessionUser.accessToken)
      : null;

  if (!listing) {
    notFound();
  }

  return (
    <PageContainer className="space-y-8 lg:space-y-10">
      <section className="market-panel market-grid overflow-hidden px-5 py-7 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="outline">Supplier listing</Badge>
              <Badge variant="outline">{formatListingCategory(listing.category)}</Badge>
              <Badge variant="secondary">{listing.quantityKg.toFixed(0)} kg available</Badge>
              <Badge variant="outline">{formatPrice(listing.pricePerKg)}/kg</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {listing.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Listed by {listing.sellerName}. Review the material details, images, and supplier signals below before you
              reach out.
            </p>
          </div>

          <Button asChild size="sm" variant="outline">
            <Link href="/browse">Back to browse</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(22rem,1fr)] 2xl:grid-cols-[minmax(0,1.85fr)_minmax(24rem,1fr)]">
        <div className="space-y-8">
          <ImageGallery images={listing.imageUrls} title={listing.title} />
          <p className="text-sm text-muted-foreground">
            The first image is the main product image. Any remaining images show additional detail views.
          </p>

          <ListingFormSection
            description="Core listing details only. This MVP does not include negotiation, messaging threads, or saved listings."
            title="Material details"
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Category</p>
                <p className="text-base font-medium text-foreground">{formatListingCategory(listing.category)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Available</p>
                <p className="text-base font-medium text-foreground">{listing.quantityKg.toFixed(2)} kg</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Price</p>
                <p className="text-base font-medium text-foreground">{formatPrice(listing.pricePerKg)} per kg</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Published</p>
                <p className="text-base font-medium text-foreground">
                  {new Date(listing.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Description</p>
              <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-foreground">{listing.description}</p>
            </div>
          </ListingFormSection>
        </div>

        <div className="space-y-6 xl:sticky xl:top-32 xl:self-start">
          <ListingFormSection title="Seller" description="Use the inquiry panel to make first contact.">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Seller name</p>
                <p className="mt-2 text-xl font-medium text-foreground">{listing.sellerName}</p>
                <RatingStars average={listing.sellerRatingAverage} className="mt-2" count={listing.sellerRatingCount} />
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Contact stays private until a buyer opens the inquiry thread from this page.
              </p>
            </div>
          </ListingFormSection>

          {sessionUser?.role === "buyer" ? (
            <ListingFormSection
              description="Save the listing, follow the supplier, or leave a star rating so you can find trusted sources later."
              title="Save and rate"
            >
              <BuyerEngagementControls
                initialFollowsSeller={listing.viewerFollowsSeller}
                initialHasWishlisted={listing.viewerHasWishlisted}
                initialSellerRating={listing.viewerSellerRating}
                listingId={listing.id}
                sellerId={listing.sellerId}
                sellerName={listing.sellerName}
                sellerRatingAverage={listing.sellerRatingAverage}
                sellerRatingCount={listing.sellerRatingCount}
              />
            </ListingFormSection>
          ) : null}

          <BuyerInquiryPanel
            existingInquiryId={existingInquiryId}
            listingId={listing.id}
            viewerOwnsListing={listing.viewerOwnsListing}
            viewerRole={sessionUser?.role}
          />
        </div>
      </div>
    </PageContainer>
  );
}
