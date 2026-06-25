export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop";

export function isValidImageUrl(url: string): boolean {
  if (!url?.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeImageUrl(url: string): string {
  return isValidImageUrl(url) ? url.trim() : FALLBACK_IMAGE;
}