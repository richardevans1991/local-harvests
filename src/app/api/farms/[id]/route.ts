import { NextResponse } from "next/server";
import { ensureFarmCategories } from "@/lib/categories";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeDeliveryFee } from "@/lib/delivery-fee";
import { resolveFarmCoordinates } from "@/lib/uk-geography";

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

    const nextLocation = typeof body.location === "string" ? body.location : farm.location;
    const nextPostcode =
      typeof body.postcode === "string" ? body.postcode : (farm.postcode ?? "");
    const locationChanged = nextLocation.trim() !== farm.location;
    const postcodeChanged =
      nextPostcode.trim().toUpperCase() !== (farm.postcode ?? "").toUpperCase();

    const coordinates =
      locationChanged || postcodeChanged
        ? await resolveFarmCoordinates(nextPostcode, nextLocation)
        : {
            postcode: farm.postcode,
            latitude: farm.latitude,
            longitude: farm.longitude,
          };

    const nextDeliveryFee = nextDelivery
      ? normalizeDeliveryFee(body.deliveryFee ?? farm.deliveryFee)
      : 0;

    const updated = await prisma.farm.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        shortDescription: body.shortDescription,
        image: body.image,
        banner: body.banner,
        location: nextLocation,
        postcode: coordinates.postcode,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        distance: body.distance,
        offersPickup: body.offersPickup,
        offersDelivery: body.offersDelivery,
        deliveryFee: nextDeliveryFee,
        shopOpen: body.shopOpen,
        deliveryNotes: body.deliveryNotes,
      },
    });

    return NextResponse.json({ farm: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update farm." }, { status: 500 });
  }
}