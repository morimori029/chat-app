import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { username } = await request.json();

  if (!username || username.trim().length === 0) {
    return NextResponse.json(
      { error: "ユーザー名を入力してください" },
      { status: 400 }
    );
  }

  const trimmed = username.trim();

  const existing = await prisma.user.findUnique({
    where: { username: trimmed },
  });

  if (existing && existing.isOnline) {
    return NextResponse.json(
      { error: "このユーザー名は現在オンラインです" },
      { status: 409 }
    );
  }

  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { isOnline: true },
      })
    : await prisma.user.create({
        data: { username: trimmed, isOnline: true },
      });

  return NextResponse.json({ user });
}
