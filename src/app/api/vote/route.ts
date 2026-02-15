import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId, commentId, value } = await req.json(); // value: 1 (up) or -1 (down)

  if (!postId && !commentId) {
    return NextResponse.json({ error: "Missing post or comment ID" }, { status: 400 });
  }
  
  // Upsert the vote
  // If user already voted same value -> remove vote (toggle off)
  // If different value -> update
  
  const where = {
    userId_postId: postId ? { userId: session.user.id, postId } : undefined,
    userId_commentId: commentId ? { userId: session.user.id, commentId } : undefined,
  };

  // Check existing
  const existingVote = await prisma.vote.findFirst({
    where: postId ? { userId: session.user.id, postId } : { userId: session.user.id, commentId }
  });

  if (existingVote) {
    if (existingVote.value === value) {
      // Toggle off (delete)
      await prisma.vote.delete({ where: { id: existingVote.id } });
      return NextResponse.json({ status: "removed" });
    } else {
      // Change vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { value }
      });
      return NextResponse.json({ status: "updated" });
    }
  }

  // New vote
  await prisma.vote.create({
    data: {
      value,
      userId: session.user.id,
      postId,
      commentId
    }
  });

  return NextResponse.json({ status: "created" });
}
