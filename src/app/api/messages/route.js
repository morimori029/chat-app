import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = parseInt(searchParams.get("userId"));
  const partnerId = parseInt(searchParams.get("partnerId"));

  if (!userId || !partnerId) {
    return NextResponse.json(
      { error: "userId と partnerId は必須です" },
      { status: 400 }
    );
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    },
    include: { sender: true, receiver: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}
