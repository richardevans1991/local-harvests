import { NextResponse } from "next/server";
import { ensureFarmCategories } from "@/lib/categories";
import { getFarmerOnboardingStatus } from "@/lib/farmer-onboarding";
import { requireFarmerFarm } from "@/lib/farmer-farm";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const result = await requireFarmerFarm();
    if ("error" in result) {
      return NextResponse.json(
        {
          onboarding: getFarmerOnboardingStatus(null, [], []),
        },
        { status: 200 }
      );
    }

    const { farm } = result;
    const [categories, products] = await Promise.all([
      ensureFarmCategories(farm.id),
      prisma.product.findMany({ where: { farmId: farm.id } }),
    ]);

    const fullFarm = await prisma.farm.findUnique({ where: { id: farm.id } });

    return NextResponse.json({
      onboarding: getFarmerOnboardingStatus(fullFarm, categories, products),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load onboarding status." }, { status: 500 });
  }
}