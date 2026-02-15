'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function ReplyInput({ postId, parentId }: { postId: string, parentId?: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert("Sign in to comment");
    
    setLoading(true);
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, parentId, content }),
      });
      setContent('');
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-2 max-w-2xl">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded p-3 text-white focus:border-blue-500 outline-none w-full resize-y min-h-[100px]"
        placeholder="What are your thoughts?"
        required
      />
      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={loading || !content.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors"
        >
          {loading ? 'Posting...' : 'Comment'}
        </button>
      </div>
    </form>
  );
}
