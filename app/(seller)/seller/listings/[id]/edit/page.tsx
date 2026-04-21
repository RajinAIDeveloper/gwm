import Link from "next/link";
import { notFound } from "next/navigation";

import { updateListing } from "@/app/actions/listings";
import { ImageGallery } from "@/components/shared/image-gallery";
import { PageContainer } from "@/components/shared/page-container";
import { SellerListingForm } from "@/components/seller/seller-listing-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { getListingById } from "@/lib/data/listings";
import { LISTING_IMAGES_BUCKET } from "@/lib/supabase/config";

type EditListingPageProps = {
  params: Promise<{ id: string }>;
};

function getStoragePathFromPublicUrl(url: string) {
  const marker = `/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/`;

  try {
    const pathname = new URL(url).pathname;
    const index = pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(pathname.slice(index + marker.length));
  } catch {
    return null;
  }
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const sessionUser = await requireRole("seller");
  const { id } = await params;
  const listing = await getListingById(id, sessionUser.id);

  if (!listing || listing.sellerId !== sessionUser.id) {
    notFound();
  }

  const existingImagePaths = listing.imageUrls
    .map(getStoragePathFromPublicUrl)
    .filter((path): path is string => Boolean(path));

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="outline">Edit listing</Badge>
            <Badge variant="secondary">{listing.quantityKg.toFixed(0)} kg available</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{listing.title}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Update the current material details. The first image remains the main image, and you can keep up to four additional detail images.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={`/listings/${listing.id}`}>Preview listing</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/seller">Back to dashboard</Link>
          </Button>
        </div>
      </div>

      {listing.imageUrls.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Current images</h2>
          <ImageGallery images={listing.imageUrls} title={listing.title} />
        </section>
      ) : null}

      <SellerListingForm
        action={updateListing}
        description="Core listing fields only. Keep 1 main image and at most 4 detail images total."
        initialValues={{
          listingId: listing.id,
          title: listing.title,
          description: listing.description,
          category: listing.category,
          quantityKg: listing.quantityKg,
          pricePerKg: listing.pricePerKg,
          existingImagePaths,
          existingImageUrls: listing.imageUrls,
        }}
        submitLabel="Save changes"
        title="Material details"
      />
    </PageContainer>
  );
}
