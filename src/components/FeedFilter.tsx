'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export function FeedFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentView = searchParams.get('tribe') || 'all';

  const updateView = (view: 'all' | 'mine') => {
    const params = new URLSearchParams(searchParams);
    params.set('tribe', view);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex space-x-1 bg-slate-800 p-1 rounded-lg text-sm mb-6 max-w-xs">
      <button
        onClick={() => updateView('all')}
        className={`flex-1 py-1.5 px-3 rounded transition-colors ${
          currentView === 'all' 
            ? 'bg-slate-600 text-white font-medium shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        All Tribes
      </button>
      <button
        onClick={() => updateView('mine')}
        className={`flex-1 py-1.5 px-3 rounded transition-colors ${
          currentView === 'mine' 
            ? 'bg-blue-600 text-white font-medium shadow-sm' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        My Tribe
      </button>
    </div>
  );
}
