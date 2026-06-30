import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VISIBLE_STATUSES = new Set(["paid", "confirmed", "ready", "completed"]);

function mapOrder(order: {
  id: string;
  status: string;
  pickupDate: string;
  fulfillmentMethod: string;
  deliveryAddress: string | null;
  total: number;
  createdAt: Date;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    farmId: string;
  }[];
}) {
  return {
    orderId: order.id,
    status: order.status,
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
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; orderRef?: string };
    const email = body.email?.trim().toLowerCase();
    const orderRef = body.orderRef?.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (!email || !orderRef) {
      return NextResponse.json(
        { error: "Email and order reference are required." },
        { status: 400 }
      );
    }

    const orders = await prisma.order.findMany({
      where: {
        email,
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
      take: 50,
    });

    const matches = orders.filter((order) => {
      const shortRef = order.id.slice(-8).toUpperCase();
      return order.id.toUpperCase() === orderRef || shortRef === orderRef;
    });

    if (matches.length === 0) {
      return NextResponse.json(
        { error: "No order found for that email and reference." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      orders: matches.map(mapOrder),
    });
  } catch (error) {
    console.error("Guest order lookup error:", error);
    return NextResponse.json({ error: "Failed to look up order." }, { status: 500 });
  }
}