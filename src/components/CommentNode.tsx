'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { VoteButton } from './VoteButton';

type CommentWithChildren = {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  author: { id: string; name: string | null; clusterLabel: string | null };
  createdAt: Date;
  deleted: boolean;
  votes: { value: number }[];
  _count: { votes: number };
  children: CommentWithChildren[];
};

export function CommentNode({ comment, depth = 0 }: { comment: CommentWithChildren, depth?: number }) {
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return alert("Sign in to reply");
    
    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId: comment.postId, parentId: comment.id, content: replyContent }),
    });
    
    window.location.reload(); 
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await fetch('/api/comments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: comment.id, content: editContent }),
    });
    
    setIsEditing(false);
    window.location.reload();
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    
    await fetch(`/api/comments?id=${comment.id}`, { method: 'DELETE' });
    window.location.reload();
  };

  const userVote = comment.votes?.[0]?.value || 0;
  const score = comment._count.votes;
  const isAuthor = (session?.user as any)?.id === comment.authorId;

  if (collapsed) {
    return (
      <div className="py-2 pl-2 border-l-2 border-slate-700 cursor-pointer text-slate-500 text-xs italic" onClick={() => setCollapsed(false)}>
        Collapsed ({comment.children.length} replies)
      </div>
    );
  }

  return (
    <div className={`mt-4 ${depth > 0 ? 'ml-4 pl-4 border-l border-slate-700' : ''}`}>
      <div className="flex items-start space-x-2">
        <div className="flex-col items-center space-y-1 pt-1">
          <VoteButton postId={null} commentId={comment.id} initialCount={score} initialUserVote={userVote} />
          <button onClick={() => setCollapsed(true)} className="text-slate-600 hover:text-slate-400 text-xs">[-]</button>
        </div>

        <div className="flex-1">
          <div className="flex items-baseline space-x-2 text-xs text-slate-400">
            <span className="font-bold text-slate-200">{comment.deleted ? '[deleted]' : (comment.author.name || 'Anonymous')}</span>
            {!comment.deleted && <span className="bg-slate-800 px-1 rounded">{comment.author.clusterLabel || 'Observer'}</span>}
            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>

          {isEditing ? (
             <form onSubmit={handleEdit} className="mt-2">
               <textarea
                 className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                 value={editContent}
                 onChange={e => setEditContent(e.target.value)}
               />
               <div className="flex space-x-2 mt-2">
                 <button type="submit" className="text-xs bg-green-600 px-2 py-1 rounded text-white">Save</button>
                 <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-slate-400">Cancel</button>
               </div>
             </form>
          ) : (
             <div className={`mt-1 text-sm whitespace-pre-wrap ${comment.deleted ? 'text-slate-500 italic' : 'text-slate-300'}`}>{comment.content}</div>
          )}

          {!comment.deleted && (
          <div className="mt-2 flex items-center space-x-4 text-xs text-slate-500">
            <button onClick={() => setReplyOpen(!replyOpen)} className="hover:text-white font-bold">Reply</button>
            {isAuthor && (
              <>
                <button onClick={() => setIsEditing(true)} className="hover:text-white">Edit</button>
                <button onClick={handleDelete} className="hover:text-red-400">Delete</button>
              </>
            )}
          </div>
          )}

          {replyOpen && (
            <form onSubmit={handleReply} className="mt-2">
              <textarea 
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                rows={3}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder="What do you think?"
              />
              <div className="flex justify-end mt-2 space-x-2">
                 <button type="button" onClick={() => setReplyOpen(false)} className="text-slate-400 text-xs">Cancel</button>
                 <button type="submit" className="bg-blue-600 px-3 py-1 rounded text-white text-xs font-bold">Post Reply</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Children */}
      {comment.children.map(child => (
        <CommentNode key={child.id} comment={child} depth={depth + 1} />
      ))}
    </div>
  );
}
