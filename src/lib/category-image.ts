import { isValidImageUrl } from "@/lib/image-utils";

export function normalizeCategoryImage(image?: string | null) {
  const trimmed = image?.trim();
  return trimmed ? trimmed : null;
}

export function validateCategoryImage(image?: string | null) {
  const normalized = normalizeCategoryImage(image);
  if (!normalized) return null;
  if (!isValidImageUrl(normalized)) {
    return "Upload a photo or use a full image URL starting with https://.";
  }
  return null;
}