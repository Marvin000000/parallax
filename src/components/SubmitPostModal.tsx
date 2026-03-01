'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SubmitPostModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, imageUrl, content, tags: tagList }),
      });

      if (!res.ok) throw new Error('Failed to post');
      
      router.refresh(); // Refresh server component
      onClose();
    } catch (err) {
      alert('Error submitting post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg max-w-lg w-full p-6 border border-slate-700 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Submit to Parallax</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="Interesting title..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">URL (Optional)</label>
            <input 
              type="url" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Image URL (Optional)</label>
            <input 
              type="url" 
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="https://.../image.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Content (Optional)</label>
            <textarea 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="Post text or description..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Tags (comma separated)</label>
            <input 
              type="text" 
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
              placeholder="Tech, Politics, Future"
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
