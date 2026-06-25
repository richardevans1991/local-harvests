/** Free Unsplash URLs — paste these in the dashboard or use via seed/backfill */
export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  "Vegetables & Produce":
    "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&h=200&fit=crop",
  "Dairy & Milk":
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop",
  Bakery:
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop",
  "Honey & Jams":
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=200&h=200&fit=crop",
  "Meat & Poultry":
    "https://images.unsplash.com/photo-1558030006-450675393462?w=200&h=200&fit=crop",
  "Chicken Breast":
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=200&h=200&fit=crop",
  Eggs:
    "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=200&h=200&fit=crop",
  Cheese:
    "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=200&h=200&fit=crop",
  Preserves:
    "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=200&h=200&fit=crop",
  Drinks:
    "https://images.unsplash.com/photo-1546173159-315724a31696?w=200&h=200&fit=crop",
  Flowers:
    "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=200&h=200&fit=crop",
  "Flowers & Plants":
    "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=200&h=200&fit=crop",
  "Fruit & Berries":
    "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop",
};

const CATEGORY_IMAGE_ALIASES: Record<string, string> = {
  milk: "Dairy & Milk",
  dairy: "Dairy & Milk",
  "dairy & milk": "Dairy & Milk",
  drink: "Drinks",
  drinks: "Drinks",
  meat: "Meat & Poultry",
  poultry: "Meat & Poultry",
  "meat & poultry": "Meat & Poultry",
  "chicken breast": "Chicken Breast",
  chicken: "Chicken Breast",
  flowers: "Flowers & Plants",
  plants: "Flowers & Plants",
  "flowers & plants": "Flowers & Plants",
  "flowers and plants": "Flowers & Plants",
  "flowers and plant": "Flowers & Plants",
};

export function getDefaultCategoryImage(name: string) {
  const trimmed = name.trim();
  if (DEFAULT_CATEGORY_IMAGES[trimmed]) {
    return DEFAULT_CATEGORY_IMAGES[trimmed];
  }

  const alias = CATEGORY_IMAGE_ALIASES[trimmed.toLowerCase()];
  return alias ? DEFAULT_CATEGORY_IMAGES[alias] : null;
}