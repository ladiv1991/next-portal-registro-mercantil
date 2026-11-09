'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SitePagesSection() {
  const router = useRouter();

  useEffect(() => {
    router.push('/legal');
  }, [router]);

  return null;
}