import { isValidImageUrl } from "@/lib/image-utils";

export function normalizeCategoryImage(image?: string | null) {
  const trimmed = image?.trim();
  return trimmed ? trimmed : null;
}

export function validateCategoryImage(image?: string | null) {
  const normalized = normalizeCategoryImage(image);
  if (!normalized) return null;
  if (!isValidImageUrl(normalized)) {
    return "Image must be a full URL starting with https:// (e.g. an Unsplash link).";
  }
  return null;
}