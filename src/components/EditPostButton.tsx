'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { EditPostModal } from '@/components/EditPostModal';

export function EditPostButton({ post }: { post: any }) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts?id=${post.id}`, { method: 'DELETE' });
    window.location.href = '/'; // Redirect to home
  };

  // Only show if author
  if (session?.user?.id !== post.authorId) return null;

  return (
    <>
      <button 
        onClick={() => setIsEditing(true)}
        className="text-xs text-slate-500 hover:text-white underline ml-4"
      >
        Edit
      </button>
      <button 
        onClick={handleDelete}
        className="text-xs text-red-500 hover:text-red-400 underline ml-2"
      >
        Delete
      </button>

      {isEditing && (
        <EditPostModal 
          post={{ id: post.id, title: post.title, url: post.url, content: post.content }} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </>
  );
}
