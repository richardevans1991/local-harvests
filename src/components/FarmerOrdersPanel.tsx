"use client";

import SafeImage from "@/components/SafeImage";
import { api } from "@/lib/api-client";
import {
  FARMER_ACTIONABLE_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
  nextStatusAction,
} from "@/lib/order-status";
import { useCallback, useEffect, useMemo, useState } from "react";

interface FarmerOrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface FarmerOrder {
  orderId: string;
  status: string;
  customerName: string;
  email: string;
  phone: string;
  pickupDate: string;
  fulfillmentMethod: string;
  deliveryAddress: string | null;
  notes: string | null;
  createdAt: string;
  farmSubtotal: number;
  items: FarmerOrderItem[];
}

function formatMoney(amount: number) {
  return `£${amount.toFixed(2)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "paid":
      return "bg-harvest-rust/15 text-harvest-rust";
    case "confirmed":
      return "bg-amber-100 text-amber-800";
    case "ready":
      return "bg-harvest-green/20 text-harvest-green-dark";
    case "completed":
      return "bg-harvest-tan/40 text-harvest-brown/70";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-harvest-tan/30 text-harvest-brown";
  }
}

export default function FarmerOrdersPanel() {
  const [orders, setOrders] = useState<FarmerOrder[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const loadOrders = useCallback(() => {
    return api.farmer.orders
      .list()
      .then(({ orders: o, activeCount: count }) => {
        setOrders(o);
        setActiveCount(count);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load orders.")
      );
  }, []);

  useEffect(() => {
    loadOrders().finally(() => setLoading(false));
  }, [loadOrders]);

  const activeOrders = useMemo(
    () =>
      orders.filter((o) =>
        FARMER_ACTIONABLE_STATUSES.includes(o.status as OrderStatus)
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => !FARMER_ACTIONABLE_STATUSES.includes(o.status as OrderStatus)),
    [orders]
  );

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    setError("");
    try {
      await api.farmer.orders.updateStatus(orderId, status);
      await loadOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="farm-panel mb-6 h-48 animate-pulse bg-harvest-tan/30" aria-hidden />
    );
  }

  return (
    <section className="farm-panel mb-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-harvest-green">Orders</h2>
          <p className="mt-1 text-sm text-harvest-brown/80">
            New customer orders from your shop. Update status as you prepare and fulfill them.
          </p>
        </div>
        {activeCount > 0 && (
          <span className="rounded-full bg-harvest-rust px-3 py-1 text-sm font-semibold text-white shadow-sm">
            {activeCount} active
          </span>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {activeOrders.length === 0 ? (
        <p className="mt-6 rounded-xl bg-harvest-cream/80 px-4 py-8 text-center text-sm text-harvest-brown/75">
          No active orders right now. When a customer pays, their order will appear here with
          contact details and what to prepare.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {activeOrders.map((order) => (
            <OrderCard
              key={order.orderId}
              order={order}
              updating={updatingId === order.orderId}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}

      {completedOrders.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="text-sm font-medium text-harvest-green hover:text-harvest-green-dark"
          >
            {showCompleted ? "Hide" : "Show"} completed orders ({completedOrders.length})
          </button>
          {showCompleted && (
            <div className="mt-4 space-y-4 opacity-90">
              {completedOrders.map((order) => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function OrderCard({
  order,
  updating = false,
  onStatusUpdate,
}: {
  order: FarmerOrder;
  updating?: boolean;
  onStatusUpdate?: (orderId: string, status: OrderStatus) => void;
}) {
  const status = order.status as OrderStatus;
  const action = nextStatusAction(status);
  const isDelivery = order.fulfillmentMethod === "delivery";
  const statusLabel = ORDER_STATUS_LABELS[status] ?? order.status;

  return (
    <article className="rounded-2xl border border-harvest-tan/50 bg-harvest-cream/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-serif text-lg font-semibold text-harvest-green">
              {order.customerName}
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeClass(order.status)}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-xs text-harvest-brown/60">
            Ordered {formatDate(order.createdAt)} · {formatMoney(order.farmSubtotal)} from your shop
          </p>
        </div>
        {action && onStatusUpdate && (
          <div className="text-right">
            <button
              type="button"
              disabled={updating}
              onClick={() => onStatusUpdate(order.orderId, action.next)}
              className="rounded-full bg-harvest-green px-4 py-2 text-sm font-medium text-harvest-brown transition hover:bg-harvest-green-dark hover:text-white disabled:opacity-60"
            >
              {updating ? "Updating…" : action.label}
            </button>
            {action.next === "ready" && (
              <p className="mt-1 text-xs text-harvest-brown/60">We&apos;ll email the customer</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-xl bg-white/80 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-harvest-brown/55">
            {isDelivery ? "Delivery" : "Pickup"}
          </p>
          <p className="mt-1 font-medium text-harvest-brown">{order.pickupDate}</p>
          {isDelivery && order.deliveryAddress && (
            <p className="mt-1 text-harvest-brown/80">{order.deliveryAddress}</p>
          )}
        </div>
        <div className="rounded-xl bg-white/80 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-harvest-brown/55">
            Contact
          </p>
          <p className="mt-1">
            <a href={`tel:${order.phone}`} className="font-medium text-harvest-green hover:underline">
              {order.phone}
            </a>
          </p>
          <p className="mt-1">
            <a
              href={`mailto:${order.email}`}
              className="text-harvest-brown/80 hover:text-harvest-green hover:underline"
            >
              {order.email}
            </a>
          </p>
        </div>
      </div>

      {order.notes && (
        <div className="mt-3 rounded-xl border border-harvest-wheat/60 bg-amber-50/60 px-4 py-3 text-sm text-harvest-brown">
          <span className="font-medium">Customer note:</span> {order.notes}
        </div>
      )}

      <ul className="mt-4 divide-y divide-harvest-tan/30 rounded-xl bg-white/80 px-4">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
              <SafeImage
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-harvest-brown">{item.name}</p>
              <p className="text-xs text-harvest-brown/65">
                {item.quantity} × {formatMoney(item.price)}
              </p>
            </div>
            <p className="font-medium text-harvest-brown">
              {formatMoney(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>
    </article>
  );
}