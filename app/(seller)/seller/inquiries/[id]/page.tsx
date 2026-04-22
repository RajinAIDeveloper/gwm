import Link from "next/link";
import { notFound } from "next/navigation";

import { InquiryReplyForm } from "@/components/shared/inquiry-reply-form";
import { InquiryThread } from "@/components/shared/inquiry-thread";
import { ListingFormSection } from "@/components/shared/listing-form-section";
import { PageContainer } from "@/components/shared/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { markInquiryRead, getInquiryThread } from "@/lib/data/inquiries";
import { requireRole } from "@/lib/auth/session";

type SellerInquiryThreadPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SellerInquiryThreadPage({ params }: SellerInquiryThreadPageProps) {
  const sessionUser = await requireRole("seller");
  const { id } = await params;
  const thread = await getInquiryThread(id, sessionUser);

  if (!thread || thread.sellerId !== sessionUser.id) {
    notFound();
  }

  await markInquiryRead(thread.id, sessionUser);

  return (
    <PageContainer className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="outline">Conversation</Badge>
            <Badge variant={thread.unread ? "default" : "outline"}>
              {thread.unread ? "Unread when opened" : "Up to date"}
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{thread.listingTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Continue the conversation with {thread.buyerName} directly inside the marketplace.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild size="sm" variant="outline">
            <Link href={`/listings/${thread.listingId}`}>Open listing</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/seller/inquiries">Back to inbox</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_minmax(22rem,1fr)]">
        <ListingFormSection
          description="Messages are ordered oldest to newest. Opening this page marks the conversation as read for the seller."
          title="Conversation thread"
        >
          <InquiryThread messages={thread.messages} viewerRole={sessionUser.role} />
        </ListingFormSection>

        <div className="space-y-6">
          <ListingFormSection title="Buyer" description="Contact details are visible after the buyer starts the conversation.">
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Buyer name</p>
                <p className="mt-2 text-base font-medium text-foreground">{thread.buyerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Buyer email</p>
                <p className="mt-2 break-all text-foreground">{thread.buyerEmail}</p>
              </div>
            </div>
          </ListingFormSection>

          <ListingFormSection
            description="A seller reply updates the thread and becomes visible to the buyer in their inquiry view."
            title="Reply"
          >
            <InquiryReplyForm inquiryId={thread.id} submitLabel="Send seller reply" />
          </ListingFormSection>
        </div>
      </div>
    </PageContainer>
  );
}
