import { NextResponse } from "next/server";
import { hashPassword, setSessionCookie, toPublicUser } from "@/lib/auth";
import { createFarmerFarm } from "@/lib/create-farmer-farm";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types";

export async function POST(request: Request) {
  try {
    const { email, password, name, role, farmName, location } = (await request.json()) as {
      email: string;
      password: string;
      name: string;
      role: UserRole;
      farmName?: string;
      location?: string;
    };

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    if (role === "farmer" && (!farmName?.trim() || !location?.trim())) {
      return NextResponse.json(
        { error: "Farm shop name and town/area are required for farmer accounts." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    const passwordHash = await hashPassword(password);

    let user;

    if (existing) {
      if (role !== "farmer" || existing.role !== "customer") {
        return NextResponse.json(
          { error: "An account with this email already exists." },
          { status: 409 }
        );
      }

      const orderCount = await prisma.order.count({ where: { userId: existing.id } });
      if (orderCount > 0) {
        return NextResponse.json(
          {
            error:
              "This email has customer orders on file. Contact hello@local-harvests.co.uk for help.",
          },
          { status: 409 }
        );
      }

      user = await prisma.$transaction(async (tx) => {
        await tx.order.updateMany({
          where: { userId: existing.id },
          data: { userId: null },
        });

        await tx.user.update({
          where: { id: existing.id },
          data: {
            passwordHash,
            name: name.trim(),
            role: "farmer",
          },
        });

        await createFarmerFarm(
          {
            ownerId: existing.id,
            name: farmName!,
            location: location!,
          },
          tx
        );

        return tx.user.findUniqueOrThrow({
          where: { id: existing.id },
          include: { farm: true },
        });
      });
    } else {
      user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email: normalizedEmail,
            passwordHash,
            name: name.trim(),
            role,
          },
        });

        if (role === "farmer") {
          await createFarmerFarm(
            {
              ownerId: created.id,
              name: farmName!,
              location: location!,
            },
            tx
          );
        }

        return tx.user.findUniqueOrThrow({
          where: { id: created.id },
          include: { farm: true },
        });
      });
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      farmId: user.farm?.id,
    };

    await setSessionCookie(sessionUser);

    return NextResponse.json({ user: toPublicUser(sessionUser) });
  } catch {
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}