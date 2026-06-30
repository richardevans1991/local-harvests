import Link from "next/link";
import type { FarmerOnboardingStatus } from "@/lib/farmer-onboarding";

interface FarmerOnboardingChecklistProps {
  onboarding: FarmerOnboardingStatus;
}

export default function FarmerOnboardingChecklist({
  onboarding,
}: FarmerOnboardingChecklistProps) {
  if (onboarding.isComplete) return null;

  const items = [
    { done: onboarding.profileComplete, label: "Shop profile filled in" },
    { done: onboarding.hasCategory, label: "At least one category" },
    { done: onboarding.hasProduct, label: "At least one product live" },
  ];

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold text-harvest-green">
            Finish setting up your shop
          </h2>
          <p className="mt-1 text-sm text-harvest-brown/85">
            Complete these steps so customers can find and order from you.
          </p>
        </div>
        <Link
          href="/farmer/onboarding"
          className="rounded-full bg-harvest-green px-4 py-2 text-sm font-semibold text-harvest-brown hover:bg-harvest-green-dark hover:text-white"
        >
          Continue setup
        </Link>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-harvest-brown">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span aria-hidden>{item.done ? "✅" : "○"}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}