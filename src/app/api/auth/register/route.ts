import { NextResponse } from "next/server";
import { hashPassword, setSessionCookie, toPublicUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types";

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = (await request.json()) as {
      email: string;
      password: string;
      name: string;
      role: UserRole;
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

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name.trim(),
        role,
      },
      include: { farm: true },
    });

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