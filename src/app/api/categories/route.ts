import { NextResponse } from "next/server";
import { normalizeCategoryImage, validateCategoryImage } from "@/lib/category-image";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { farmId, name, image } = (await request.json()) as {
      farmId: string;
      name: string;
      image?: string | null;
    };
    const trimmed = name?.trim();

    if (!farmId || !trimmed) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const imageError = validateCategoryImage(image);
    if (imageError) {
      return NextResponse.json({ error: imageError }, { status: 400 });
    }

    const farm = await prisma.farm.findUnique({ where: { id: farmId } });
    if (!farm || farm.ownerId !== user.id) {
      return NextResponse.json({ error: "Farm not found." }, { status: 404 });
    }

    const existing = await prisma.farmCategory.findUnique({
      where: { farmId_name: { farmId, name: trimmed } },
    });
    if (existing) {
      return NextResponse.json({ error: "That category already exists." }, { status: 400 });
    }

    const category = await prisma.farmCategory.create({
      data: { farmId, name: trimmed, image: normalizeCategoryImage(image) },
    });

    return NextResponse.json({ category });
  } catch {
    return NextResponse.json({ error: "Failed to add category." }, { status: 500 });
  }
}