import Link from "next/link";

import { createListing } from "@/app/actions/listings";
import { PageContainer } from "@/components/shared/page-container";
import { SellerListingForm } from "@/components/seller/seller-listing-form";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";

export default async function NewListingPage() {
  await requireRole("seller");

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Create listing</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Add the minimum information buyers need to evaluate the material and contact you.
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/seller">Back to dashboard</Link>
        </Button>
      </div>

      <SellerListingForm
        action={createListing}
        description="Listings go live immediately in this MVP once they pass basic validation. Upload 1 main image and up to 4 detail images."
        submitLabel="Publish listing"
        title="Material details"
      />
    </PageContainer>
  );
}
