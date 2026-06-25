import type Stripe from "stripe";
import { notifyOrderParties } from "@/lib/order-notifications";
import { prisma } from "@/lib/prisma";

export async function markOrderPaid(orderId: string, sessionId: string) {
  const existing = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!existing) {
    throw new Error(`Order not found: ${orderId}`);
  }

  if (existing.status === "paid") {
    return prisma.order.findUniqueOrThrow({ where: { id: orderId } });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "paid", stripeSessionId: sessionId },
  });

  void notifyOrderParties(orderId).catch((err) =>
    console.error("Order notification failed:", err)
  );

  return order;
}

export async function activateFarmerSubscription(
  userId: string,
  subscriptionId: string
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: "active",
    },
  });
}

const SUBSCRIPTION_STATUS_MAP: Record<string, string> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  canceled: "canceled",
  unpaid: "past_due",
  incomplete: "past_due",
  incomplete_expired: "canceled",
  paused: "past_due",
};

export async function syncSubscriptionStatus(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });
  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus:
        SUBSCRIPTION_STATUS_MAP[subscription.status] ?? "past_due",
    },
  });
}

export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  if (session.mode === "payment" && session.metadata?.orderId) {
    await markOrderPaid(session.metadata.orderId, session.id);
    return;
  }

  if (session.mode === "subscription" && session.subscription) {
    const userId = session.metadata?.userId;
    if (!userId) return;
    await activateFarmerSubscription(userId, String(session.subscription));
  }
}