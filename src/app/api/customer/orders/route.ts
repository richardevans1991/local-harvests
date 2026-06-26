import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VISIBLE_STATUSES = new Set([
  "paid",
  "confirmed",
  "ready",
  "completed",
]);

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "customer") {
      return NextResponse.json({ error: "Sign in to view your orders." }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: [{ userId: sessionUser.id }, { email: sessionUser.email }],
        status: { in: Array.from(VISIBLE_STATUSES) },
      },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            quantity: true,
            price: true,
            farmId: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map((order) => ({
        orderId: order.id,
        status: order.status,
        customerName: order.customerName,
        pickupDate: order.pickupDate,
        fulfillmentMethod: order.fulfillmentMethod,
        deliveryAddress: order.deliveryAddress,
        total: order.total,
        createdAt: order.createdAt.toISOString(),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          farmId: item.farmId,
        })),
      })),
    });
  } catch (error) {
    console.error("Customer orders error:", error);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}