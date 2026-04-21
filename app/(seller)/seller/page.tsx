import { PageContainer } from "@/components/shared/page-container";
import { SellerDashboardContent } from "@/components/seller/seller-dashboard-content";
import { requireRole } from "@/lib/auth/session";
import { getSellerListings } from "@/lib/data/listings";

export default async function SellerDashboardPage() {
  const sessionUser = await requireRole("seller");
  const listings = await getSellerListings(sessionUser.id, sessionUser.accessToken);
  const displayName = sessionUser.user.user_metadata?.display_name || sessionUser.email || "Seller";

  return (
    <PageContainer>
      <SellerDashboardContent displayName={displayName} listings={listings} />
    </PageContainer>
  );
}
