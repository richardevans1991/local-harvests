export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop";

export function isUploadedImagePath(url: string): boolean {
  const trimmed = url?.trim();
  return Boolean(trimmed && trimmed.startsWith("/uploads/"));
}

export function isValidImageUrl(url: string): boolean {
  if (!url?.trim()) return false;
  if (isUploadedImagePath(url)) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeImageUrl(url: string): string {
  const trimmed = url?.trim();
  if (!trimmed) return FALLBACK_IMAGE;
  if (isUploadedImagePath(trimmed)) return trimmed;
  return isValidImageUrl(trimmed) ? trimmed : FALLBACK_IMAGE;
}

/** Stripe Checkout requires publicly reachable absolute https URLs for line-item images. */
export function toStripeImageUrl(url: string, appOrigin: string): string | undefined {
  const trimmed = url?.trim();
  if (!trimmed) return undefined;

  const origin = appOrigin.replace(/\/$/, "");
  const absolute = trimmed.startsWith("/") ? `${origin}${trimmed}` : trimmed;

  try {
    const parsed = new URL(absolute);
    if (parsed.protocol !== "https:") return undefined;
    return parsed.toString();
  } catch {
    return undefined;
  }
}