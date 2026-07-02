/**
 * Send a branded farm outreach email via Resend (same look as order emails).
 *
 * Usage:
 *   npx tsx scripts/send-farm-outreach-email.ts --to farm@example.com --farm "Ringwood Rd Farmshop" --name "Sarah"
 *
 * Optional:
 *   --personal "I've been to your shop in Walkford a few times..."
 *   --dry-run   Print subject/body without sending
 *
 * Requires RESEND_API_KEY in .env (same key as production).
 * Domain local-harvests.co.uk must be verified in Resend so richardevans@ can send.
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { sendEmail, isEmailConfigured } from "../src/lib/email";
import {
  buildFarmOutreachEmail,
  FARM_OUTREACH_FROM,
} from "../src/lib/farm-outreach-email";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

const to = readArg("--to");
const farmName = readArg("--farm");
const recipientName = readArg("--name");
const personalLine = readArg("--personal");
const dryRun = process.argv.includes("--dry-run");

if (!to) {
  console.error(
    "Usage: npx tsx scripts/send-farm-outreach-email.ts --to email@farm.com [--farm \"Farm name\"] [--name \"Contact\"] [--personal \"...\"] [--dry-run]"
  );
  process.exit(1);
}

const { subject, text, html } = buildFarmOutreachEmail({
  farmName,
  recipientName,
  personalLine,
});

if (dryRun) {
  console.log("From:", FARM_OUTREACH_FROM);
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("\n--- TEXT ---\n");
  console.log(text);
  process.exit(0);
}

if (!isEmailConfigured()) {
  console.error("RESEND_API_KEY is not set in .env");
  process.exit(1);
}

sendEmail({
  to,
  subject,
  html,
  text,
  from: FARM_OUTREACH_FROM,
  replyTo: "richardevans@local-harvests.co.uk",
})
  .then((sent) => {
    if (!sent) {
      console.error("Email was not sent (Resend not configured).");
      process.exit(1);
    }
    console.log(`Sent outreach email to ${to}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });