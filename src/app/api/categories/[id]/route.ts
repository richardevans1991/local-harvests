import { NextResponse } from "next/server";
import { normalizeCategoryImage, validateCategoryImage } from "@/lib/category-image";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const category = await prisma.farmCategory.findUnique({
      where: { id },
      include: { farm: true },
    });

    if (!category || category.farm.ownerId !== user.id) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const { name, image } = (await request.json()) as {
      name: string;
      image?: string | null;
    };
    const trimmed = name?.trim();
    if (!trimmed) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const imageError = validateCategoryImage(image);
    if (imageError) {
      return NextResponse.json({ error: imageError }, { status: 400 });
    }

    const duplicate = await prisma.farmCategory.findUnique({
      where: { farmId_name: { farmId: category.farmId, name: trimmed } },
    });
    if (duplicate && duplicate.id !== id) {
      return NextResponse.json({ error: "That category already exists." }, { status: 400 });
    }

    const [updated] = await prisma.$transaction([
      prisma.farmCategory.update({
        where: { id },
        data: {
          name: trimmed,
          ...(image !== undefined ? { image: normalizeCategoryImage(image) } : {}),
        },
      }),
      prisma.product.updateMany({
        where: { farmId: category.farmId, category: category.name },
        data: { category: trimmed },
      }),
    ]);

    return NextResponse.json({ category: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update category." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "farmer") {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await context.params;
    const category = await prisma.farmCategory.findUnique({
      where: { id },
      include: { farm: true },
    });

    if (!category || category.farm.ownerId !== user.id) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    const productCount = await prisma.product.count({
      where: { farmId: category.farmId, category: category.name },
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot remove "${category.name}" — ${productCount} product(s) still use it. Reassign or remove those products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.farmCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove category." }, { status: 500 });
  }
}