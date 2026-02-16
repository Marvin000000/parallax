'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EditPostModalProps {
  post: { id: string; title: string; url: string | null; content: string | null };
  onClose: () => void;
}

export function EditPostModal({ post, onClose }: EditPostModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [url, setUrl] = useState(post.url || '');
  const [content, setContent] = useState(post.content || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, title, url, content }),
      });

      if (!res.ok) throw new Error('Failed to update');
      
      router.refresh();
      onClose();
    } catch (err) {
      alert('Error updating post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full p-6 border border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Edit Post</h2>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">URL</label>
            <input 
              type="url" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Content (Optional)</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
              rows={5}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
