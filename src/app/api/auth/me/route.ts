import { NextResponse } from "next/server";
import { getSessionUser, toPublicUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user: user ? toPublicUser(user) : null });
}