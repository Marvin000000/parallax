import { VoteButton } from '@/components/VoteButton';

const prisma = new PrismaClient();

async function getPosts(clusterId?: number, userId?: string) {
  // If user selected "My Tribe" (clusterId provided), only show content from that cluster.
  // If clusterId is 0 (Observer/New), show everything anyway.
  
  const where = (clusterId !== undefined && clusterId !== 0)
    ? { authorClusterId: clusterId }
    : {};

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
  const tribeMode = searchParams?.tribe === 'mine';
  const userClusterId = session?.user?.clusterId; 
  const userId = session?.user?.id;

  // If "My Tribe" selected but no session, fallback to All
  const targetCluster = (tribeMode && userClusterId) ? (userClusterId as number) : undefined;

  const posts = await getPosts(targetCluster, userId);

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
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <Suspense fallback={<div className="h-8 w-32 bg-slate-800 rounded animate-pulse"></div>}>
           <FeedFilter />
        </Suspense>
import { SubmitButton } from '@/components/SubmitButton';

// ... (rest of imports)

// ... (rest of Home)

      {/* Feed Controls */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <Suspense fallback={<div className="h-8 w-32 bg-slate-800 rounded animate-pulse"></div>}>
           <FeedFilter />
        </Suspense>
        
        <SubmitButton />
      </div>

      {/* The Feed */}
      <div className="max-w-4xl mx-auto space-y-6">
        {posts.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            No posts found in this tribe yet. Switch to "All Tribes".
          </div>
        )}

        {posts.map((post, index) => (
          <div key={post.id}>
             {/* Insert Ad every 10 posts */}
             {index > 0 && index % 10 === 0 && <AdCard />}
             
             <div className="p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:border-slate-500 transition-colors">
               <div className="flex justify-between items-start mb-2">
                 <h2 className="text-lg font-semibold text-blue-100">
                   <a href={post.url || '#'} target="_blank" rel="noopener noreferrer" className="hover:underline">
                     {post.title}
                   </a>
                 </h2>
                 <div className="flex space-x-2">
                   {post.tags.map(t => (
                     <span key={t.tag.id} className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 border border-slate-600">
                       #{t.tag.name}
                     </span>
                   ))}
                 </div>
               </div>
               
               <div className="mt-3 flex items-center space-x-6 text-xs text-slate-500">
                 <VoteButton 
                   postId={post.id} 
                   initialCount={post._count.votes} // This is total count, tricky because user vote is separate
                   initialUserVote={post.votes?.[0]?.value || 0}
                 />
import Link from 'next/link';

// ... (other imports)

// ... inside map()
                 <Link href={`/posts/${post.id}`} className="hover:text-white flex items-center space-x-1 group">
                   <span className="group-hover:text-blue-400">💬</span> <span>{post._count.comments} Comments</span>
                 </Link>
                 <span className="text-slate-600">
                    {new Date(post.createdAt).toLocaleDateString()} • {post.authorClusterId === 0 ? 'Observer' : `Cluster ${post.authorClusterId}`}
                 </span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </main>
  );
}
