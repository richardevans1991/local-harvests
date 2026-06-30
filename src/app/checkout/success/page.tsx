"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Header from "@/components/Header";
import SiteFooter from "@/components/SiteFooter";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/format-money";
import { displayOrderRef } from "@/lib/order-ref";
import { useCartStore } from "@/stores/cart-store";
import type { FulfillmentMethod } from "@/types";

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{
    id: string;
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
        .then(({ order: verified }) => {
          setOrder({
            id: verified.id,
            customerName: verified.customerName,
            email: verified.email,
            pickupDate: verified.pickupDate,
            fulfillmentMethod: verified.fulfillmentMethod,
            deliveryAddress: verified.deliveryAddress,
            total: verified.total,
          });
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
        id: orderId,
        customerName: searchParams.get("name") ?? "friend",
        email: searchParams.get("email") ?? "",
        pickupDate: searchParams.get("pickup") ?? "",
        fulfillmentMethod: (searchParams.get("method") as FulfillmentMethod) ?? "pickup",
        deliveryAddress: searchParams.get("address"),
        total: Number(searchParams.get("total") ?? 0),
      });
      clearCart();
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

  const trackOrderHref =
    order?.email && order.id
      ? `/orders?email=${encodeURIComponent(order.email)}&ref=${displayOrderRef(order.id).slice(1)}`
      : "/orders";

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

          <div className="mt-6 rounded-xl border border-harvest-green/25 bg-harvest-green/5 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-harvest-brown/70">
              Your order reference
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-harvest-green-dark">
              {displayOrderRef(order.id)}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-harvest-brown/75">
              Save this reference to look up your order later without signing in.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={trackOrderHref}
              className="rounded-full bg-harvest-green px-6 py-2.5 text-sm font-medium text-harvest-brown hover:bg-harvest-green-dark hover:text-white"
            >
              Track your order
            </Link>
            <button
              onClick={() => router.push("/")}
              className="rounded-full border border-harvest-green px-6 py-2.5 text-sm font-medium text-harvest-green hover:bg-harvest-green hover:text-white"
            >
              Back to marketplace
            </button>
          </div>
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