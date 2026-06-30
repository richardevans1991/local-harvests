import { NextResponse } from "next/server";
import {
  DEMO_FARMER_EMAILS,
  DEMO_FARMER_USER_IDS,
  DEMO_FARM_IDS,
} from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";

function authorize(request: Request) {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) {
    return "ADMIN_SECRET is not configured on the server.";
  }

  const header = request.headers.get("x-admin-secret");
  if (header !== secret) {
    return "Unauthorized.";
  }

  return null;
}

export async function GET(request: Request) {
  const authError = authorize(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: authError === "Unauthorized." ? 401 : 503 });
  }

  const farms = await prisma.farm.findMany({
    select: { id: true, name: true, location: true, ownerId: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    farms: farms.map((farm) => ({
      ...farm,
      isSeededDemo: DEMO_FARM_IDS.includes(farm.id),
    })),
    demoFarmIds: DEMO_FARM_IDS,
  });
}

export async function POST(request: Request) {
  const authError = authorize(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: authError === "Unauthorized." ? 401 : 503 });
  }

  try {
    const demoFarms = await prisma.farm.findMany({
      where: { id: { in: DEMO_FARM_IDS } },
      select: { id: true, name: true },
    });

    const realFarms = await prisma.farm.findMany({
      where: { id: { notIn: DEMO_FARM_IDS } },
      select: { id: true, name: true },
    });

    if (demoFarms.length > 0) {
      await prisma.orderItem.deleteMany({ where: { farmId: { in: DEMO_FARM_IDS } } });
      await prisma.product.deleteMany({ where: { farmId: { in: DEMO_FARM_IDS } } });
      await prisma.farmCategory.deleteMany({ where: { farmId: { in: DEMO_FARM_IDS } } });
      await prisma.farm.deleteMany({ where: { id: { in: DEMO_FARM_IDS } } });
    }

    const demoUsers = await prisma.user.findMany({
      where: {
        OR: [{ id: { in: DEMO_FARMER_USER_IDS } }, { email: { in: DEMO_FARMER_EMAILS } }],
      },
      select: { id: true, email: true },
    });

    if (demoUsers.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: demoUsers.map((user) => user.id) } },
      });
    }

    return NextResponse.json({
      untouchedFarms: realFarms,
      removedFarms: demoFarms,
      removedUsers: demoUsers.map((user) => user.email),
      message:
        demoFarms.length > 0
          ? "Removed seeded demo farms only. Your real farms were not touched."
          : "No seeded demo farms were in the database.",
    });
  } catch (error) {
    console.error("remove-demo-farms error:", error);
    return NextResponse.json({ error: "Cleanup failed." }, { status: 500 });
  }
}