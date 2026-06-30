import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_FARMERS, SAMPLE_FARMS } from "@/lib/sample-data";

const KEEP_NAME_MATCH = "ringwood";

function isKeptFarm(name: string) {
  return name.toLowerCase().includes(KEEP_NAME_MATCH);
}

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

export async function POST(request: Request) {
  const authError = authorize(request);
  if (authError) {
    return NextResponse.json({ error: authError }, { status: authError === "Unauthorized." ? 401 : 503 });
  }

  try {
    const farms = await prisma.farm.findMany({
      select: { id: true, name: true, ownerId: true },
    });

    const kept = farms.filter((farm) => isKeptFarm(farm.name));
    const removing = farms.filter((farm) => !isKeptFarm(farm.name));

    if (kept.length === 0) {
      return NextResponse.json(
        {
          error: `No farm matching "${KEEP_NAME_MATCH}" found. Nothing was deleted.`,
        },
        { status: 400 }
      );
    }

    const removeIds = removing.map((farm) => farm.id);
    const keptOwnerIds = new Set(kept.map((farm) => farm.ownerId));
    const demoUserIds = DEMO_FARMERS.map((user) => user.id);

    if (removeIds.length > 0) {
      await prisma.orderItem.deleteMany({ where: { farmId: { in: removeIds } } });
      await prisma.product.deleteMany({ where: { farmId: { in: removeIds } } });
      await prisma.farmCategory.deleteMany({ where: { farmId: { in: removeIds } } });
      await prisma.farm.deleteMany({ where: { id: { in: removeIds } } });
    }

    const usersToDelete = await prisma.user.findMany({
      where: {
        role: "farmer",
        id: { notIn: Array.from(keptOwnerIds) },
        OR: [{ id: { in: demoUserIds } }, { farm: null }],
      },
      select: { id: true, email: true },
    });

    if (usersToDelete.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: usersToDelete.map((user) => user.id) } },
      });
    }

    return NextResponse.json({
      kept: kept.map((farm) => ({ id: farm.id, name: farm.name })),
      removedFarms: removing.map((farm) => ({ id: farm.id, name: farm.name })),
      removedUsers: usersToDelete.map((user) => user.email),
      seededDemoIds: SAMPLE_FARMS.map((farm) => farm.id),
    });
  } catch (error) {
    console.error("remove-demo-farms error:", error);
    return NextResponse.json({ error: "Cleanup failed." }, { status: 500 });
  }
}