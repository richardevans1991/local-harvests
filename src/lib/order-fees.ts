import {
  buildFarmDeliveryFees,
  sumDeliveryFees,
  type FarmDeliveryFeeLine,
} from "@/lib/delivery-fee";
import { getCommissionRate } from "@/lib/farmer-subscription";
import { prisma } from "@/lib/prisma";
import type { FulfillmentMethod } from "@/types";

interface CheckoutLineItem {
  farmId: string;
  price: number;
  quantity: number;
}

export async function calculateCheckoutFees(items: CheckoutLineItem[]) {
  const farmIds = Array.from(new Set(items.map((item) => item.farmId)));
  const farms = await prisma.farm.findMany({
    where: { id: { in: farmIds } },
    select: {
      id: true,
      owner: {
        select: { trialEndsAt: true },
      },
    },
  });

  const rateByFarm = new Map(
    farms.map((farm) => [farm.id, getCommissionRate(farm.owner.trialEndsAt)])
  );

  let subtotal = 0;
  let platformFee = 0;

  for (const item of items) {
    const lineTotal = item.price * item.quantity;
    subtotal += lineTotal;
    const rate = rateByFarm.get(item.farmId) ?? 0;
    platformFee += lineTotal * rate;
  }

  subtotal = Math.round(subtotal * 100) / 100;
  platformFee = Math.round(platformFee * 100) / 100;
  const farmerTotal = Math.round((subtotal - platformFee) * 100) / 100;

  return { subtotal, platformFee, farmerTotal };
}

export async function calculateCheckoutTotals(
  items: CheckoutLineItem[],
  fulfillmentMethod: FulfillmentMethod
) {
  const { subtotal, platformFee, farmerTotal: productFarmerTotal } =
    await calculateCheckoutFees(items);

  const farmIds = Array.from(new Set(items.map((item) => item.farmId)));
  const farms = await prisma.farm.findMany({
    where: { id: { in: farmIds } },
    select: { id: true, name: true, deliveryFee: true },
  });

  const farmDeliveryFees = buildFarmDeliveryFees(farms, fulfillmentMethod);
  const deliveryFee = sumDeliveryFees(farmDeliveryFees);
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;
  const farmerTotal = Math.round((productFarmerTotal + deliveryFee) * 100) / 100;

  return {
    subtotal,
    deliveryFee,
    farmDeliveryFees,
    platformFee,
    farmerTotal,
    total,
  };
}

export function serializeFarmDeliveryFees(lines: FarmDeliveryFeeLine[]): string | null {
  if (!lines.length) return null;
  return JSON.stringify(lines);
}