import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [farmCount, farmerAccounts, productCount] = await Promise.all([
      prisma.farm.count(),
      prisma.user.count({ where: { role: "farmer" } }),
      prisma.product.count(),
    ]);
    const databaseUrl = process.env.DATABASE_URL ?? "";
    const persisted = databaseUrl.includes("/app/data/");

    return NextResponse.json({
      ok: true,
      farms: farmCount,
      farmerAccounts,
      products: productCount,
      databaseUrl,
      databasePersisted: persisted,
      hint:
        farmerAccounts > 0 && farmCount === 0
          ? "Farmer account exists but no farm record — log in and complete setup, or contact support."
          : farmCount === 0
            ? "No farms registered yet."
            : undefined,
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({ ok: false, error: "Database unavailable." }, { status: 503 });
  }
}