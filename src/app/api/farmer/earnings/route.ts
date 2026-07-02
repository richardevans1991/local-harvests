import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { deliveryFeeForFarm } from "@/lib/delivery-fee";
import {
  farmerShareFromLine,
  isEarningOrderStatus,
  isPayoutEligibleStatus,
  isPendingPayoutStatus,
} from "@/lib/farmer-earnings";
import { getCommissionRate, isTrialActive } from "@/lib/farmer-subscription";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const farm = await prisma.farm.findFirst({
      where: { ownerId: sessionUser.id },
      include: {
        owner: { select: { trialEndsAt: true } },
      },
    });

    if (!farm) {
      return NextResponse.json({ error: "No farm linked to your account." }, { status: 404 });
    }

    const trialEndsAt = farm.owner.trialEndsAt;
    const items = await prisma.orderItem.findMany({
      where: { farmId: farm.id },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            customerName: true,
            pickupDate: true,
            fulfillmentMethod: true,
            farmDeliveryFees: true,
            createdAt: true,
          },
        },
      },
      orderBy: { order: { createdAt: "desc" } },
    });

    const deliveryFeeByOrder = new Map<string, number>();

    const orderMap = new Map<
      string,
      {
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
    >();

    let availableForPayout = 0;
    let pendingPayout = 0;
    let totalSales = 0;
    let totalPlatformFees = 0;
    let paidOrderCount = 0;

    for (const item of items) {
      if (!deliveryFeeByOrder.has(item.order.id)) {
        const fee =
          item.order.fulfillmentMethod === "delivery"
            ? deliveryFeeForFarm(item.order.farmDeliveryFees, farm.id)
            : 0;
        deliveryFeeByOrder.set(item.order.id, fee);
      }

      const lineTotal = Math.round(item.price * item.quantity * 100) / 100;
      const { platformFee, farmerEarnings } = farmerShareFromLine(
        lineTotal,
        trialEndsAt,
        item.order.createdAt
      );

      const existing = orderMap.get(item.order.id);
      if (existing) {
        existing.salesTotal = Math.round((existing.salesTotal + lineTotal) * 100) / 100;
        existing.platformFee = Math.round((existing.platformFee + platformFee) * 100) / 100;
        existing.farmerEarnings =
          Math.round((existing.farmerEarnings + farmerEarnings) * 100) / 100;
        existing.itemCount += 1;
      } else {
        orderMap.set(item.order.id, {
          orderId: item.order.id,
          customerName: item.order.customerName,
          createdAt: item.order.createdAt.toISOString(),
          pickupDate: item.order.pickupDate,
          fulfillmentMethod: item.order.fulfillmentMethod,
          status: item.order.status,
          salesTotal: lineTotal,
          platformFee,
          farmerEarnings,
          itemCount: 1,
        });
      }

      if (isEarningOrderStatus(item.order.status)) {
        if (isPayoutEligibleStatus(item.order.status)) {
          availableForPayout =
            Math.round((availableForPayout + farmerEarnings) * 100) / 100;
        } else if (isPendingPayoutStatus(item.order.status)) {
          pendingPayout = Math.round((pendingPayout + farmerEarnings) * 100) / 100;
        }
        totalSales = Math.round((totalSales + lineTotal) * 100) / 100;
        totalPlatformFees = Math.round((totalPlatformFees + platformFee) * 100) / 100;
      }
    }

    for (const [orderId, orderSummary] of orderMap.entries()) {
      const deliveryEarnings = deliveryFeeByOrder.get(orderId) ?? 0;
      if (deliveryEarnings <= 0) continue;

      orderSummary.salesTotal =
        Math.round((orderSummary.salesTotal + deliveryEarnings) * 100) / 100;
      orderSummary.farmerEarnings =
        Math.round((orderSummary.farmerEarnings + deliveryEarnings) * 100) / 100;

      if (isEarningOrderStatus(orderSummary.status)) {
        if (isPayoutEligibleStatus(orderSummary.status)) {
          availableForPayout =
            Math.round((availableForPayout + deliveryEarnings) * 100) / 100;
        } else if (isPendingPayoutStatus(orderSummary.status)) {
          pendingPayout = Math.round((pendingPayout + deliveryEarnings) * 100) / 100;
        }
        totalSales = Math.round((totalSales + deliveryEarnings) * 100) / 100;
      }
    }

    const orders = Array.from(orderMap.values()).filter((order) =>
      isEarningOrderStatus(order.status)
    );
    paidOrderCount = orders.length;

    return NextResponse.json({
      summary: {
        availableForPayout,
        pendingPayout,
        totalOwed: availableForPayout,
        totalSales,
        platformFees: totalPlatformFees,
        paidOrderCount,
        commissionRate: getCommissionRate(trialEndsAt),
        onTrial: isTrialActive(trialEndsAt),
      },
      orders,
    });
  } catch (error) {
    console.error("Farmer earnings error:", error);
    return NextResponse.json({ error: "Failed to load earnings." }, { status: 500 });
  }
}