'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked, ExternalLink } from 'lucide-react';

const GACETA_ITEMS = [
  { number: 'Gaceta Oficial No. 87', date: '10 Enero 2025', title: 'Resolución sobre digitalización de trámites registrales' },
  { number: 'Gaceta Oficial No. 85', date: '28 Diciembre 2024', title: 'Decreto Ley de actualización del Registro Mercantil' },
  { number: 'Gaceta Oficial No. 82', date: '15 Noviembre 2024', title: 'Arancel de derechos registrales 2025' },
  { number: 'Gaceta Oficial No. 78', date: '20 Octubre 2024', title: 'Normas procedimentales para modificaciones societarias' },
];

export default function GacetaSection() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-[#9E3A2E]" />
          <CardTitle className="text-[#1A1A1A]">Gaceta Oficial</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-3">
          {GACETA_ITEMS.map((item, i) => (
            <div key={i} className="p-4 glass-card-inner hover:border-[#7A2A1E]/30 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm text-[#1A1A1A]">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.number} • {item.date}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
