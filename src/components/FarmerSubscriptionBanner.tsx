"use client";

import Link from "next/link";
import { COMMISSION_RATE } from "@/lib/farmer-plans";
import type { FarmerSubscriptionView } from "@/lib/farmer-subscription";

interface FarmerSubscriptionBannerProps {
  subscription: FarmerSubscriptionView;
}

export default function FarmerSubscriptionBanner({
  subscription,
}: FarmerSubscriptionBannerProps) {
  const commissionPercent = Math.round(COMMISSION_RATE * 100);

  if (subscription.needsPlanSelection) {
    return (
      <div className="rounded-2xl border border-harvest-rust/30 bg-amber-50/80 p-5">
        <p className="font-semibold text-harvest-brown">Choose your farmer plan to get started</p>
        <p className="mt-1 text-sm text-harvest-brown/85">
          Your first month is free — no monthly fee and no {commissionPercent}% commission on sales.
        </p>
        <Link
          href="/farmer/plans"
          className="mt-3 inline-block rounded-full bg-harvest-green px-4 py-2 text-sm font-semibold text-harvest-brown"
        >
          View plans
        </Link>
      </div>
    );
  }

  if (subscription.needsPayment) {
    return (
      <div className="rounded-2xl border border-harvest-rust/40 bg-red-50/70 p-5">
        <p className="font-semibold text-harvest-brown">Your free month has ended</p>
        <p className="mt-1 text-sm text-harvest-brown/85">
          Add billing for your {subscription.planName} plan ({subscription.planPriceDisplay}
          /month + {commissionPercent}% on sales) to keep managing your shop.
        </p>
        <Link
          href="/farmer/plans"
          className="mt-3 inline-block rounded-full bg-harvest-rust px-4 py-2 text-sm font-semibold text-white"
        >
          Set up billing
        </Link>
      </div>
    );
  }

  if (subscription.status === "trialing" && subscription.daysLeftInTrial !== null) {
    return (
      <div className="rounded-2xl border border-harvest-green/30 bg-harvest-green-light/30 p-5">
        <p className="font-semibold text-harvest-green">
          {subscription.planName} plan — free month active
        </p>
        <p className="mt-1 text-sm text-harvest-brown/85">
          {subscription.daysLeftInTrial} day(s) left with no monthly fee and no {commissionPercent}%
          commission. From month 2: {subscription.planPriceDisplay}/month + {commissionPercent}% on
          sales.
        </p>
        <Link href="/farmer/plans" className="mt-2 inline-block text-sm font-medium text-harvest-green hover:underline">
          Plan details
        </Link>
      </div>
    );
  }

  if (subscription.status === "past_due") {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
        <p className="font-semibold text-harvest-brown">Payment issue on your subscription</p>
        <p className="mt-1 text-sm text-harvest-brown/85">
          Please update billing to avoid interruption to your shop.
        </p>
        <Link
          href="/farmer/plans"
          className="mt-3 inline-block text-sm font-medium text-harvest-green hover:underline"
        >
          Manage billing
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-harvest-tan/60 bg-white/80 p-5">
      <p className="font-semibold text-harvest-green">
        {subscription.planName} plan — active
      </p>
      <p className="mt-1 text-sm text-harvest-brown/85">
        {subscription.planPriceDisplay}/month · {commissionPercent}% on sales · you keep{" "}
        {100 - commissionPercent}%
      </p>
      <Link href="/farmer/plans" className="mt-2 inline-block text-sm font-medium text-harvest-green hover:underline">
        View plan details
      </Link>
    </div>
  );
}