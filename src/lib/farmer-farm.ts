import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireFarmerFarm() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "farmer") {
    return { error: "Unauthorized." as const, status: 401 as const };
  }

  const farm = await prisma.farm.findFirst({
    where: { ownerId: sessionUser.id },
    select: { id: true, name: true },
  });

  if (!farm) {
    return { error: "No farm linked to your account." as const, status: 404 as const };
  }

  return { farm, sessionUser };
}