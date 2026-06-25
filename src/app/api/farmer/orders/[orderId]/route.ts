import { NextResponse } from "next/server";
import { requireFarmerFarm } from "@/lib/farmer-farm";
import {
  canTransitionStatus,
  type OrderStatus,
} from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const result = await requireFarmerFarm();
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { farm } = result;
    const body = (await request.json()) as { status?: string };
    const nextStatus = body.status as OrderStatus | undefined;

    if (!nextStatus) {
      return NextResponse.json({ error: "Status is required." }, { status: 400 });
    }

    const farmerItem = await prisma.orderItem.findFirst({
      where: { orderId, farmId: farm.id },
      include: {
        order: { select: { id: true, status: true } },
      },
    });

    if (!farmerItem) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const currentStatus = farmerItem.order.status as OrderStatus;
    if (!canTransitionStatus(currentStatus, nextStatus)) {
      return NextResponse.json(
        { error: `Cannot change status from ${currentStatus} to ${nextStatus}.` },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: nextStatus },
      select: {
        id: true,
        status: true,
        customerName: true,
        pickupDate: true,
        fulfillmentMethod: true,
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Farmer order update error:", error);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}