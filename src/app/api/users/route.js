import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await prisma.user.findMany({
    where: { isOnline: true },
    select: { id: true, username: true, isOnline: true },
    orderBy: { username: "asc" },
  });

  return NextResponse.json({ users });
}
