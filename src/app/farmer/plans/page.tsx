import { Suspense } from "react";
import FarmerPlans from "@/components/FarmerPlans";
import Header from "@/components/Header";

export default function FarmerPlansPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <Suspense
          fallback={
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
              <div className="h-64 animate-pulse rounded-2xl bg-harvest-tan/40" />
            </div>
          }
        >
          <FarmerPlans />
        </Suspense>
      </main>
    </>
  );
}