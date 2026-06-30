import { NextResponse } from "next/server";
import { getSessionUser, toPublicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  if (user.role === "farmer" && !user.farmId) {
    const farm = await prisma.farm.findFirst({
      where: { ownerId: user.id },
      select: { id: true },
    });
    if (farm) {
      return NextResponse.json({
        user: toPublicUser({ ...user, farmId: farm.id }),
      });
    }
  }

  return NextResponse.json({ user: toPublicUser(user) });
}