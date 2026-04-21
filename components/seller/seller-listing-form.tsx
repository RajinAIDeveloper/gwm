"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { ListingFormSection } from "@/components/shared/listing-form-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  LISTING_CATEGORIES,
  LISTING_MAIN_IMAGE_COUNT,
  LISTING_MAX_DETAIL_IMAGES,
  LISTING_MAX_IMAGES,
  type ActionResult,
  type ListingCategory,
} from "@/types/domain";
import { formatListingCategory } from "@/components/shared/listing-card";

type ListingAction = (
  previousState: ActionResult | undefined,
  formData: FormData,
) => Promise<ActionResult | ActionResult<{ id: string }>>;

type ListingActionState = ActionResult | ActionResult<{ id: string }>;

type SellerListingFormProps = {
  action: ListingAction;
  submitLabel: string;
  title: string;
  description: string;
  initialValues?: {
    listingId?: string;
    title: string;
    description: string;
    category: ListingCategory;
    quantityKg: number;
    pricePerKg: number;
    existingImagePaths: string[];
    existingImageUrls: string[];
  };
};

const initialState: ListingActionState = {
  ok: false,
};

function SellerListingForm({
  action,
  submitLabel,
  title,
  description,
  initialValues,
}: SellerListingFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ListingActionState, FormData>(
    action as (previousState: ListingActionState, formData: FormData) => Promise<ListingActionState>,
    initialState,
  );

  useEffect(() => {
    if (state.ok && state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [router, state]);

  return (
    <form action={formAction} className="space-y-6">
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

      {initialValues?.listingId ? <input name="listingId" type="hidden" value={initialValues.listingId} /> : null}
      {initialValues?.existingImagePaths.map((path) => (
        <input key={path} name="existingImagePaths" type="hidden" value={path} />
      ))}

      <ListingFormSection
        title={title}
        description={description}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField error={state.fieldErrors?.title} label="Listing title">
            <Input
              aria-invalid={Boolean(state.fieldErrors?.title)}
              defaultValue={initialValues?.title}
              name="title"
              placeholder="Cotton jersey offcuts"
            />
          </FormField>

          <FormField error={state.fieldErrors?.category} label="Category">
            <select
              aria-invalid={Boolean(state.fieldErrors?.category)}
              className="h-11 w-full rounded-4xl border border-input bg-input/30 px-4 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20"
              defaultValue={initialValues?.category ?? LISTING_CATEGORIES[0]}
              name="category"
            >
              {LISTING_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {formatListingCategory(category)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField error={state.fieldErrors?.quantityKg} label="Quantity (kg)">
            <Input
              aria-invalid={Boolean(state.fieldErrors?.quantityKg)}
              defaultValue={initialValues?.quantityKg}
              min="1"
              name="quantityKg"
              placeholder="250"
              step="0.01"
              type="number"
            />
          </FormField>

          <FormField error={state.fieldErrors?.pricePerKg} label="Price per kg (USD)">
            <Input
              aria-invalid={Boolean(state.fieldErrors?.pricePerKg)}
              defaultValue={initialValues?.pricePerKg}
              min="0"
              name="pricePerKg"
              placeholder="2.40"
              step="0.01"
              type="number"
            />
          </FormField>
        </div>

        <div className="mt-5">
          <FormField error={state.fieldErrors?.description} label="Description">
            <Textarea
              aria-invalid={Boolean(state.fieldErrors?.description)}
              defaultValue={initialValues?.description}
              name="description"
              placeholder="Describe fabric composition, color range, packaging, and pickup details."
              rows={6}
            />
          </FormField>
        </div>
      </ListingFormSection>

      <ListingFormSection
        title="Images"
        description={`Upload ${LISTING_MAIN_IMAGE_COUNT} main image and up to ${LISTING_MAX_DETAIL_IMAGES} detail images. The first image is used as the main product image.`}
      >
        {initialValues?.existingImageUrls.length ? (
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge variant="outline">{initialValues.existingImageUrls.length} current images</Badge>
            <Badge variant="secondary">Image 1 is the main image</Badge>
          </div>
        ) : null}

        <FormField error={state.fieldErrors?.images} label="Listing images">
          <Input
            accept="image/*"
            aria-invalid={Boolean(state.fieldErrors?.images)}
            className="h-auto rounded-[1.5rem] px-4 py-3 file:mr-3 file:rounded-full file:border file:border-border file:px-3 file:py-2"
            multiple
            name="images"
            type="file"
          />
        </FormField>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Choose the main product image first. You can store up to {LISTING_MAX_IMAGES} images total.
        </p>
      </ListingFormSection>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Only the core listing fields are supported in this MVP.</p>
        <Button disabled={isPending} size="lg" type="submit">
          {isPending ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

type FormFieldProps = {
  label: string;
  error?: string;
  children: React.ReactNode;
};

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? <span className="text-sm text-destructive">{error}</span> : null}
    </label>
  );
}

export { SellerListingForm };
