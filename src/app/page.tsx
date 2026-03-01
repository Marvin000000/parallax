import { AuthStatus } from '@/components/AuthStatus';
import { FeedFilter } from '@/components/FeedFilter';
import { AdCard } from '@/components/AdCard';
import { SubmitButton } from '@/components/SubmitButton';
import { VoteButton } from '@/components/VoteButton';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Suspense } from 'react';
import Link from 'next/link';

const prisma = new PrismaClient();

async function getPosts(clusterId?: number, userId?: string, tagFilters?: string[]) {
  // If user selected "My Lens" (clusterId provided), only show content from that cluster.
  // If clusterId is 0 (Observer/New), show everything anyway.
  
  const where: any = {};
  
  if (clusterId !== undefined && clusterId !== 0) {
    where.authorClusterId = clusterId;
  }
  
  if (tagFilters && tagFilters.length > 0) {
    where.tags = {
      some: {
        tag: {
          name: { in: tagFilters }
        }
      }
    };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      tags: { include: { tag: true } },
      _count: { select: { votes: true, comments: true } },
      votes: userId ? { where: { userId }, select: { value: true } } : false
    }
  });
  return posts;
}

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions);
  
  // Determine Feed Mode
  const lensMode = searchParams?.lens === 'mine';
  const tagsParam = searchParams?.tags;
  const tagFilters = tagsParam ? (Array.isArray(tagsParam) ? tagsParam : tagsParam.split(',')) : [];
  
  const userClusterId = session?.user?.clusterId; 
  const userId = session?.user?.id;

  // If "My Lens" selected but no session, fallback to All
  const targetCluster = (lensMode && userClusterId) ? (userClusterId as number) : undefined;

  const posts = await getPosts(targetCluster, userId, tagFilters);
  
  // Fetch popular tags for the filter
  const popularTags = await prisma.tag.findMany({
    take: 20,
    orderBy: {
      posts: {
        _count: 'desc'
      }
    }
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-12 border-b border-slate-700 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Parallax
          </h1>
          <p className="text-slate-400 mt-2">See the world through every lens.</p>
        </div>
        <div className="flex items-center space-x-6">
          <AuthStatus />
        </div>
      </header>

      {/* Feed Controls */}
      <div className="max-w-4xl mx-auto flex justify-between items-start mb-6">
        <Suspense fallback={<div className="h-8 w-64 bg-slate-800 rounded animate-pulse"></div>}>
           <FeedFilter popularTags={popularTags.map(t => t.name)} />
        </Suspense>
        
        <SubmitButton />
      </div>

      {/* The Feed */}
      <div className="max-w-4xl mx-auto space-y-6">
        {posts.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            No posts found in this lens yet. Switch to "All Lenses" or remove tags.
          </div>
        )}

        {posts.map((post, index) => (
          <div key={post.id}>
             {/* Insert Ad every 10 posts */}
             {index > 0 && index % 10 === 0 && <AdCard />}
             
             <Link href={`/posts/${post.id}`} className="block">
               <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800 transition-colors cursor-pointer">
                 <div className="flex justify-between items-start mb-2">
                   <h2 className="text-lg font-semibold text-blue-100">
                     {post.title}
                   </h2>
                   <div className="flex space-x-2">
                     {post.tags.map(t => (
                       <span key={t.tag.id} className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                         #{t.tag.name}
                       </span>
                     ))}
                   </div>
                 </div>
                 
                 <div className="mt-3 flex items-center space-x-6 text-xs text-slate-500" onClick={(e) => e.preventDefault()}>
                   <VoteButton 
                     postId={post.id} 
                     initialCount={post._count.votes} 
                     initialUserVote={post.votes?.[0]?.value || 0}
                   />
                   <div className="flex items-center space-x-1 group">
                     <span className="group-hover:text-blue-400">💬</span> <span>{post._count.comments} Comments</span>
                   </div>
                   <span className="text-slate-600">
                      {new Date(post.createdAt).toLocaleDateString()} • {post.authorClusterId === 0 ? 'Observer' : `Cluster ${post.authorClusterId}`}
                   </span>
                 </div>
               </div>
             </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
