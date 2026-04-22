"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import { submitInquiry } from "@/app/actions/inquiries";
import { ListingFormSection } from "@/components/shared/listing-form-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult, AppRole } from "@/types/domain";

type BuyerInquiryPanelProps = {
  listingId: string;
  viewerOwnsListing: boolean;
  viewerRole?: AppRole;
  existingInquiryId?: string | null;
};

const initialState: ActionResult<{ id: string }> = {
  ok: false,
};

function formatRole(role: AppRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function BuyerInquiryPanel({
  listingId,
  viewerOwnsListing,
  viewerRole,
  existingInquiryId,
}: BuyerInquiryPanelProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ActionResult<{ id: string }>, FormData>(
    submitInquiry,
    initialState,
  );

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.ok, state.redirectTo]);

  if (!viewerRole) {
    return (
      <ListingFormSection
        description="Buyers must sign in before contacting a seller. This MVP supports one inquiry message per listing."
        title="Send inquiry"
      >
        <div className="space-y-4">
          <Badge variant="outline">Buyer sign-in required</Badge>
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in or create a buyer account to send a single inquiry from this listing page.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/sign-in">Sign in to inquire</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/sign-up">Create buyer account</Link>
            </Button>
          </div>
        </div>
      </ListingFormSection>
    );
  }

  if (viewerOwnsListing) {
    return (
      <ListingFormSection
        description="Seller-owned listings are visible publicly, but you cannot send an inquiry to yourself."
        title="Send inquiry"
      >
        <div className="space-y-4">
          <Badge variant="outline">Owner view</Badge>
          <p className="text-sm leading-6 text-muted-foreground">
            This listing belongs to your account, so the inquiry form is disabled here.
          </p>
        </div>
      </ListingFormSection>
    );
  }

  if (viewerRole !== "buyer") {
    return (
      <ListingFormSection
        description="Only buyer accounts can contact sellers through the marketplace in this MVP."
        title="Send inquiry"
      >
        <div className="space-y-4">
          <Badge variant="outline">{formatRole(viewerRole)}</Badge>
          <p className="text-sm leading-6 text-muted-foreground">
            Sign in with a buyer account if you need to send an inquiry for this listing.
          </p>
        </div>
      </ListingFormSection>
    );
  }

  if (existingInquiryId) {
    return (
      <ListingFormSection
        description="You already contacted this seller for this listing. Open the conversation to continue."
        title="Inquiry in progress"
      >
        <div className="space-y-4">
          <Badge>Existing conversation</Badge>
          <p className="text-sm leading-6 text-muted-foreground">
            Continue the thread to review seller replies and send follow-up messages without starting a duplicate inquiry.
          </p>
          <Button asChild>
            <Link href={`/inquiries/${existingInquiryId}`}>Open conversation</Link>
          </Button>
        </div>
      </ListingFormSection>
    );
  }

  return (
    <ListingFormSection
      description="Start a conversation with one concise message about quantity needs, timing, and pickup or shipping expectations."
      title="Start conversation"
    >
      <form action={formAction} className="space-y-4" ref={formRef}>
        <input name="listingId" type="hidden" value={listingId} />

        {state.message ? (
          <div
            className={`rounded-[1.5rem] border px-4 py-3 text-sm ${
              state.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-destructive/20 bg-destructive/5 text-destructive"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm font-medium text-foreground">Message</span>
          <Textarea
            aria-invalid={Boolean(state.fieldErrors?.message)}
            name="message"
            placeholder="Tell the seller what material you need, the quantity you can take, and your target timeline."
            rows={7}
          />
          {state.fieldErrors?.message ? <span className="text-sm text-destructive">{state.fieldErrors.message}</span> : null}
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">This creates a conversation thread that both buyer and seller can reply to.</p>
          <Button disabled={isPending} size="lg" type="submit">
            {isPending ? "Sending..." : "Send inquiry"}
          </Button>
        </div>
      </form>
    </ListingFormSection>
  );
}
