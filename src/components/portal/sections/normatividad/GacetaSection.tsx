'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { GACETA_REGISTRY } from '@/data/gaceta-registry';

const GACETA_ITEMS = GACETA_REGISTRY.filter((e) => e.id.startsWith('gaceta-'));

export default function GacetaSection() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-[var(--rm-primary)]" />
          <CardTitle className="text-[var(--rm-text)]">Gaceta Oficial</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-3">
          {GACETA_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={`#normatividad?gaceta=${item.id}`}
              className="flex items-start justify-between gap-3 p-4 glass-card-inner hover:border-[#7A2A1E]/30 transition-colors cursor-pointer group"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[var(--rm-primary)] group-hover:underline">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.gaceta} • {item.date}
                </p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-[var(--rm-primary)] transition-colors" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}