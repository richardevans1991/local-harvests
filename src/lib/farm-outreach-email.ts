import { getEmailAppUrl } from "@/lib/app-url";
import { getEmailFrom } from "@/lib/email";
import {
  brandedButton,
  brandedInfoBox,
  buildBrandedEmailHtml,
  escapeHtml,
} from "@/lib/email-layout";

export interface FarmOutreachEmailOptions {
  recipientName?: string;
  farmName?: string;
  personalLine?: string;
}

export function buildFarmOutreachEmail({
  recipientName,
  farmName,
  personalLine,
}: FarmOutreachEmailOptions = {}) {
  const appUrl = getEmailAppUrl();
  const forFarmersUrl = `${appUrl}/for-farmers`;
  const greeting = recipientName
    ? `Hi ${recipientName},`
    : farmName
      ? `Hi team at ${farmName},`
      : "Hi there,";

  const subject = farmName
    ? `Helping ${farmName} reach local customers online`
    : "Helping farm shops reach local customers online";

  const text = [
    greeting,
    "",
    personalLine || null,
    personalLine ? "" : null,
    "I'm Richard Evans, and I run Local Harvest — a service that helps UK farm shops sell direct to customers in their area, online.",
    "",
    "The aim is simple: make it easier for farms to connect with local buyers — without the cost and hassle of building and maintaining a website. You focus on your produce and your customers; we provide the online shop, secure card checkout, and order handling.",
    "",
    "For your farm, that means:",
    "- Your own shop page with photos and categories",
    "- Click & collect and delivery — you choose what you offer and set your delivery fee",
    "- Customers pay securely at checkout",
    "- You receive a clear order email with customer details, items, and pickup or delivery info",
    "- You can update the order as you go (preparing, ready) and the customer is kept in the loop",
    "",
    "There's a 30-day free trial, then plans from £19/month. We charge a small commission on product sales after the trial — not on delivery fees, which are yours in full.",
    "",
    `See how it works: ${forFarmersUrl}`,
    "",
    "I'm getting in touch because I'd like to work with farm shops like yours and support the kind of direct, local trade that keeps communities connected to where their food comes from. If online orders would help you reach more customers — or make click & collect and delivery simpler to manage — I'd be glad to show you how it works and help you get set up.",
    "",
    "Would you be open to a short conversation? I'm happy to visit if you're local and walk you through it on your phone.",
    "",
    "Warm regards,",
    "Richard Evans",
    "Local Harvest",
    appUrl,
    "richardevans@local-harvests.co.uk",
  ]
    .filter(Boolean)
    .join("\n");

  const bodyHtml = [
    `<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(greeting)}</p>`,
    personalLine
      ? `<p style="margin:0 0 16px;line-height:1.6;">${escapeHtml(personalLine)}</p>`
      : "",
    `<p style="margin:0 0 16px;line-height:1.6;">I'm <strong>Richard Evans</strong>, and I run <strong>Local Harvest</strong> — a service that helps UK farm shops sell direct to customers in their area, online.</p>`,
    `<p style="margin:0 0 16px;line-height:1.6;">The aim is simple: <strong>make it easier for farms to connect with local buyers</strong> — without the cost and hassle of building and maintaining a website. You focus on your produce and your customers; we provide the online shop, secure card checkout, and order handling.</p>`,
    brandedInfoBox(`
      <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#5c6b44;">What Local Harvest offers your farm</p>
      <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.7;">
        <li>Your own shop page with photos and categories</li>
        <li><strong>Click &amp; collect</strong> and <strong>delivery</strong> — you choose what you offer and set your delivery fee</li>
        <li>Customers pay securely at checkout</li>
        <li>Clear order emails with customer details, items, and pickup or delivery info</li>
        <li>Update orders as you go (preparing, ready) — customers stay informed</li>
      </ul>
    `),
    `<p style="margin:0 0 16px;line-height:1.6;">There's a <strong>30-day free trial</strong>, then plans from <strong>£19/month</strong>. We charge a small commission on product sales after the trial — <strong>not on delivery fees</strong>, which are yours in full.</p>`,
    brandedButton(forFarmersUrl, "See how it works"),
    `<p style="margin:24px 0 16px;line-height:1.6;">I'm getting in touch because I'd like to <strong>work with farm shops like yours</strong> and support the kind of direct, local trade that keeps communities connected to where their food comes from. If online orders would help you reach more customers — or make click &amp; collect and delivery simpler to manage — I'd be glad to show you how it works and help you get set up.</p>`,
    `<p style="margin:0 0 16px;line-height:1.6;">Would you be open to a short conversation? I'm happy to visit if you're local and walk you through it on your phone.</p>`,
    `<p style="margin:0;line-height:1.6;">Warm regards,<br><strong>Richard Evans</strong><br>Local Harvest<br><a href="mailto:richardevans@local-harvests.co.uk" style="color:#5c6b44;">richardevans@local-harvests.co.uk</a></p>`,
  ].join("");

  const html = buildBrandedEmailHtml({
    title: "Sell online. Stay local.",
    bodyHtml,
    logoUrl: `${appUrl}/logos/logo-hero-light.png`,
    footerNote:
      "You received this from Richard Evans at Local Harvest. Reply to richardevans@local-harvests.co.uk.",
  });

  return { subject, text, html };
}

/** Use the same verified mailbox as order emails — better deliverability than a new address. */
export function getFarmOutreachFrom() {
  const configured = getEmailFrom();
  const match = configured.match(/<([^>]+)>/);
  const mailbox = match?.[1] ?? "orders@local-harvests.co.uk";
  return `Richard Evans · Local Harvest <${mailbox}>`;
}

export const FARM_OUTREACH_REPLY_TO = "richardevans@local-harvests.co.uk";