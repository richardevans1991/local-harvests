"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { formatMoney } from "@/lib/format-money";

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

export default function CustomerOrdersPanel() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.customer.orders
      .list()
      .then(({ orders: o }) => setOrders(o))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load orders.")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-40 animate-pulse rounded-2xl bg-harvest-tan/30" />;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-800">
        <p>{error}</p>
        <Link href="/login" className="mt-4 inline-block text-harvest-green hover:underline">
          Sign in
        </Link>
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
                Order #{order.orderId.slice(-8).toUpperCase()}
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