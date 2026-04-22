import { BuyerInquiryList } from "@/components/buyer/buyer-inquiry-list";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { getBuyerInquirySummaries } from "@/lib/data/inquiries";

export default async function BuyerInquiriesPage() {
  const sessionUser = await requireRole("buyer");
  const inquiries = await getBuyerInquirySummaries(sessionUser.id, sessionUser.accessToken);
  const unreadCount = inquiries.filter((inquiry) => inquiry.unread).length;

  return (
    <PageContainer className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant="outline">Buyer inbox</Badge>
          <Badge variant="secondary">{inquiries.length} conversations</Badge>
          <Badge variant={unreadCount > 0 ? "default" : "outline"}>{unreadCount} unread</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your inquiries</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Review seller replies and continue existing conversations without starting duplicate inquiries.
        </p>
      </div>

      <BuyerInquiryList inquiries={inquiries} />
    </PageContainer>
  );
}
