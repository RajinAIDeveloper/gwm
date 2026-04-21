import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Inquiry } from "@/types/domain";

type SellerInquiryListProps = {
  inquiries: Inquiry[];
};

function SellerInquiryList({ inquiries }: SellerInquiryListProps) {
  if (inquiries.length === 0) {
    return (
      <EmptyState
        action={
          <Button asChild>
            <Link href="/seller">Back to dashboard</Link>
          </Button>
        }
        description="Once buyers submit inquiries on your listings, they will appear here with the buyer contact details."
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
                <Badge variant="outline">Inquiry</Badge>
                <CardTitle className="text-xl">{inquiry.listingTitle}</CardTitle>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/listings/${inquiry.listingId}`}>Open listing</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Buyer</p>
                <p className="mt-1 text-foreground">{inquiry.buyerName}</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Email</p>
                <p className="mt-1 break-all text-foreground">{inquiry.buyerEmail}</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-[0.18em] uppercase text-muted-foreground">Received</p>
                <p className="mt-1 text-foreground">
                  {new Date(inquiry.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-muted/60 p-4 text-sm leading-6 text-foreground">
              {inquiry.message}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export { SellerInquiryList };
