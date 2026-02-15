import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { CommentNode } from '@/components/CommentNode';
import { VoteButton } from '@/components/VoteButton';
import { AuthStatus } from '@/components/AuthStatus';
import Link from 'next/link';
import { ReplyInput } from '@/components/ReplyInput';

const prisma = new PrismaClient();

// Helper to build recursive tree
function buildTree(comments: any[]) {
  const map = new Map();
  const roots: any[] = [];

  comments.forEach(c => {
    map.set(c.id, { ...c, children: [] });
  });

  comments.forEach(c => {
    if (c.parentId) {
      const parent = map.get(c.parentId);
      if (parent) {
        parent.children.push(map.get(c.id));
      }
    } else {
      roots.push(map.get(c.id));
    }
  });

  return roots;
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      tags: { include: { tag: true } },
      _count: { select: { votes: true } },
      votes: userId ? { where: { userId } } : false,
      comments: {
        orderBy: { createdAt: 'desc' }, // Newest first
        include: {
          author: true,
          votes: userId ? { where: { userId } } : false,
          _count: { select: { votes: true } }
        }
      }
    }
  });

  if (!post) {
    return <div className="text-white p-8">Post not found.</div>;
  }

  const commentTree = buildTree(post.comments);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header (Simplified) */}
      <header className="max-w-4xl mx-auto mb-8 border-b border-slate-700 pb-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 hover:opacity-80">
          Parallax
        </Link>
        <AuthStatus />
      </header>

      {/* Post Content */}
      <article className="max-w-4xl mx-auto bg-slate-800/50 p-6 rounded-lg border border-slate-700 mb-8">
        <div className="flex items-start space-x-4">
          <div className="pt-1">
             <VoteButton 
               postId={post.id} 
               initialCount={post._count.votes} 
               initialUserVote={post.votes?.[0]?.value || 0} 
             />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-blue-100 mb-2">
              <a href={post.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {post.title}
              </a>
            </h1>
            
            <div className="flex space-x-2 mb-4">
               {post.tags.map(t => (
                 <span key={t.tag.id} className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                   #{t.tag.name}
                 </span>
               ))}
            </div>

            {post.content && (
              <div className="prose prose-invert prose-sm mb-4 text-slate-300">
                {post.content}
              </div>
            )}

            <div className="text-xs text-slate-500">
              Posted by {post.author.name || 'Anonymous'} • {new Date(post.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Top Level Reply Form */}
        <div className="mt-8 pt-6 border-t border-slate-700">
           <CommentForm postId={post.id} />
        </div>
      </article>

      {/* Comment Tree */}
      <section className="max-w-4xl mx-auto space-y-2">
        <h3 className="text-lg font-bold mb-4">{post.comments.length} Comments</h3>
        {commentTree.map(c => (
          <CommentNode key={c.id} comment={c} />
        ))}
      </section>
    </main>
  );
}

// Simple Reply Form Component (Internal)
function CommentForm({ postId }: { postId: string }) {
  return (
    <form action="/api/comments" method="POST" className="flex flex-col space-y-2">
      {/* 
        Note: Using standard form for now, but client component ideal for UX.
        To save time, I am assuming the user will use the Reply button on comments,
        but for top level post, we need a client wrapper or raw form.
      */}
      <p className="text-sm text-slate-400 mb-2">Leave a comment</p>
      {/* We need a Client Component wrapper to handle async fetch properly without page reload */}
      <ReplyInput postId={postId} />
    </form>
  );
}

import { ReplyInput } from '@/components/ReplyInput';
