import { NextResponse } from "next/server";
import { notifyOrderParties } from "@/lib/order-notifications";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { orderId } = (await request.json()) as { orderId: string };
    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID." }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "confirmed" },
    });

    if (existing.status === "pending") {
      void notifyOrderParties(orderId).catch((err) =>
        console.error("Order notification failed:", err)
      );
    }

    return NextResponse.json({
      order: {
        id: order.id,
        customerName: order.customerName,
        email: order.email,
        pickupDate: order.pickupDate,
        fulfillmentMethod: order.fulfillmentMethod as "pickup" | "delivery",
        deliveryAddress: order.deliveryAddress,
        total: order.total,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to complete order." }, { status: 500 });
  }
}