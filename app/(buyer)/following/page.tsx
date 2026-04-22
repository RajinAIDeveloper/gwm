import { BuyerFollowingList } from "@/components/buyer/buyer-following-list";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { getFollowedSellers } from "@/lib/data/engagement";

export default async function FollowingPage() {
  const sessionUser = await requireRole("buyer");
  const sellers = await getFollowedSellers(sessionUser.id, sessionUser.accessToken);

  return (
    <PageContainer className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="outline">Following</Badge>
          <Badge variant="secondary">{sellers.length} supplier{sellers.length === 1 ? "" : "s"}</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Followed suppliers</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Suppliers you follow appear here with their current rating average and number of active listings.
        </p>
      </div>

      <BuyerFollowingList sellers={sellers} />
    </PageContainer>
  );
}
