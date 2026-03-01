'use client';

import { useState } from 'react';
import { SubmitPostModal } from '@/components/SubmitPostModal';

export function SubmitButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded shadow-lg transition-colors"
      >
        Post
      </button>
      
      {isOpen && <SubmitPostModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
