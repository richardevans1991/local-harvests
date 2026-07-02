import { NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { toStripeImageUrl } from "@/lib/image-utils";
import { getSessionUser } from "@/lib/auth";
import { validateFulfillmentChoice, type FulfillmentMethod } from "@/lib/fulfillment";
import {
  calculateCheckoutTotals,
  serializeFarmDeliveryFees,
} from "@/lib/order-fees";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

interface CheckoutItem {
  productId: string;
  farmId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      customerName,
      email,
      phone,
      pickupDate,
      fulfillmentMethod = "pickup",
      deliveryAddress,
      notes,
    } = body as {
      items: CheckoutItem[];
      customerName: string;
      email: string;
      phone: string;
      pickupDate: string;
      fulfillmentMethod?: FulfillmentMethod;
      deliveryAddress?: string;
      notes?: string;
    };

    if (!items?.length || !customerName || !email || !phone || !pickupDate) {
      return NextResponse.json({ error: "Missing checkout details." }, { status: 400 });
    }

    const farmIds = Array.from(new Set(items.map((item) => item.farmId)));
    const farms = await prisma.farm.findMany({
      where: { id: { in: farmIds } },
      select: {
        id: true,
        name: true,
        offersPickup: true,
        offersDelivery: true,
        deliveryFee: true,
        shopOpen: true,
      },
    });

    const closedFarms = farms.filter((farm) => !farm.shopOpen);
    if (closedFarms.length > 0) {
      const names = closedFarms.map((farm) => farm.name).join(", ");
      return NextResponse.json(
        {
          error:
            closedFarms.length === 1
              ? `${names} is not accepting orders right now — browse only.`
              : `${names} are not accepting orders right now.`,
        },
        { status: 400 }
      );
    }

    const validationError = validateFulfillmentChoice(fulfillmentMethod, farms);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    if (fulfillmentMethod === "delivery" && !deliveryAddress?.trim()) {
      return NextResponse.json({ error: "Delivery address is required." }, { status: 400 });
    }

    const { subtotal, deliveryFee, farmDeliveryFees, platformFee, farmerTotal, total } =
      await calculateCheckoutTotals(items, fulfillmentMethod);
    const user = await getSessionUser();

    const order = await prisma.order.create({
      data: {
        customerName,
        email,
        phone,
        pickupDate,
        fulfillmentMethod,
        deliveryAddress:
          fulfillmentMethod === "delivery" ? deliveryAddress?.trim() ?? null : null,
        notes: notes || null,
        deliveryFee,
        farmDeliveryFees: serializeFarmDeliveryFees(farmDeliveryFees),
        total,
        platformFee,
        farmerTotal,
        status: "pending",
        userId: user?.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            farmId: item.farmId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      },
    });

    if (!isStripeConfigured()) {
      return NextResponse.json({ mode: "pickup", orderId: order.id });
    }

    const appUrl = getAppUrl();
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [
        ...items.map((item) => {
          const imageUrl = toStripeImageUrl(item.image, appUrl);
          return {
            price_data: {
              currency: "gbp",
              product_data: {
                name: item.name,
                images: imageUrl ? [imageUrl] : undefined,
              },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
          };
        }),
        ...farmDeliveryFees
          .filter((line) => line.fee > 0)
          .map((line) => ({
            price_data: {
              currency: "gbp",
              product_data: {
                name: `Delivery — ${line.farmName}`,
              },
              unit_amount: Math.round(line.fee * 100),
            },
            quantity: 1,
          })),
      ],
      metadata: {
        orderId: order.id,
      },
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?cancelled=1`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ mode: "stripe", url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed." }, { status: 500 });
  }
}