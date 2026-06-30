import { prisma } from "@/lib/prisma";

export async function getShowcaseFarm(): Promise<{ id: string; name: string } | null> {
  const envId = process.env.SHOWCASE_FARM_ID?.trim();
  if (envId) {
    const farm = await prisma.farm.findUnique({
      where: { id: envId },
      select: { id: true, name: true },
    });
    if (farm) return farm;
  }

  const farms = await prisma.farm.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return farms.find((farm) => /ringwood/i.test(farm.name)) ?? null;
}