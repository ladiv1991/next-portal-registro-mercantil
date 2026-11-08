'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, FileText, ExternalLink, CalendarDays } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import GacetaLink from './GacetaLink';

interface RegulationItem {
  id: string;
  title: string;
  type: string;
  number?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  effectiveDate?: string;
  category?: string;
  order: number;
  visible: boolean;
}

const FALLBACK_FRAMEWORK = [
  { category: 'Marco legal', items: [
    { id: 'dl-226-2001', name: 'Decreto-Ley No. 226/2001 — Del Registro Mercantil (GOC-2021-690-ES4)', gaceta: 'GOC-2021-690-ES4' },
    { id: 'dl-133-2026', name: 'Decreto-Ley No. 133/2026 — Modifica DL 88 (MIPYMES), DL 89 (CNA) y DL 90 (TCP)', gaceta: 'Gaceta Oficial No. 71 Ordinaria de 2026' },
    { id: 'dl-120-2026', name: 'Decreto-Ley No. 120/2026 — Pendiente de publicación completa', gaceta: 'Próxima publicación' },
  ]},
  { category: 'Reglamento', items: [
    { id: 'res-230-2002', name: 'Resolución No. 230/2002 — Reglamento del Registro Mercantil', gaceta: 'Gaceta Oficial No. 78' },
  ]},
  { category: 'Tarifas', items: [
    { id: 'res-51-2021', name: 'Resolución No. 51/2021 — Tarifas del Registro Mercantil', gaceta: 'Gaceta Oficial No. 82' },
  ]},
  { category: 'Estadísticas', items: [
    { id: 'extracto-siec', name: 'Extracto estadístico SIEC — Granma, febrero-marzo 2026', gaceta: '—' },
  ]},
];

export default function LegalFramework({ regulations }: { regulations: RegulationItem[] }) {
  const grouped: Record<string, RegulationItem[]> = regulations.length > 0
    ? regulations.reduce<Record<string, RegulationItem[]>>((groups, regulation) => {
        const category = regulation.type || 'Normativa';
        (groups[category] ||= []).push(regulation);
        return groups;
      }, {})
    : FALLBACK_FRAMEWORK.reduce<Record<string, RegulationItem[]>>((groups, category) => {
        groups[category.category] = category.items.map((item, index) => ({
          id: item.id,
          title: item.name,
          type: category.category,
        }));
        return groups;
      }, {});

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-[var(--rm-primary)]" />
          <CardTitle className="text-[var(--rm-text)]">Marco Legal</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Accordion type="multiple" className="w-full">
          {Object.entries(grouped).map(([category, items]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-[var(--rm-text)] font-semibold hover:no-underline">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="rounded-lg border border-[var(--rm-muted)]/30 p-3 text-sm text-muted-foreground transition-colors hover:border-[var(--rm-primary)]">
                      <FileText className="w-4 h-4 text-[var(--rm-primary)] shrink-0" />
                      <div className="mt-2">
                        <p className="font-semibold text-[var(--rm-text)]">
                          <GacetaLink name={item.title} gacetaId={item.id} />
                        </p>
                        {item.description && <p className="mt-1 leading-relaxed">{item.description}</p>}
                        {item.effectiveDate && (
                          <p className="mt-2 flex items-center gap-1 text-xs"><CalendarDays className="h-3 w-3" /> Vigencia/publicación: {item.effectiveDate}</p>
                        )}
                        {item.content && <p className="mt-2 whitespace-pre-line leading-relaxed">{item.content}</p>}
                      </div>
                      {item.id.startsWith('http') && <ExternalLink className="w-3 h-3 ml-auto" />}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}