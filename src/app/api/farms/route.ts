import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const farms = await prisma.farm.findMany({ orderBy: { distance: "asc" } });
    return NextResponse.json({ farms });
  } catch {
    return NextResponse.json({ error: "Failed to load farms." }, { status: 500 });
  }
}