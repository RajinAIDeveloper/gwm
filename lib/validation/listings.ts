import type { CreateListingInput, FieldErrors, ListingCategory, UpdateListingInput } from "@/types/domain";
import { LISTING_CATEGORIES, LISTING_MAX_DETAIL_IMAGES, LISTING_MAX_IMAGES } from "@/types/domain";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function getImageFiles(formData: FormData) {
  return formData
    .getAll("images")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function getExistingImagePaths(formData: FormData) {
  return formData
    .getAll("existingImagePaths")
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

function validateImages(imageFiles: File[], totalImageCount: number, fieldErrors: FieldErrors) {
  if (totalImageCount > LISTING_MAX_IMAGES) {
    fieldErrors.images = `Use 1 main image and up to ${LISTING_MAX_DETAIL_IMAGES} detail images.`;
  }

  for (const file of imageFiles) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      fieldErrors.images = "Images must be JPEG, PNG, or WebP.";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      fieldErrors.images = "Each image must be 5 MB or smaller.";
      return;
    }
  }
}

function parseBaseListingInput(formData: FormData) {
  const title = getString(formData, "title");
  const description = getString(formData, "description");
  const category = getString(formData, "category");
  const quantityKg = getNumber(getString(formData, "quantityKg"));
  const pricePerKg = getNumber(getString(formData, "pricePerKg"));
  const imageFiles = getImageFiles(formData);
  const existingImagePaths = getExistingImagePaths(formData);
  const fieldErrors: FieldErrors = {};

  if (title.length < 3 || title.length > 120) {
    fieldErrors.title = "Title must be between 3 and 120 characters.";
  }

  if (description.length < 20 || description.length > 2000) {
    fieldErrors.description = "Description must be between 20 and 2000 characters.";
  }

  if (!LISTING_CATEGORIES.includes(category as ListingCategory)) {
    fieldErrors.category = "Select a valid listing category.";
  }

  if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
    fieldErrors.quantityKg = "Quantity must be greater than zero.";
  }

  if (!Number.isFinite(pricePerKg) || pricePerKg < 0) {
    fieldErrors.pricePerKg = "Price must be zero or greater.";
  }

  validateImages(imageFiles, imageFiles.length + existingImagePaths.length, fieldErrors);

  return {
    fieldErrors,
    data: {
      title,
      description,
      category: category as ListingCategory,
      quantityKg,
      pricePerKg,
      imageFiles,
      existingImagePaths,
    },
  };
}

export function validateCreateListingFormData(formData: FormData) {
  const parsed = parseBaseListingInput(formData);

  if (parsed.data.imageFiles.length === 0) {
    parsed.fieldErrors.images = "Add 1 main image and optionally up to 4 detail images.";
  }

  if (Object.keys(parsed.fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors: parsed.fieldErrors };
  }

  return {
    ok: true as const,
    data: parsed.data satisfies CreateListingInput,
  };
}

export function validateUpdateListingFormData(formData: FormData) {
  const listingId = getString(formData, "listingId");
  const parsed = parseBaseListingInput(formData);

  if (!listingId) {
    parsed.fieldErrors.listingId = "Listing id is required.";
  }

  if (parsed.data.imageFiles.length + parsed.data.existingImagePaths.length === 0) {
    parsed.fieldErrors.images = "Keep or upload at least 1 main image.";
  }

  if (Object.keys(parsed.fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors: parsed.fieldErrors };
  }

  return {
    ok: true as const,
    data: {
      listingId,
      ...parsed.data,
    } satisfies UpdateListingInput,
  };
}
