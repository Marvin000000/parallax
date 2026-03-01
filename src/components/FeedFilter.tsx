'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export function FeedFilter({ popularTags }: { popularTags: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // State for selections
  const currentView = searchParams.get('lens') || 'all';
  const tagsParam = searchParams.get('tags');
  const selectedTags = tagsParam ? (Array.isArray(tagsParam) ? tagsParam : tagsParam.split(',')) : [];

  const [customTag, setCustomTag] = useState('');

  // Persist selections via local storage and sync with URL
  useEffect(() => {
    // If no params in URL but we have them in local storage, apply them
    if (!searchParams.has('lens') && !searchParams.has('tags')) {
      const savedLens = localStorage.getItem('parallax_lens');
      const savedTags = localStorage.getItem('parallax_tags');
      
      if (savedLens || savedTags) {
        const params = new URLSearchParams();
        if (savedLens) params.set('lens', savedLens);
        if (savedTags) params.set('tags', savedTags);
        router.replace(`${pathname}?${params.toString()}`);
      }
    }
  }, [pathname, router, searchParams]);

  const updateView = (view: 'all' | 'mine') => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('lens', view);
    localStorage.setItem('parallax_lens', view);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const toggleTag = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
      
    const params = new URLSearchParams(searchParams.toString());
    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
      localStorage.setItem('parallax_tags', newTags.join(','));
    } else {
      params.delete('tags');
      localStorage.removeItem('parallax_tags');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const addCustomTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTag && !selectedTags.includes(customTag)) {
      toggleTag(customTag);
    }
    setCustomTag('');
  };

  // Combine popular tags with any custom selected ones that aren't in popular
  const displayTags = Array.from(new Set([...popularTags, ...selectedTags]));

  return (
    <div className="flex flex-col space-y-4 mb-6 w-full max-w-2xl">
      <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg text-sm max-w-xs">
        <button
          onClick={() => updateView('all')}
          className={`flex-1 py-1.5 px-3 rounded transition-colors ${
            currentView === 'all' 
              ? 'bg-slate-600 text-white font-medium shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Lenses
        </button>
        <button
          onClick={() => updateView('mine')}
          className={`flex-1 py-1.5 px-3 rounded transition-colors ${
            currentView === 'mine' 
              ? 'bg-blue-600 text-white font-medium shadow-sm' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          My Lens
        </button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {displayTags.map(tag => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              selectedTags.includes(tag)
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
            }`}
          >
            #{tag}
          </button>
        ))}
        
        <form onSubmit={addCustomTag} className="flex ml-2">
          <input 
            type="text" 
            placeholder="Add tag..." 
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-l px-2 py-1 text-xs text-white outline-none focus:border-purple-500 w-24"
          />
          <button type="submit" className="bg-slate-700 border border-slate-700 border-l-0 rounded-r px-2 py-1 text-xs hover:bg-slate-600">
            +
          </button>
        </form>
      </div>
    </div>
  );
}
