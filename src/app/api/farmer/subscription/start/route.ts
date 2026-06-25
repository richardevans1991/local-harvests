import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isFarmerPlanId } from "@/lib/farmer-plans";
import { getFarmerSubscriptionView, trialEndDateFromNow } from "@/lib/farmer-subscription";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { tier } = (await request.json()) as { tier?: string };
    if (!tier || !isFarmerPlanId(tier)) {
      return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      },
    });

    if (existing?.subscriptionTier && existing.subscriptionStatus !== "none") {
      return NextResponse.json(
        { error: "You already have a plan. Manage it from your dashboard." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        subscriptionTier: tier,
        subscriptionStatus: "trialing",
        trialEndsAt: trialEndDateFromNow(),
      },
      select: {
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      },
    });

    return NextResponse.json({
      subscription: getFarmerSubscriptionView(updated),
    });
  } catch {
    return NextResponse.json({ error: "Failed to start plan." }, { status: 500 });
  }
}