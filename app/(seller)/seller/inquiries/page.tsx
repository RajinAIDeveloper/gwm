import Link from "next/link";

import { PageContainer } from "@/components/shared/page-container";
import { SellerInquiryList } from "@/components/seller/seller-inquiry-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth/session";
import { getSellerInquiries } from "@/lib/data/inquiries";

export default async function SellerInquiriesPage() {
  const sessionUser = await requireRole("seller");
  const inquiries = await getSellerInquiries(sessionUser.id, sessionUser.accessToken);

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="outline">Inquiry inbox</Badge>
            <Badge variant="secondary">{inquiries.length} received</Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Buyer inquiries</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review the latest single-message inquiries sent to your active listings.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href="/seller">Back to dashboard</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/seller/listings/new">Create listing</Link>
          </Button>
        </div>
      </div>

      <SellerInquiryList inquiries={inquiries} />
    </PageContainer>
  );
}
