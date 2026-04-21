import Link from "next/link";
import { notFound } from "next/navigation";

import { BuyerInquiryPanel } from "@/components/buyer/buyer-inquiry-panel";
import { ImageGallery } from "@/components/shared/image-gallery";
import { ListingFormSection } from "@/components/shared/listing-form-section";
import { PageContainer } from "@/components/shared/page-container";
import { formatListingCategory } from "@/components/shared/listing-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOptionalSessionUser } from "@/lib/auth/session";
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

  if (!listing) {
    notFound();
  }

  return (
    <PageContainer className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="outline">{formatListingCategory(listing.category)}</Badge>
            <Badge variant="secondary">{listing.quantityKg.toFixed(0)} kg available</Badge>
            <Badge variant="outline">{formatPrice(listing.pricePerKg)}/kg</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{listing.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Listed by {listing.sellerName}. Review the material details below and send a single inquiry if it fits your
            sourcing needs.
          </p>
        </div>

        <Button asChild size="sm" variant="outline">
          <Link href="/browse">Back to browse</Link>
        </Button>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(22rem,1fr)]">
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

        <div className="space-y-6">
          <ListingFormSection title="Seller" description="Use the inquiry panel to make first contact.">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Seller name</p>
                <p className="mt-2 text-lg font-medium text-foreground">{listing.sellerName}</p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                This MVP keeps contact private until a buyer sends a single inquiry from this page.
              </p>
            </div>
          </ListingFormSection>

          <BuyerInquiryPanel
            listingId={listing.id}
            viewerOwnsListing={listing.viewerOwnsListing}
            viewerRole={sessionUser?.role}
          />
        </div>
      </div>
    </PageContainer>
  );
}
