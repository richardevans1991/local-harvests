"use client";

import SafeImage from "@/components/SafeImage";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import Header from "@/components/Header";
import { formatMoney } from "@/lib/format-money";
import { selectCartSubtotal, useCartStore } from "@/stores/cart-store";
import { useMemo } from "react";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartStore(selectCartSubtotal);

  const farmCount = useMemo(
    () => new Set(items.map((item) => item.farmId).filter(Boolean)).size,
    [items]
  );

  return (
    <>
      <Header />
      <main className="flex-1 bg-harvest-cream">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <h1 className="font-serif text-3xl font-bold text-harvest-green">
            Your Cart
          </h1>

          {items.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-harvest-tan bg-white p-12 text-center">
              <p className="text-harvest-brown">Your cart is empty.</p>
              <Link
                href="/"
                className="mt-4 inline-block rounded-full bg-harvest-green px-6 py-2.5 text-sm font-medium text-harvest-brown hover:bg-harvest-green-dark hover:text-white"
              >
                Browse farms
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                {farmCount > 1 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Your cart includes items from {farmCount} farms. Checkout uses one
                    pickup or delivery date for the whole order — consider ordering from
                    one farm at a time for simpler collection.
                  </div>
                )}

                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-4 rounded-2xl border border-harvest-tan/50 bg-white p-4 shadow-sm"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h3 className="font-medium text-harvest-green">{item.name}</h3>
                        <p className="text-sm text-harvest-brown">
                          {formatMoney(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-full border border-harvest-tan">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="px-3 py-1 text-harvest-brown hover:text-harvest-green"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            className="px-3 py-1 text-harvest-brown hover:text-harvest-green"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="font-semibold text-harvest-brown">
                      {formatMoney(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="h-fit rounded-2xl border border-harvest-tan/50 bg-white p-6 shadow-sm">
                <h2 className="font-serif text-xl font-semibold text-harvest-green">
                  Order Summary
                </h2>
                <div className="mt-4 space-y-2 text-sm text-harvest-brown">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatMoney(total)}</span>
                  </div>
                  <div className="flex justify-between text-harvest-brown/70">
                    <span>Delivery fee</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between border-t border-harvest-tan/40 pt-4 font-semibold text-harvest-brown">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
                <Link
                  href="/checkout"
                  className="mt-6 block w-full rounded-full bg-harvest-green py-3 text-center font-medium text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}