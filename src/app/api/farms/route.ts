import { NextResponse } from "next/server";
import { attachDistanceMiles, lookupUkPostcode } from "@/lib/uk-geography";
import { prisma } from "@/lib/prisma";

function publicFarm(farm: {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  image: string;
  banner: string;
  location: string;
  postcode: string | null;
  latitude: number | null;
  longitude: number | null;
  distance: number;
  ownerId: string;
  offersPickup: boolean;
  offersDelivery: boolean;
  shopOpen: boolean;
  deliveryNotes: string | null;
  distanceMiles?: number | null;
}) {
  const { latitude: _lat, longitude: _lng, ...rest } = farm;
  return rest;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postcodeQuery = searchParams.get("postcode")?.trim() ?? "";

    const farms = await prisma.farm.findMany({ orderBy: { name: "asc" } });

    if (!postcodeQuery) {
      return NextResponse.json({
        farms: farms.map((farm) => publicFarm({ ...farm, distanceMiles: null })),
      });
    }

    const origin = await lookupUkPostcode(postcodeQuery);
    if (!origin) {
      return NextResponse.json(
        { error: "Enter a valid UK postcode (e.g. BH24 1PA)." },
        { status: 400 }
      );
    }

    const withDistance = attachDistanceMiles(farms, {
      latitude: origin.latitude,
      longitude: origin.longitude,
    });

    return NextResponse.json({
      farms: withDistance.map((farm) => publicFarm(farm)),
      search: {
        postcode: origin.postcode,
        area: origin.area,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load farms." }, { status: 500 });
  }
}