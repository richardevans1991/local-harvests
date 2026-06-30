"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

interface FarmerEarningsSummary {
  availableForPayout: number;
  pendingPayout: number;
  totalSales: number;
  platformFees: number;
  paidOrderCount: number;
  commissionRate: number;
  onTrial: boolean;
}

interface FarmerEarningOrder {
  orderId: string;
  customerName: string;
  createdAt: string;
  pickupDate: string;
  fulfillmentMethod: string;
  status: string;
  salesTotal: number;
  platformFee: number;
  farmerEarnings: number;
  itemCount: number;
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

export default function FarmerEarningsPanel() {
  const [summary, setSummary] = useState<FarmerEarningsSummary | null>(null);
  const [orders, setOrders] = useState<FarmerEarningOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.farmer.earnings
      .get()
      .then(({ summary: s, orders: o }) => {
        setSummary(s);
        setOrders(o);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load earnings.")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="farm-panel mb-6 h-36 animate-pulse bg-harvest-tan/30" aria-hidden />
    );
  }

  if (error) {
    return (
      <div className="farm-panel mb-6 border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  if (!summary) return null;

  const commissionPercent = Math.round(summary.commissionRate * 100);

  return (
    <section className="farm-panel mb-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-harvest-green">Your earnings</h2>
          <p className="mt-1 text-sm text-harvest-brown/80">
            {summary.onTrial
              ? "You’re on a free trial — no commission on orders yet."
              : `Local Harvest keeps ${commissionPercent}% to run the marketplace. You receive the rest.`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-harvest-brown/70">Available for payout</p>
          <p className="font-serif text-3xl font-bold text-harvest-green">
            {formatMoney(summary.availableForPayout)}
          </p>
          {summary.pendingPayout > 0 && (
            <p className="mt-1 text-xs text-harvest-brown/65">
              {formatMoney(summary.pendingPayout)} pending fulfilment
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-harvest-cream/80 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-harvest-brown/60">
            Sales from your shop
          </p>
          <p className="mt-1 text-lg font-semibold text-harvest-brown">
            {formatMoney(summary.totalSales)}
          </p>
        </div>
        <div className="rounded-xl bg-harvest-cream/80 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-harvest-brown/60">
            Marketplace fee
          </p>
          <p className="mt-1 text-lg font-semibold text-harvest-brown">
            {formatMoney(summary.platformFees)}
          </p>
        </div>
        <div className="rounded-xl bg-harvest-cream/80 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-harvest-brown/60">
            Paid orders
          </p>
          <p className="mt-1 text-lg font-semibold text-harvest-brown">
            {summary.paidOrderCount}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-harvest-brown/65">
        Payouts are sent weekly by bank transfer for orders marked <strong>Completed</strong>, after
        a short processing window. Sales still being prepared or awaiting pickup/delivery show as
        pending fulfilment until you mark them complete.
      </p>

      {orders.length > 0 ? (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-harvest-tan/50 text-harvest-brown/70">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Customer</th>
                <th className="pb-2 pr-4 font-medium">Fulfillment</th>
                <th className="pb-2 pr-4 font-medium text-right">Sales</th>
                <th className="pb-2 font-medium text-right">You receive</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 10).map((order) => (
                <tr key={order.orderId} className="border-b border-harvest-tan/30">
                  <td className="py-3 pr-4 text-harvest-brown">{formatDate(order.createdAt)}</td>
                  <td className="py-3 pr-4 text-harvest-brown">{order.customerName}</td>
                  <td className="py-3 pr-4 capitalize text-harvest-brown/80">
                    {order.fulfillmentMethod}
                  </td>
                  <td className="py-3 pr-4 text-right text-harvest-brown">
                    {formatMoney(order.salesTotal)}
                  </td>
                  <td className="py-3 text-right font-medium text-harvest-green">
                    {formatMoney(order.farmerEarnings)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length > 10 && (
            <p className="mt-2 text-xs text-harvest-brown/60">
              Showing latest 10 of {orders.length} orders.
            </p>
          )}
        </div>
      ) : (
        <p className="mt-6 rounded-xl bg-harvest-cream/80 px-4 py-6 text-center text-sm text-harvest-brown/75">
          No paid orders yet. When customers buy from your shop, your share will appear here.
        </p>
      )}
    </section>
  );
}