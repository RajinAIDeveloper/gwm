"use client";

import { useActionState, useEffect, useRef } from "react";

import { sendInquiryReply } from "@/app/actions/inquiries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/types/domain";

type InquiryReplyFormProps = {
  inquiryId: string;
  submitLabel?: string;
};

const initialState: ActionResult = {
  ok: false,
};

function InquiryReplyForm({ inquiryId, submitLabel = "Send reply" }: InquiryReplyFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(sendInquiryReply, initialState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form action={formAction} className="space-y-4" ref={formRef}>
      <input name="inquiryId" type="hidden" value={inquiryId} />

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
        <span className="text-sm font-medium text-foreground">Reply</span>
        <Textarea
          aria-invalid={Boolean(state.fieldErrors?.message)}
          name="message"
          placeholder="Write a clear follow-up message with your next step, timing, or quantity details."
          rows={5}
        />
        {state.fieldErrors?.message ? <span className="text-sm text-destructive">{state.fieldErrors.message}</span> : null}
      </label>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Replies stay inside this inquiry thread for both buyer and seller.</p>
        <Button disabled={isPending} type="submit">
          {isPending ? "Sending..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export { InquiryReplyForm };
