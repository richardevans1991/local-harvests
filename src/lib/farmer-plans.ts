export type FarmerPlanId = "starter" | "growth" | "premium";

export type FarmerSubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled";

export interface FarmerPlan {
  id: FarmerPlanId;
  name: string;
  priceMonthly: number;
  priceDisplay: string;
  tagline: string;
  highlights: string[];
  managedListingsPerMonth?: string;
}

export const COMMISSION_RATE = 0.1;
export const TRIAL_DAYS = 30;

export const FARMER_PLANS: Record<FarmerPlanId, FarmerPlan> = {
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 1900,
    priceDisplay: "£19",
    tagline: "Run your own online farm shop",
    highlights: [
      "You upload products, photos & categories",
      "Click & collect and delivery options",
      "Order notifications & customer checkout",
      "Email support",
    ],
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 6900,
    priceDisplay: "£69",
    tagline: "We help you list your stock each month",
    highlights: [
      "Everything in Starter",
      "We upload up to 20 products or photo updates per month",
      "Category setup assistance",
      "Priority email support",
    ],
    managedListingsPerMonth: "20 products or photo updates",
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceMonthly: 17900,
    priceDisplay: "£179",
    tagline: "Hands-on shop management for busy farms",
    highlights: [
      "Everything in Growth",
      "Up to 50 product listings or photo updates per month",
      "Weekly shop updates (availability & pricing)",
      "Banner refresh once per month",
      "Priority support — we run your online shelf",
    ],
    managedListingsPerMonth: "50 products or photo updates",
  },
};

export const FARMER_PLAN_LIST = Object.values(FARMER_PLANS);

export function isFarmerPlanId(value: string): value is FarmerPlanId {
  return value in FARMER_PLANS;
}