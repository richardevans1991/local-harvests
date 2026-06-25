import { getAppUrl } from "@/lib/app-url";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function formatMoney(amount: number) {
  return `£${amount.toFixed(2)}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function buildFarmerOrderEmail({
  farmName,
  customerName,
  email,
  phone,
  pickupDate,
  fulfillmentMethod,
  deliveryAddress,
  notes,
  items,
  farmSubtotal,
  dashboardUrl,
}: {
  farmName: string;
  customerName: string;
  email: string;
  phone: string;
  pickupDate: string;
  fulfillmentMethod: string;
  deliveryAddress: string | null;
  notes: string | null;
  items: { name: string; quantity: number; price: number }[];
  farmSubtotal: number;
  dashboardUrl: string;
}) {
  const isDelivery = fulfillmentMethod === "delivery";
  const fulfillmentLabel = isDelivery ? "Delivery date" : "Pickup date";
  const fulfillmentDetail = isDelivery
    ? `${pickupDate}${deliveryAddress ? ` — ${deliveryAddress}` : ""}`
    : pickupDate;

  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;color:#4a3728;">${escapeHtml(item.name)}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;color:#4a3728;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;color:#4a3728;text-align:right;">${formatMoney(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const itemLines = items
    .map(
      (item) =>
        `- ${item.name} × ${item.quantity} — ${formatMoney(item.price * item.quantity)}`
    )
    .join("\n");

  const subject = `New order for ${farmName} — ${customerName}`;

  const text = [
    `Hi ${farmName} team,`,
    "",
    `You have a new order on Local Harvest.`,
    "",
    `Customer: ${customerName}`,
    `Phone: ${phone}`,
    `Email: ${email}`,
    `${fulfillmentLabel}: ${fulfillmentDetail}`,
    notes ? `Customer note: ${notes}` : null,
    "",
    "Items from your shop:",
    itemLines,
    "",
    `Subtotal from your shop: ${formatMoney(farmSubtotal)}`,
    "",
    `Manage this order in your dashboard: ${dashboardUrl}`,
    "",
    "— Local Harvest",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f7f3eb;font-family:Georgia,'Times New Roman',serif;color:#4a3728;">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <div style="background:#ffffff;border:1px solid #e8e0d4;border-radius:16px;overflow:hidden;">
        <div style="background:#8b9a6b;padding:20px 24px;">
          <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#f7f3eb;">Local Harvest</p>
          <h1 style="margin:8px 0 0;font-size:24px;color:#f7f3eb;">New order for ${escapeHtml(farmName)}</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 16px;line-height:1.6;">A customer has placed a new order. Here are the details you need to prepare it.</p>

          <div style="background:#f7f3eb;border-radius:12px;padding:16px;margin-bottom:16px;">
            <p style="margin:0 0 8px;font-size:14px;"><strong>Customer:</strong> ${escapeHtml(customerName)}</p>
            <p style="margin:0 0 8px;font-size:14px;"><strong>Phone:</strong> <a href="tel:${escapeHtml(phone)}" style="color:#5c6b44;">${escapeHtml(phone)}</a></p>
            <p style="margin:0 0 8px;font-size:14px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}" style="color:#5c6b44;">${escapeHtml(email)}</a></p>
            <p style="margin:0;font-size:14px;"><strong>${fulfillmentLabel}:</strong> ${escapeHtml(fulfillmentDetail)}</p>
          </div>

          ${
            notes
              ? `<div style="background:#fff8e8;border:1px solid #f0dfb8;border-radius:12px;padding:14px 16px;margin-bottom:16px;font-size:14px;">
                  <strong>Customer note:</strong> ${escapeHtml(notes)}
                </div>`
              : ""
          }

          <h2 style="margin:0 0 12px;font-size:18px;color:#5c6b44;">Items from your shop</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr>
                <th style="padding:0 0 8px;text-align:left;color:#7a6a58;font-weight:600;">Product</th>
                <th style="padding:0 0 8px;text-align:center;color:#7a6a58;font-weight:600;">Qty</th>
                <th style="padding:0 0 8px;text-align:right;color:#7a6a58;font-weight:600;">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <p style="margin:16px 0 0;text-align:right;font-size:16px;font-weight:bold;color:#5c6b44;">
            Subtotal: ${formatMoney(farmSubtotal)}
          </p>

          <div style="margin-top:24px;text-align:center;">
            <a href="${dashboardUrl}" style="display:inline-block;background:#8b9a6b;color:#f7f3eb;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;">
              View in dashboard
            </a>
          </div>
        </div>
      </div>
      <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#7a6a58;">
        You received this because a customer ordered from your farm shop on Local Harvest.
      </p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

function buildCustomerOrderEmail({
  customerName,
  orderId,
  pickupDate,
  fulfillmentMethod,
  deliveryAddress,
  notes,
  items,
  total,
  marketplaceUrl,
}: {
  customerName: string;
  orderId: string;
  pickupDate: string;
  fulfillmentMethod: string;
  deliveryAddress: string | null;
  notes: string | null;
  items: { name: string; farmName: string; quantity: number; price: number }[];
  total: number;
  marketplaceUrl: string;
}) {
  const isDelivery = fulfillmentMethod === "delivery";
  const fulfillmentLabel = isDelivery ? "Delivery date" : "Pickup date";
  const fulfillmentDetail = isDelivery
    ? `${pickupDate}${deliveryAddress ? ` to ${deliveryAddress}` : ""}`
    : pickupDate;
  const fulfillmentSummary = isDelivery
    ? `Your order will be delivered on ${fulfillmentDetail}.`
    : `Your order is confirmed for pickup on ${pickupDate}.`;

  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;color:#4a3728;">
            <strong>${escapeHtml(item.name)}</strong>
            <br><span style="font-size:12px;color:#7a6a58;">${escapeHtml(item.farmName)}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;color:#4a3728;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e8e0d4;color:#4a3728;text-align:right;">${formatMoney(item.price * item.quantity)}</td>
        </tr>`
    )
    .join("");

  const itemLines = items
    .map(
      (item) =>
        `- ${item.name} (${item.farmName}) × ${item.quantity} — ${formatMoney(item.price * item.quantity)}`
    )
    .join("\n");

  const shortRef = orderId.slice(-8).toUpperCase();
  const subject = `Order confirmed — Local Harvest (#${shortRef})`;

  const text = [
    `Hi ${customerName},`,
    "",
    `Thank you for your order on Local Harvest!`,
    "",
    fulfillmentSummary,
    `${fulfillmentLabel}: ${fulfillmentDetail}`,
    notes ? `Your note: ${notes}` : null,
    "",
    `Order reference: #${shortRef}`,
    "",
    "Your items:",
    itemLines,
    "",
    `Total paid: ${formatMoney(total)}`,
    "",
    `The farm shop(s) will prepare your order. If you have questions, reply to this email or contact the farm directly.`,
    "",
    `Browse more local farms: ${marketplaceUrl}`,
    "",
    "— Local Harvest",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#f7f3eb;font-family:Georgia,'Times New Roman',serif;color:#4a3728;">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <div style="background:#ffffff;border:1px solid #e8e0d4;border-radius:16px;overflow:hidden;">
        <div style="background:#8b9a6b;padding:20px 24px;">
          <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#f7f3eb;">Local Harvest</p>
          <h1 style="margin:8px 0 0;font-size:24px;color:#f7f3eb;">Order confirmed ✅</h1>
        </div>
        <div style="padding:24px;">
          <p style="margin:0 0 8px;line-height:1.6;">Hi ${escapeHtml(customerName)},</p>
          <p style="margin:0 0 16px;line-height:1.6;">Thank you for supporting local farm shops. ${escapeHtml(fulfillmentSummary)}</p>

          <div style="background:#f7f3eb;border-radius:12px;padding:16px;margin-bottom:16px;font-size:14px;">
            <p style="margin:0 0 8px;"><strong>${fulfillmentLabel}:</strong> ${escapeHtml(fulfillmentDetail)}</p>
            <p style="margin:0;"><strong>Order reference:</strong> #${shortRef}</p>
          </div>

          ${
            notes
              ? `<div style="background:#fff8e8;border:1px solid #f0dfb8;border-radius:12px;padding:14px 16px;margin-bottom:16px;font-size:14px;">
                  <strong>Your note:</strong> ${escapeHtml(notes)}
                </div>`
              : ""
          }

          <h2 style="margin:0 0 12px;font-size:18px;color:#5c6b44;">Your order</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <thead>
              <tr>
                <th style="padding:0 0 8px;text-align:left;color:#7a6a58;font-weight:600;">Product</th>
                <th style="padding:0 0 8px;text-align:center;color:#7a6a58;font-weight:600;">Qty</th>
                <th style="padding:0 0 8px;text-align:right;color:#7a6a58;font-weight:600;">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <p style="margin:16px 0 0;text-align:right;font-size:16px;font-weight:bold;color:#5c6b44;">
            Total: ${formatMoney(total)}
          </p>

          <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#4a3728;">
            The farm shop will prepare your order. If anything changes, they may contact you directly.
          </p>

          <div style="margin-top:24px;text-align:center;">
            <a href="${marketplaceUrl}" style="display:inline-block;background:#8b9a6b;color:#f7f3eb;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:600;">
              Browse more farms
            </a>
          </div>
        </div>
      </div>
      <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#7a6a58;">
        Fresh food from farms near you — local-harvests.co.uk
      </p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}

