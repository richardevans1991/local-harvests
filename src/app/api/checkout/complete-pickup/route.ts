import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { orderId } = (await request.json()) as { orderId: string };
    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID." }, { status: 400 });
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: "confirmed" },
    });

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