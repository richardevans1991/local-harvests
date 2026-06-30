import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const authError = authorizeAdmin(request);
  if (authError) {
    return NextResponse.json(
      { error: authError },
      { status: authError === "Unauthorized." ? 401 : 503 }
    );
  }

  try {
    const body = (await request.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { farm: { select: { id: true, name: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "No account found with that email." }, { status: 404 });
    }

    if (user.role === "farmer" || user.farm) {
      return NextResponse.json(
        { error: "Farmer accounts cannot be deleted via this endpoint." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { userId: user.id },
        data: { userId: null },
      });
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({
      deleted: true,
      email,
      message: "Customer account removed. You can now register as a farmer with this email.",
    });
  } catch (error) {
    console.error("delete-user error:", error);
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }
}