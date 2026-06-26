"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/format-money";
import { useCartStore } from "@/stores/cart-store";
import type { FulfillmentMethod } from "@/types";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{
    customerName: string;
    email: string;
    pickupDate: string;
    fulfillmentMethod: FulfillmentMethod;
    deliveryAddress?: string | null;
    total: number;
  } | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const orderId = searchParams.get("order_id");

    if (sessionId) {
      api.checkout
        .verify(sessionId)
        .then(({ order }) => {
          setOrder(order);
          clearCart();
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Verification failed.")
        )
        .finally(() => setLoading(false));
      return;
    }

    if (orderId) {
      setOrder({
        customerName: searchParams.get("name") ?? "friend",
        email: searchParams.get("email") ?? "",
        pickupDate: searchParams.get("pickup") ?? "",
        fulfillmentMethod: (searchParams.get("method") as FulfillmentMethod) ?? "pickup",
        deliveryAddress: searchParams.get("address"),
        total: Number(searchParams.get("total") ?? 0),
      });
      setLoading(false);
      return;
    }

    setError("No order information found.");
    setLoading(false);
  }, [searchParams, clearCart]);

  const fulfillmentText =
    order?.fulfillmentMethod === "delivery"
      ? `delivery on ${order.pickupDate}${order.deliveryAddress ? ` to ${order.deliveryAddress}` : ""}`
      : `pickup on ${order?.pickupDate}`;

  return (
    <main className="flex flex-1 items-center justify-center bg-harvest-cream px-4 py-16">
      {loading ? (
        <div className="h-32 w-full max-w-md animate-pulse rounded-2xl bg-harvest-tan/40" />
      ) : error ? (
        <div className="max-w-md rounded-2xl border border-harvest-tan/50 bg-white p-10 text-center shadow-sm">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-full bg-harvest-green px-6 py-2.5 text-sm font-medium text-harvest-brown"
          >
            Back to marketplace
          </button>
        </div>
      ) : order ? (
        <div className="max-w-md rounded-2xl border border-harvest-tan/50 bg-white p-10 text-center shadow-sm">
          <span className="text-5xl" aria-hidden>
            ✅
          </span>
          <h1 className="mt-4 font-serif text-2xl font-bold text-harvest-green">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-harvest-brown">
            Thank you, {order.customerName}! Your order totaling {formatMoney(order.total)} is
            confirmed for {fulfillmentText}.
            {order.email && (
              <>
                {" "}
                We&apos;ll send a confirmation to {order.email}.
              </>
            )}
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-6 rounded-full bg-harvest-green px-6 py-2.5 text-sm font-medium text-harvest-brown hover:bg-harvest-green-dark hover:text-white"
          >
            Back to marketplace
          </button>
        </div>
      ) : null}
    </main>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <main className="flex flex-1 items-center justify-center bg-harvest-cream px-4 py-16">
            <div className="h-32 w-full max-w-md animate-pulse rounded-2xl bg-harvest-tan/40" />
          </main>
        }
      >
        <SuccessContent />
      </Suspense>
      <SiteFooter />
    </>
  );
}