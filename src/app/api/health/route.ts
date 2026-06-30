import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const farmCount = await prisma.farm.count();
    const databaseUrl = process.env.DATABASE_URL ?? "";
    const persisted =
      databaseUrl.includes("/app/data/") || databaseUrl.includes("data/dev.db");

    return NextResponse.json({
      ok: true,
      farms: farmCount,
      databasePersisted: persisted,
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}