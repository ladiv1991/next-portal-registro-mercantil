'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /acceso redirect page.
 *
 * The portal is a single-page app rooted at `/` (src/app/page.tsx) that swaps
 * sections via client-side state. There is no standalone `/acceso` route — the
 * AccesoSection (CMS login) is a section id handled by the root page.
 *
 * This page bridges the URL `/acceso` to the section: it stores the pending
 * section in sessionStorage (read by the root page's useState initializer) and
 * redirects to `/`. The root page then renders AccesoSection automatically.
 */
export default function AccesoRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('navigateToSection', 'acceso');
    }
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#1A1A1A]/20 border-t-navy animate-spin" />
        <p className="text-sm text-muted-foreground">Redirigiendo al acceso…</p>
      </div>
    </div>
  );
}