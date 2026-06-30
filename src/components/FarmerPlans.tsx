"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  COMMISSION_RATE,
  FARMER_PLAN_LIST,
  type FarmerPlanId,
  TRIAL_DAYS,
} from "@/lib/farmer-plans";
import type { FarmerSubscriptionView } from "@/lib/farmer-subscription";
import { api } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

export default function FarmerPlans() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentUser = useAuthStore((s) => s.currentUser);
  const initialized = useAuthStore((s) => s.initialized);

  const [subscription, setSubscription] = useState<FarmerSubscriptionView | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<FarmerPlanId | "billing" | null>(null);
  const [error, setError] = useState("");

  const cancelled = searchParams.get("cancelled");

  useEffect(() => {
    if (!initialized) return;
    if (!currentUser || currentUser.role !== "farmer") {
      router.replace("/farmer/login");
      return;
    }

    api.farmer.subscription
      .get()
      .then(({ subscription: sub }) => setSubscription(sub))
      .catch(() => setError("Could not load your plan details."))
      .finally(() => setLoading(false));
  }, [initialized, currentUser, router]);

  const handleSelectPlan = async (tier: FarmerPlanId) => {
    setError("");
    setSubmitting(tier);
    try {
      const { subscription: sub } = await api.farmer.subscription.start(tier);
      setSubscription(sub);
      router.push("/farmer/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start your plan.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubscribe = async () => {
    setError("");
    setSubmitting("billing");
    try {
      const { url } = await api.farmer.subscription.checkout();
      if (url) {
        window.location.href = url;
        return;
      }
      setError("Could not open billing checkout.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start billing.");
    } finally {
      setSubmitting(null);
    }
  };

  if (!initialized || loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl bg-harvest-tan/40" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "farmer") {
    return null;
  }

  const commissionPercent = Math.round(COMMISSION_RATE * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl text-center">
        <p className="inline-block rounded-full border border-harvest-green/30 bg-white/80 px-4 py-1 text-sm font-semibold uppercase tracking-widest text-harvest-brown">
          Farmer plans
        </p>
        <h1 className="mt-4 font-serif text-3xl font-bold text-harvest-green sm:text-4xl">
          Choose how you want to run your shop
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-harvest-brown/85">
          <strong>First month free</strong> — no monthly fee and no {commissionPercent}% sales
          commission. From month two: your plan fee plus {commissionPercent}% only when you sell
          (you keep {100 - commissionPercent}%).
        </p>
      </div>

      {cancelled && (
        <p className="mx-auto mt-6 max-w-2xl rounded-lg bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          Billing checkout was cancelled. Your free month is still active.
        </p>
      )}

      {error && (
        <p className="mx-auto mt-6 max-w-2xl rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </p>
      )}

      {subscription && !subscription.needsPlanSelection && (
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-harvest-green/30 bg-white p-6 text-center shadow-sm">
          <p className="font-serif text-xl font-bold text-harvest-green">
            Current plan: {subscription.planName}
          </p>
          {subscription.status === "trialing" && subscription.daysLeftInTrial !== null && (
            <p className="mt-2 text-harvest-brown">
              Free month — <strong>{subscription.daysLeftInTrial} day(s)</strong> left. No{" "}
              {commissionPercent}% commission during your trial.
            </p>
          )}
          {subscription.needsPayment && (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-harvest-brown/85">
                Your free month has ended. Add billing to keep your shop live (
                {subscription.planPriceDisplay}/month + {commissionPercent}% on sales).
              </p>
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={Boolean(submitting)}
                className="farm-btn-primary px-6 py-3 text-sm disabled:opacity-60"
              >
                {submitting === "billing" ? "Opening checkout..." : "Set up monthly billing"}
              </button>
            </div>
          )}
          {subscription.canManageShop && (
            <Link
              href="/farmer/dashboard"
              className="mt-4 inline-block text-sm font-medium text-harvest-green hover:underline"
            >
              ← Back to dashboard
            </Link>
          )}
        </div>
      )}

      {subscription?.needsPlanSelection && (
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {FARMER_PLAN_LIST.map((plan) => (
            <article
              key={plan.id}
              className={`farm-panel flex flex-col p-6 ${
                plan.id === "growth" ? "ring-2 ring-harvest-green/40" : ""
              }`}
            >
              {plan.id === "growth" && (
                <span className="mb-3 inline-block w-fit rounded-full bg-harvest-green/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-harvest-green-dark">
                  Most popular
                </span>
              )}
              <h2 className="font-serif text-2xl font-bold text-harvest-green">{plan.name}</h2>
              <p className="mt-1 text-sm text-harvest-brown/80">{plan.tagline}</p>
              <p className="mt-4 font-serif text-3xl font-bold text-harvest-rust">
                {plan.priceDisplay}
                <span className="text-base font-normal text-harvest-brown/70">/month</span>
              </p>
              <p className="mt-2 text-xs text-harvest-brown/70">
                After {TRIAL_DAYS}-day free trial · +{commissionPercent}% on sales from month 2
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-sm text-harvest-brown/90">
                {plan.highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-harvest-green">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => handleSelectPlan(plan.id)}
                disabled={Boolean(submitting)}
                className="mt-6 w-full rounded-full bg-harvest-green py-3 text-sm font-semibold text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
              >
                {submitting === plan.id
                  ? "Starting free month..."
                  : `Start free month on ${plan.name}`}
              </button>
            </article>
          ))}
        </div>
      )}

      <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-harvest-tan/60 bg-harvest-parchment/40 p-6 text-sm leading-relaxed text-harvest-brown/85">
        <p className="font-semibold text-harvest-brown">How billing works</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            <strong>Month 1:</strong> free — no monthly charge and no {commissionPercent}%
            commission on orders.
          </li>
          <li>
            <strong>From month 2:</strong> your plan fee ({FARMER_PLAN_LIST.map((p) => p.priceDisplay).join(" / ")}) plus {commissionPercent}% on each sale. Farmers keep {100 - commissionPercent}% — far better than most retail supply chains.
          </li>
          <li>
            Growth and Premium include a set number of listings we upload for you each month — not unlimited, so we can do quality work for every farm.
          </li>
        </ul>
      </div>
    </div>
  );
}