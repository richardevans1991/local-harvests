import { NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/stripe-handlers";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export async function GET(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id." }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed." }, { status: 400 });
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const order = await markOrderPaid(orderId, sessionId);

    return NextResponse.json({
      order: {
        id: order.id,
        customerName: order.customerName,
        email: order.email,
        pickupDate: order.pickupDate,
        fulfillmentMethod: order.fulfillmentMethod as "pickup" | "delivery",
        deliveryAddress: order.deliveryAddress,
        total: order.total,
      },
    });
  } catch {
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}