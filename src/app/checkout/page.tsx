"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { api } from "@/lib/api-client";
import { selectCartSubtotal, useCartStore } from "@/stores/cart-store";
import type { FulfillmentMethod } from "@/types";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const farmIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.farmId).filter(Boolean))),
    [items]
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [notes, setNotes] = useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [optionsError, setOptionsError] = useState("");
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [pickupAvailable, setPickupAvailable] = useState(true);
  const [deliveryAvailable, setDeliveryAvailable] = useState(false);
  const [blockingDeliveryFarms, setBlockingDeliveryFarms] = useState<string[]>([]);
  const cancelled = searchParams.get("cancelled");

  useEffect(() => {
    api.checkout.stripeEnabled().then(({ enabled }) => setStripeEnabled(enabled));
  }, []);

  useEffect(() => {
    if (!farmIds.length) {
      setOptionsLoading(false);
      return;
    }

    setOptionsLoading(true);
    setOptionsError("");
    api.checkout
      .fulfillmentOptions(farmIds)
      .then((options) => {
        setPickupAvailable(options.pickupAvailable);
        setDeliveryAvailable(options.deliveryAvailable);
        setBlockingDeliveryFarms(options.blockingDeliveryFarms);
        setFulfillmentMethod((current) => {
          if (current === "delivery" && options.deliveryAvailable) return "delivery";
          if (options.pickupAvailable) return "pickup";
          if (options.deliveryAvailable) return "delivery";
          return "pickup";
        });
      })
      .catch(() => {
        setOptionsError("Could not load fulfillment options. Pickup is assumed — refresh the page to retry.");
        setPickupAvailable(true);
        setDeliveryAvailable(false);
        setFulfillmentMethod("pickup");
      })
      .finally(() => setOptionsLoading(false));
  }, [farmIds]);

  if (items.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center bg-harvest-cream px-4">
        <div className="text-center">
          <p className="text-harvest-brown">Nothing to checkout.</p>
          <Link href="/" className="mt-4 inline-block text-harvest-green hover:underline">
            Browse farms
          </Link>
        </div>
      </main>
    );
  }

  const showMethodChoice = pickupAvailable && deliveryAvailable;
  const dateLabel =
    fulfillmentMethod === "delivery" ? "Preferred delivery date" : "Pickup date";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (fulfillmentMethod === "delivery" && !deliveryAddress.trim()) {
      setError("Please enter a delivery address.");
      return;
    }

    setLoading(true);

    try {
      const result = await api.checkout.createSession({
        items: items.map((item) => ({
          productId: item.productId,
          farmId: item.farmId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        customerName: name,
        email,
        phone,
        pickupDate,
        fulfillmentMethod,
        deliveryAddress: fulfillmentMethod === "delivery" ? deliveryAddress.trim() : undefined,
        notes,
      });

      if (result.mode === "stripe" && result.url) {
        window.location.href = result.url;
        return;
      }

      if (result.mode === "pickup" && result.orderId) {
        const { order } = await api.checkout.completePickup(result.orderId);
        clearCart();
        const params = new URLSearchParams({
          order_id: order.id,
          name: order.customerName,
          email: order.email,
          pickup: order.pickupDate,
          total: String(order.total),
          method: order.fulfillmentMethod,
        });
        if (order.deliveryAddress) {
          params.set("address", order.deliveryAddress);
        }
        window.location.href = `/checkout/success?${params.toString()}`;
        return;
      }

      setError("Checkout could not be completed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 bg-harvest-cream">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-serif text-3xl font-bold text-harvest-green">Checkout</h1>
        <p className="mt-1 text-harvest-brown">
          {deliveryAvailable && pickupAvailable
            ? "Choose click & collect or delivery for your order."
            : deliveryAvailable
              ? "Your order will be delivered by the farm."
              : "Complete your order for farm pickup."}
        </p>

        {cancelled && (
          <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Payment was cancelled. Your cart is still saved.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {(optionsLoading || pickupAvailable || deliveryAvailable || optionsError) && (
              <div className="rounded-2xl border border-harvest-tan/50 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-lg font-semibold text-harvest-green">
                  How you&apos;ll receive your order
                </h2>

                {optionsError && (
                  <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    {optionsError}
                  </p>
                )}

                {optionsLoading && (
                  <p className="mt-3 text-sm text-harvest-brown/70">Loading options…</p>
                )}

                {!optionsLoading && showMethodChoice ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MethodOption
                      selected={fulfillmentMethod === "pickup"}
                      onSelect={() => setFulfillmentMethod("pickup")}
                      title="Click & Collect"
                      description="Pick up at the farm shop"
                    />
                    <MethodOption
                      selected={fulfillmentMethod === "delivery"}
                      onSelect={() => setFulfillmentMethod("delivery")}
                      title="Delivery"
                      description="Delivered to your address"
                    />
                  </div>
                ) : !optionsLoading ? (
                  <p className="mt-3 text-sm text-harvest-brown">
                    {fulfillmentMethod === "delivery" ? (
                      <>
                        <span className="font-medium text-harvest-green">Delivery</span> — all farms
                        in your cart offer local delivery.
                      </>
                    ) : (
                      <>
                        <span className="font-medium text-harvest-green">Click &amp; Collect</span> —
                        pick up your order at the farm.
                      </>
                    )}
                  </p>
                ) : null}

                {!optionsLoading && !deliveryAvailable && blockingDeliveryFarms.length > 0 && (
                  <p className="mt-3 rounded-lg bg-harvest-parchment/60 px-3 py-2 text-xs text-harvest-brown/90">
                    Delivery isn&apos;t available because{" "}
                    {blockingDeliveryFarms.length === 1
                      ? `${blockingDeliveryFarms[0]} only offers click & collect`
                      : `${blockingDeliveryFarms.slice(0, -1).join(", ")} and ${blockingDeliveryFarms.at(-1)} only offer click & collect`}
                    . Remove those items to choose delivery.
                  </p>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-harvest-tan/50 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-harvest-green">
                Contact Details
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input label="Full name" value={name} onChange={setName} required />
                <Input label="Email" type="email" value={email} onChange={setEmail} required />
                <Input label="Phone" type="tel" value={phone} onChange={setPhone} required />
                <Input
                  label={dateLabel}
                  type="date"
                  value={pickupDate}
                  onChange={setPickupDate}
                  required
                />
              </div>
              {fulfillmentMethod === "delivery" && (
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-harvest-brown">
                    Delivery address
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Street, town, postcode..."
                    className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green"
                  />
                </div>
              )}
              <div className="mt-4">
                <label className="mb-1 block text-sm font-medium text-harvest-brown">
                  Order notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special requests for the farmer..."
                  className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-harvest-tan/50 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-semibold text-harvest-green">
                Items ({items.length})
              </h2>
              <ul className="mt-4 divide-y divide-harvest-tan/40">
                {items.map((item) => (
                  <li key={item.productId} className="flex justify-between py-3 text-sm">
                    <span className="text-harvest-brown">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-harvest-brown">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-harvest-tan/50 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-semibold text-harvest-green">Payment</h2>
            <p className="mt-2 text-sm text-harvest-brown/80">
              {stripeEnabled
                ? "Pay securely with Stripe. You'll be redirected to complete payment."
                : fulfillmentMethod === "delivery"
                  ? "Stripe is not configured — confirm your order and pay on delivery."
                  : "Stripe is not configured — confirm your order and pay at pickup."}
            </p>
            <div className="mt-4 flex justify-between border-t border-harvest-tan/40 pt-4 font-semibold text-harvest-brown">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || optionsLoading}
              className="mt-6 w-full rounded-full bg-harvest-green py-3 font-medium text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
            >
              {loading
                ? "Processing..."
                : stripeEnabled
                  ? "Pay with Stripe"
                  : fulfillmentMethod === "delivery"
                    ? "Confirm Order (Pay on Delivery)"
                    : "Confirm Order (Pay at Pickup)"}
            </button>
            <Link
              href="/cart"
              className="mt-3 block text-center text-sm text-harvest-brown hover:text-harvest-green"
            >
              ← Back to cart
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
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
        <CheckoutContent />
      </Suspense>
    </>
  );
}

function MethodOption({
  selected,
  onSelect,
  title,
  description,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-harvest-green bg-harvest-green/10 ring-2 ring-harvest-green/30"
          : "border-harvest-tan hover:border-harvest-green/50"
      }`}
    >
      <span className="block text-sm font-semibold text-harvest-green">{title}</span>
      <span className="mt-1 block text-xs text-harvest-brown/80">{description}</span>
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-harvest-brown">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
      />
    </div>
  );
}