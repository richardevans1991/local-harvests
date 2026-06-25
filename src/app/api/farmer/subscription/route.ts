import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getFarmerSubscriptionView } from "@/lib/farmer-subscription";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      },
    });

    return NextResponse.json({ subscription: getFarmerSubscriptionView(user) });
  } catch {
    return NextResponse.json({ error: "Failed to load subscription." }, { status: 500 });
  }
}