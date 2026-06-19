import { prisma } from "@/lib/prisma";

export async function ensureFarmCategories(farmId: string) {
  const existing = await prisma.farmCategory.findMany({
    where: { farmId },
    orderBy: { name: "asc" },
  });

  if (existing.length > 0) {
    return existing;
  }

  const products = await prisma.product.findMany({
    where: { farmId },
    select: { category: true },
  });

  const uniqueNames = Array.from(new Set(products.map((p) => p.category))).sort();
  if (uniqueNames.length === 0) {
    return existing;
  }

  for (const name of uniqueNames) {
    await prisma.farmCategory.upsert({
      where: { farmId_name: { farmId, name } },
      create: { farmId, name },
      update: {},
    });
  }

  return prisma.farmCategory.findMany({
    where: { farmId },
    orderBy: { name: "asc" },
  });
}

export async function validateFarmCategory(farmId: string, categoryName: string) {
  const trimmed = categoryName?.trim();
  if (!trimmed) {
    return "Choose a category.";
  }

  await ensureFarmCategories(farmId);

  const match = await prisma.farmCategory.findUnique({
    where: { farmId_name: { farmId, name: trimmed } },
  });

  if (!match) {
    return `Add "${trimmed}" as a shop category before using it on a product.`;
  }

  return null;
}