import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InquirySummary } from "@/types/domain";

type BuyerInquiryListProps = {
  inquiries: InquirySummary[];
};

function BuyerInquiryList({ inquiries }: BuyerInquiryListProps) {
  if (inquiries.length === 0) {
    return (
      <EmptyState
        action={
          <Button asChild>
            <Link href="/browse">Browse listings</Link>
          </Button>
        }
        description="Your conversations with sellers will appear here after you send your first inquiry."
        title="No inquiries yet"
      />
    );
  }

  return (
    <div className="grid gap-4">
      {inquiries.map((inquiry) => (
        <Card key={inquiry.id} className="border border-border/70 bg-card shadow-sm">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Conversation</Badge>
                  {inquiry.unread ? <Badge>Unread reply</Badge> : null}
                </div>
                <CardTitle className="text-xl">{inquiry.listingTitle}</CardTitle>
              </div>
              <Button asChild size="sm">
                <Link href={`/inquiries/${inquiry.id}`}>Open thread</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Seller</p>
                <p className="mt-1 text-foreground">{inquiry.sellerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Last message</p>
                <p className="mt-1 text-foreground">
                  {new Date(inquiry.latestMessageAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Listing</p>
                <p className="mt-1 text-foreground">{inquiry.listingTitle}</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-muted/60 p-4 text-sm leading-6 text-foreground">
              {inquiry.latestMessage}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { BuyerInquiryList };