export async function notifyOrderParties(orderId: string) {
  if (!isEmailConfigured()) {
    return;
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order || !order.items.length) return;

  const farmIds = Array.from(new Set(order.items.map((item) => item.farmId)));
  const farms = await prisma.farm.findMany({
    where: { id: { in: farmIds } },
    include: {
      owner: { select: { email: true } },
    },
  });

  const farmNameById = new Map(farms.map((farm) => [farm.id, farm.name]));
  const appUrl = getAppUrl();
  const dashboardUrl = `${appUrl}/farmer/dashboard`;
  const marketplaceUrl = appUrl;

  const customerEmail = buildCustomerOrderEmail({
    customerName: order.customerName,
    orderId: order.id,
    pickupDate: order.pickupDate,
    fulfillmentMethod: order.fulfillmentMethod,
    deliveryAddress: order.deliveryAddress,
    notes: order.notes,
    items: order.items.map((item) => ({
      name: item.name,
      farmName: farmNameById.get(item.farmId) ?? "Local farm",
      quantity: item.quantity,
      price: item.price,
    })),
    total: order.total,
    marketplaceUrl,
  });

  const farmerEmails = farms.map(async (farm) => {
    const farmItems = order.items.filter((item) => item.farmId === farm.id);
    if (!farmItems.length) return;

    const farmSubtotal = farmItems.reduce(
      (sum, item) => sum + Math.round(item.price * item.quantity * 100) / 100,
      0
    );

    const email = buildFarmerOrderEmail({
      farmName: farm.name,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      pickupDate: order.pickupDate,
      fulfillmentMethod: order.fulfillmentMethod,
      deliveryAddress: order.deliveryAddress,
      notes: order.notes,
      items: farmItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      farmSubtotal: Math.round(farmSubtotal * 100) / 100,
      dashboardUrl,
    });

    await sendEmail({
      to: farm.owner.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  });

  await Promise.all([
    sendEmail({
      to: order.email,
      subject: customerEmail.subject,
      text: customerEmail.text,
      html: customerEmail.html,
    }),
    ...farmerEmails,
  ]);
}
