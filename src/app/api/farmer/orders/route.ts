import { NextResponse } from "next/server";
import { requireFarmerFarm } from "@/lib/farmer-farm";
import { isFarmerVisibleStatus } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await requireFarmerFarm();
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { farm } = result;

    const items = await prisma.orderItem.findMany({
      where: { farmId: farm.id },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            customerName: true,
            email: true,
            phone: true,
            pickupDate: true,
            fulfillmentMethod: true,
            deliveryAddress: true,
            notes: true,
            createdAt: true,
          },
        },
      },
      orderBy: { order: { createdAt: "desc" } },
    });

    const orderMap = new Map<
      string,
      {
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
        items: {
          id: string;
          name: string;
          price: number;
          quantity: number;
          image: string;
        }[];
      }
    >();

    for (const item of items) {
      if (!isFarmerVisibleStatus(item.order.status)) continue;

      const lineTotal = Math.round(item.price * item.quantity * 100) / 100;
      const existing = orderMap.get(item.order.id);

      const lineItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      };

      if (existing) {
        existing.farmSubtotal = Math.round((existing.farmSubtotal + lineTotal) * 100) / 100;
        existing.items.push(lineItem);
      } else {
        orderMap.set(item.order.id, {
          orderId: item.order.id,
          status: item.order.status,
          customerName: item.order.customerName,
          email: item.order.email,
          phone: item.order.phone,
          pickupDate: item.order.pickupDate,
          fulfillmentMethod: item.order.fulfillmentMethod,
          deliveryAddress: item.order.deliveryAddress,
          notes: item.order.notes,
          createdAt: item.order.createdAt.toISOString(),
          farmSubtotal: lineTotal,
          items: [lineItem],
        });
      }
    }

    const orders = Array.from(orderMap.values());

    return NextResponse.json({
      orders,
      activeCount: orders.filter((o) =>
        ["paid", "confirmed", "ready"].includes(o.status)
      ).length,
    });
  } catch (error) {
    console.error("Farmer orders error:", error);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}