import { PageContainer } from "@/components/shared/page-container";
import { BuyerBrowseResults } from "@/components/buyer/buyer-browse-results";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { getWishlistedListings } from "@/lib/data/engagement";

export default async function WishlistPage() {
  const sessionUser = await requireRole("buyer");
  const listings = await getWishlistedListings(sessionUser.id, sessionUser.accessToken);

  return (
    <PageContainer className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="outline">Wishlist</Badge>
          <Badge variant="secondary">{listings.length} saved listing{listings.length === 1 ? "" : "s"}</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Saved stock</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Keep track of listings you want to revisit without searching the marketplace again.
        </p>
      </div>

      <BuyerBrowseResults listings={listings} search="" />
    </PageContainer>
  );
}
