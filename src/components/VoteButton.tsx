'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface VoteButtonProps {
  postId?: string | null;
  commentId?: string | null;
  initialCount: number;
  initialUserVote?: number; // 1, -1, or undefined
}

export function VoteButton({ postId, commentId, initialCount, initialUserVote }: VoteButtonProps) {
  const { data: session } = useSession();
  const [vote, setVote] = useState<number>(initialUserVote || 0);
  const [count, setCount] = useState<number>(initialCount);
  const [loading, setLoading] = useState(false);

  const handleVote = async (value: number) => {
    if (!session) {
      alert("Please sign in to vote.");
      return;
    }
    if (loading) return;

    // Optimistic Update
    const oldVote = vote;
    const oldCount = count;
    
    // Calculate new state
    let newVote = value;
    let newCount = count;

    if (oldVote === value) {
      // Toggle off
      newVote = 0;
      newCount -= value;
    } else {
      // Switch vote or new vote
      newVote = value;
      newCount += (value - oldVote);
    }

    setVote(newVote);
    setCount(newCount);
    setLoading(true);

    try {
      const body = postId 
        ? { postId, value } 
        : { commentId, value };

      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) throw new Error('Failed to vote');
    } catch (err) {
      // Revert on error
      setVote(oldVote);
      setCount(oldCount);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <button 
        onClick={() => handleVote(1)}
        disabled={loading}
        className={`p-1 rounded hover:bg-slate-700/50 transition-colors ${vote === 1 ? 'text-green-400' : 'text-slate-500'}`}
      >
        ▲
      </button>
      <span className={`text-xs font-mono w-4 text-center ${vote !== 0 ? 'text-white' : 'text-slate-500'}`}>
        {count}
      </span>
      <button 
        onClick={() => handleVote(-1)}
        disabled={loading}
        className={`p-1 rounded hover:bg-slate-700/50 transition-colors ${vote === -1 ? 'text-red-400' : 'text-slate-500'}`}
      >
        ▼
      </button>
    </div>
  );
}
