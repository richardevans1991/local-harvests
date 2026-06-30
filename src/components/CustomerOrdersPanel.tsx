"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { displayOrderRef } from "@/lib/order-ref";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/format-money";
import { useAuthStore } from "@/stores/auth-store";

interface CustomerOrder {
  orderId: string;
  status: string;
  pickupDate: string;
  fulfillmentMethod: string;
  deliveryAddress: string | null;
  total: number;
  createdAt: string;
  itemCount: number;
  items: { id: string; name: string; quantity: number; price: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  paid: "Confirmed",
  confirmed: "Preparing",
  ready: "Ready",
  completed: "Completed",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OrderList({ orders }: { orders: CustomerOrder[] }) {
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <article
          key={order.orderId}
          className="rounded-2xl border border-harvest-tan/50 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-harvest-brown/60">
                Order {displayOrderRef(order.orderId)}
              </p>
              <p className="mt-1 font-serif text-lg font-semibold text-harvest-green">
                {formatMoney(order.total)}
              </p>
              <p className="mt-1 text-sm text-harvest-brown/80">
                Placed {formatDate(order.createdAt)} · {order.itemCount} item
                {order.itemCount !== 1 ? "s" : ""}
              </p>
            </div>
            <span className="rounded-full bg-harvest-green/15 px-3 py-1 text-xs font-semibold text-harvest-green-dark">
              {STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          <p className="mt-3 text-sm text-harvest-brown">
            {order.fulfillmentMethod === "delivery" ? "Delivery" : "Pickup"}:{" "}
            <strong>{order.pickupDate}</strong>
            {order.deliveryAddress && ` — ${order.deliveryAddress}`}
          </p>

          <ul className="mt-3 divide-y divide-harvest-tan/30 text-sm text-harvest-brown">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatMoney(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

export default function CustomerOrdersPanel() {
  const searchParams = useSearchParams();
  const initialized = useAuthStore((s) => s.initialized);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestRef, setGuestRef] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const prefilledLookup = useRef(false);

  useEffect(() => {
    if (!initialized) return;

    if (!currentUser || currentUser.role !== "customer") {
      setLoading(false);
      return;
    }

    api.customer.orders
      .list()
      .then(({ orders: o }) => setOrders(o))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load orders.")
      )
      .finally(() => setLoading(false));
  }, [initialized, currentUser]);

  useEffect(() => {
    if (!initialized || prefilledLookup.current) return;
    if (currentUser?.role === "customer") return;

    const email = searchParams.get("email")?.trim() ?? "";
    const ref = searchParams.get("ref")?.trim().toUpperCase().replace(/[^A-Z0-9]/g, "") ?? "";
    if (!email || !ref) return;

    prefilledLookup.current = true;
    setGuestEmail(email);
    setGuestRef(ref);
    setGuestMode(true);
    setGuestLoading(true);
    setError("");

    api.customer.orders
      .lookup(email, ref)
      .then(({ orders: found }) => setOrders(found))
      .catch((err) => {
        setOrders([]);
        setError(err instanceof Error ? err.message : "Failed to look up order.");
      })
      .finally(() => setGuestLoading(false));
  }, [initialized, currentUser, searchParams]);

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestLoading(true);
    setError("");
    setGuestMode(true);
    try {
      const { orders: found } = await api.customer.orders.lookup(guestEmail, guestRef);
      setOrders(found);
    } catch (err) {
      setOrders([]);
      setError(err instanceof Error ? err.message : "Failed to look up order.");
    } finally {
      setGuestLoading(false);
    }
  };

  if (!initialized || loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-harvest-tan/30" />;
  }

  if (currentUser?.role === "customer" && !guestMode) {
    if (error) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p>{error}</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-harvest-tan bg-white p-12 text-center">
          <p className="text-harvest-brown">You haven&apos;t placed any orders yet.</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-full bg-harvest-green px-6 py-2.5 text-sm font-medium text-harvest-brown hover:bg-harvest-green-dark hover:text-white"
          >
            Browse farm shops
          </Link>
        </div>
      );
    }

    return <OrderList orders={orders} />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-harvest-tan/50 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-lg font-semibold text-harvest-green">
          Look up an order without signing in
        </h2>
        <p className="mt-2 text-sm text-harvest-brown/80">
          Use the email from checkout and the order reference from your confirmation (e.g.{" "}
          <strong>#AB12CD34</strong>).
        </p>
        <form onSubmit={handleGuestLookup} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-harvest-brown">Email</label>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-harvest-brown">
              Order reference
            </label>
            <input
              type="text"
              required
              value={guestRef}
              onChange={(e) => setGuestRef(e.target.value)}
              placeholder="e.g. AB12CD34"
              className="w-full rounded-lg border border-harvest-tan px-4 py-2.5 uppercase outline-none focus:border-harvest-green focus:ring-2 focus:ring-harvest-green/20"
            />
          </div>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}
          <button
            type="submit"
            disabled={guestLoading}
            className="rounded-full bg-harvest-green px-6 py-2.5 text-sm font-medium text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
          >
            {guestLoading ? "Looking up..." : "Find my order"}
          </button>
        </form>
        <p className="mt-4 text-sm text-harvest-brown/75">
          Have an account?{" "}
          <Link href="/login" className="font-medium text-harvest-green hover:underline">
            Sign in
          </Link>{" "}
          for faster access.
        </p>
      </div>

      {orders.length > 0 && <OrderList orders={orders} />}
    </div>
  );
}