import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { activateFarmerSubscription } from "@/lib/stripe-handlers";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
    }

    const sessionUser = await getSessionUser();
    if (!sessionUser || sessionUser.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.mode !== "subscription" || !session.subscription) {
      return NextResponse.json({ error: "Invalid subscription session." }, { status: 400 });
    }

    if (session.metadata?.userId !== sessionUser.id) {
      return NextResponse.json({ error: "Session does not match user." }, { status: 403 });
    }

    const user = await activateFarmerSubscription(
      sessionUser.id,
      String(session.subscription)
    );

    return NextResponse.json({
      subscription: {
        status: user.subscriptionStatus,
        tier: user.subscriptionTier,
      },
    });
  } catch (error) {
    console.error("Subscription verify error:", error);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}