'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { EditPostModal } from '@/components/EditPostModal';

export function EditPostButton({ post }: { post: any }) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);

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

      {isEditing && (
        <EditPostModal 
          post={{ id: post.id, title: post.title, url: post.url, content: post.content }} 
          onClose={() => setIsEditing(false)} 
        />
      )}
    </>
  );
}
