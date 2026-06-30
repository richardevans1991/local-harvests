import type { Farm, FarmCategory, Product } from "@/types";

export interface FarmerOnboardingStatus {
  hasFarm: boolean;
  profileComplete: boolean;
  hasCategory: boolean;
  hasProduct: boolean;
  isComplete: boolean;
  productCount: number;
  categoryCount: number;
}

export function getFarmerOnboardingStatus(
  farm: Farm | null,
  categories: FarmCategory[],
  products: Product[]
): FarmerOnboardingStatus {
  const hasFarm = Boolean(farm);
  const profileComplete = Boolean(
    farm?.shortDescription?.trim() &&
      farm?.description?.trim() &&
      farm?.location?.trim()
  );
  const categoryCount = categories.length;
  const productCount = products.length;
  const hasCategory = categoryCount > 0;
  const hasProduct = productCount > 0;
  const isComplete = hasFarm && profileComplete && hasCategory && hasProduct;

  return {
    hasFarm,
    profileComplete,
    hasCategory,
    hasProduct,
    isComplete,
    productCount,
    categoryCount,
  };
}