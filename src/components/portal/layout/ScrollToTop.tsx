'use client';

import React, { useCallback } from 'react';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopProps {
  visible: boolean;
}

export default function ScrollToTop({ visible }: ScrollToTopProps) {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-[5.5rem] z-40 w-10 h-10 rounded-full bg-[#7A2A1E] text-white shadow-lg flex items-center justify-center hover:bg-[#7A2A1E]-light transition-colors"
    >
      <ChevronUp className="w-5 h-5" />
    </button>
  );
}
