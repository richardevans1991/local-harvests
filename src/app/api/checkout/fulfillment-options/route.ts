import { NextResponse } from "next/server";
import { getFulfillmentOptions } from "@/lib/fulfillment";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { farmIds } = (await request.json()) as { farmIds: string[] };

    if (!farmIds?.length) {
      return NextResponse.json({
        pickupAvailable: false,
        deliveryAvailable: false,
        blockingDeliveryFarms: [],
        farms: [],
      });
    }

    const uniqueIds = Array.from(new Set(farmIds));
    const farms = await prisma.farm.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        name: true,
        offersPickup: true,
        offersDelivery: true,
        deliveryNotes: true,
      },
    });

    return NextResponse.json(getFulfillmentOptions(farms));
  } catch {
    return NextResponse.json(
      { error: "Failed to load fulfillment options." },
      { status: 500 }
    );
  }
}