export const DEFAULT_FARM_IMAGE =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=400&fit=crop";

export const DEFAULT_FARM_BANNER =
  "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=400&fit=crop";

export const DEFAULT_FARM_SHORT_DESCRIPTION =
  "Fresh produce from our local farm shop.";

export const DEFAULT_FARM_DESCRIPTION =
  "Welcome to our farm shop. We grow and source quality food for our local community. Update this description in your dashboard to tell customers what makes your farm special.";

export function createFarmId(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `farm-${slug || "shop"}-${suffix}`;
}