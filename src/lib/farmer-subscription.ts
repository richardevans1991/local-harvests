import {
  COMMISSION_RATE,
  FARMER_PLANS,
  type FarmerPlanId,
  type FarmerSubscriptionStatus,
  TRIAL_DAYS,
} from "@/lib/farmer-plans";

export interface FarmerSubscriptionView {
  tier: FarmerPlanId | null;
  status: FarmerSubscriptionStatus;
  trialEndsAt: string | null;
  daysLeftInTrial: number | null;
  commissionRate: number;
  planName: string | null;
  planPriceDisplay: string | null;
  needsPlanSelection: boolean;
  needsPayment: boolean;
  canManageShop: boolean;
}

interface FarmerSubscriptionUser {
  subscriptionTier: string | null;
  subscriptionStatus: string;
  trialEndsAt: Date | null;
}

export function trialEndDateFromNow() {
  const ends = new Date();
  ends.setDate(ends.getDate() + TRIAL_DAYS);
  return ends;
}

export function isTrialActive(trialEndsAt: Date | null) {
  return Boolean(trialEndsAt && trialEndsAt.getTime() > Date.now());
}

export function commissionApplies(trialEndsAt: Date | null) {
  return !isTrialActive(trialEndsAt);
}

export function getCommissionRate(trialEndsAt: Date | null) {
  return commissionApplies(trialEndsAt) ? COMMISSION_RATE : 0;
}

export function calculateOrderFees(
  subtotal: number,
  trialEndsAt: Date | null
): { platformFee: number; farmerTotal: number; commissionRate: number } {
  const commissionRate = getCommissionRate(trialEndsAt);
  const platformFee = Math.round(subtotal * commissionRate * 100) / 100;
  const farmerTotal = Math.round((subtotal - platformFee) * 100) / 100;
  return { platformFee, farmerTotal, commissionRate };
}

export function daysLeftInTrial(trialEndsAt: Date | null) {
  if (!trialEndsAt) return null;
  const ms = trialEndsAt.getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function getFarmerSubscriptionView(
  user: FarmerSubscriptionUser | null | undefined
): FarmerSubscriptionView {
  if (!user) {
    return {
      tier: null,
      status: "none",
      trialEndsAt: null,
      daysLeftInTrial: null,
      commissionRate: COMMISSION_RATE,
      planName: null,
      planPriceDisplay: null,
      needsPlanSelection: true,
      needsPayment: false,
      canManageShop: false,
    };
  }

  const status = (user.subscriptionStatus || "none") as FarmerSubscriptionStatus;
  const tier =
    user.subscriptionTier && user.subscriptionTier in FARMER_PLANS
      ? (user.subscriptionTier as FarmerPlanId)
      : null;
  const trialEndsAt = user.trialEndsAt?.toISOString() ?? null;
  const trialActive = isTrialActive(user.trialEndsAt);
  const daysLeft = daysLeftInTrial(user.trialEndsAt);
  const plan = tier ? FARMER_PLANS[tier] : null;

  const needsPlanSelection = status === "none" || !tier;
  const needsPayment =
    !needsPlanSelection &&
    !trialActive &&
    status !== "active";
  const canManageShop =
    !needsPlanSelection && (trialActive || status === "active" || status === "past_due");

  return {
    tier,
    status,
    trialEndsAt,
    daysLeftInTrial: daysLeft,
    commissionRate: getCommissionRate(user.trialEndsAt),
    planName: plan?.name ?? null,
    planPriceDisplay: plan?.priceDisplay ?? null,
    needsPlanSelection,
    needsPayment,
    canManageShop,
  };
}