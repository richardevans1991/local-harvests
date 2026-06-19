import { NextResponse } from "next/server";
import { setSessionCookie, toPublicUser, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types";

export async function POST(request: Request) {
  try {
    const { email, password, role } = (await request.json()) as {
      email: string;
      password: string;
      role: UserRole;
    };

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { farm: true },
    });

    if (!user || user.role !== role) {
      return NextResponse.json(
        { error: "Invalid email, password, or account type." },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email, password, or account type." },
        { status: 401 }
      );
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
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}