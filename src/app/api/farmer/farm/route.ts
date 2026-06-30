import { NextResponse } from "next/server";
import { getSessionUser, setSessionCookie, toPublicUser } from "@/lib/auth";
import { createFarmerFarm } from "@/lib/create-farmer-farm";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const farm = await prisma.farm.findFirst({
      where: { ownerId: sessionUser.id },
    });

    return NextResponse.json({ farm });
  } catch {
    return NextResponse.json({ error: "Failed to load farm." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { farmName, location } = (await request.json()) as {
      farmName?: string;
      location?: string;
    };

    if (!farmName?.trim() || !location?.trim()) {
      return NextResponse.json(
        { error: "Farm shop name and town/area are required." },
        { status: 400 }
      );
    }

    const farm = await createFarmerFarm({
      ownerId: sessionUser.id,
      name: farmName,
      location,
    });

    const updatedSession = {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name,
      role: sessionUser.role as UserRole,
      farmId: farm.id,
    };

    await setSessionCookie(updatedSession);

    return NextResponse.json({
      farm,
      user: toPublicUser(updatedSession),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create farm.";
    const status = message.includes("already has") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}