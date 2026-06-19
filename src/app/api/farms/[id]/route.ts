import { NextResponse } from "next/server";
import { ensureFarmCategories } from "@/lib/categories";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const farm = await prisma.farm.findUnique({ where: { id } });
    if (!farm) {
      return NextResponse.json({ error: "Farm not found." }, { status: 404 });
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { farmId: id },
        orderBy: { name: "asc" },
      }),
      ensureFarmCategories(id),
    ]);

    return NextResponse.json({ farm, products, categories });
  } catch {
    return NextResponse.json({ error: "Failed to load farm." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const farm = await prisma.farm.findUnique({ where: { id } });
    if (!farm || farm.ownerId !== user.id) {
      return NextResponse.json({ error: "Farm not found." }, { status: 404 });
    }

    const body = await request.json();

    const nextPickup = body.offersPickup ?? farm.offersPickup;
    const nextDelivery = body.offersDelivery ?? farm.offersDelivery;
    if (!nextPickup && !nextDelivery) {
      return NextResponse.json(
        { error: "Enable at least one fulfillment option: Click & Collect or Delivery." },
        { status: 400 }
      );
    }

    const updated = await prisma.farm.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription,
        image: body.image,
        banner: body.banner,
        location: body.location,
        distance: body.distance,
        offersPickup: body.offersPickup,
        offersDelivery: body.offersDelivery,
        deliveryNotes: body.deliveryNotes,
      },
    });

    return NextResponse.json({ farm: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update farm." }, { status: 500 });
  }
}