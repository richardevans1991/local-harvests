import { NextResponse } from "next/server";
import { validateFarmCategory } from "@/lib/categories";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const farm = await prisma.farm.findUnique({ where: { id: body.farmId } });
    if (!farm || farm.ownerId !== user.id) {
      return NextResponse.json({ error: "Farm not found." }, { status: 404 });
    }

    const categoryError = await validateFarmCategory(body.farmId, body.category);
    if (categoryError) {
      return NextResponse.json({ error: categoryError }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        farmId: body.farmId,
        name: body.name,
        description: body.description,
        price: Number(body.price),
        image: body.image,
        category: body.category,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}