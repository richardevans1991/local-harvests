"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "@/components/Header";
import { api } from "@/lib/api-client";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setReady(true);
      return;
    }

    api.farmer.subscription
      .verify(sessionId)
      .then(() => setReady(true))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Verification failed.");
        setReady(true);
      });
  }, [sessionId]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <div className="farm-panel p-8">
        <p className="text-4xl">✓</p>
        <h1 className="mt-4 font-serif text-2xl font-bold text-harvest-green">
          Billing set up
        </h1>
        <p className="mt-3 text-harvest-brown/85">
          {!ready
            ? "Confirming your subscription..."
            : error
              ? error
              : "Your subscription is active. You can manage your shop from the dashboard."}
        </p>
        <Link
          href="/farmer/dashboard"
          className="mt-6 inline-block rounded-full bg-harvest-green px-6 py-3 text-sm font-semibold text-harvest-brown"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

export default function FarmerPlansSuccessPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <Suspense fallback={<div className="py-16 text-center text-harvest-brown">Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
    </>
  );
}