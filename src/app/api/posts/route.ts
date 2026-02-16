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

  const { title, url, content, tags } = await req.json();

  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const newPost = await prisma.post.create({
    data: {
      title,
      url,
      content,
      published: true,
      authorId: session.user.id,
      authorClusterId: session.user.clusterId || 0,
      tags: {
        create: (tags || []).map((t: string) => ({
          tag: { connectOrCreate: { where: { name: t }, create: { name: t } } },
          assignedBy: session.user.id
        }))
      }
    }
  });

  return NextResponse.json(newPost);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, title, url, content } = await req.json();

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { title, url, content }
  });

  return NextResponse.json(updated);
}
