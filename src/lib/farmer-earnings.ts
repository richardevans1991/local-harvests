import { COMMISSION_RATE } from "@/lib/farmer-plans";

const NON_EARNING_STATUSES = new Set(["pending", "cancelled"]);
const PAYOUT_ELIGIBLE_STATUSES = new Set(["completed"]);
const PENDING_PAYOUT_STATUSES = new Set(["paid", "confirmed", "ready"]);

export function commissionRateForOrder(
  trialEndsAt: Date | null,
  orderCreatedAt: Date
) {
  if (trialEndsAt && trialEndsAt.getTime() > orderCreatedAt.getTime()) {
    return 0;
  }
  return COMMISSION_RATE;
}

export function farmerShareFromLine(
  lineTotal: number,
  trialEndsAt: Date | null,
  orderCreatedAt: Date
) {
  const rate = commissionRateForOrder(trialEndsAt, orderCreatedAt);
  const platformFee = Math.round(lineTotal * rate * 100) / 100;
  const farmerEarnings = Math.round((lineTotal - platformFee) * 100) / 100;
  return { platformFee, farmerEarnings, commissionRate: rate };
}

export function isEarningOrderStatus(status: string) {
  return !NON_EARNING_STATUSES.has(status);
}

export function isPayoutEligibleStatus(status: string) {
  return PAYOUT_ELIGIBLE_STATUSES.has(status);
}

export function isPendingPayoutStatus(status: string) {
  return PENDING_PAYOUT_STATUSES.has(status);
}