import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { getSessionUser } from "@/lib/auth";
import { FARMER_PLANS } from "@/lib/farmer-plans";
import { getFarmerSubscriptionView } from "@/lib/farmer-subscription";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function POST() {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json(
        {
          error:
            "Online billing is not set up yet. Your free month still applies — we will enable payments soon.",
        },
        { status: 503 }
      );
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        stripeCustomerId: true,
      },
    });

    if (!user?.subscriptionTier || !(user.subscriptionTier in FARMER_PLANS)) {
      return NextResponse.json({ error: "Choose a plan first." }, { status: 400 });
    }

    const view = getFarmerSubscriptionView(user);
    if (view.needsPlanSelection) {
      return NextResponse.json({ error: "Choose a plan first." }, { status: 400 });
    }

    if (view.status === "active") {
      return NextResponse.json({ error: "Your subscription is already active." }, { status: 400 });
    }

    const plan = FARMER_PLANS[user.subscriptionTier as keyof typeof FARMER_PLANS];
    const appUrl = getAppUrl();
    const stripe = getStripe();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: sessionUser.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: sessionUser.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const trialEnd =
      user.trialEndsAt && user.trialEndsAt.getTime() > Date.now()
        ? Math.floor(user.trialEndsAt.getTime() / 1000)
        : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: `Local Harvest — ${plan.name}`,
              description: plan.tagline,
            },
            unit_amount: plan.priceMonthly,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      subscription_data: trialEnd ? { trial_end: trialEnd } : undefined,
      metadata: {
        userId: sessionUser.id,
        planId: plan.id,
      },
      success_url: `${appUrl}/farmer/plans/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/farmer/plans?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ error: "Could not start billing checkout." }, { status: 500 });
  }
}