'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, FileText, ExternalLink, CalendarDays } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface RegulationItem {
  id: string;
  title: string;
  type: string;
  number?: string;
  description?: string;
  content?: string;
  effectiveDate?: string;
}

const FALLBACK_FRAMEWORK = [
  { category: 'Marco legal', items: ['Decreto-Ley No. 226/2001 — Del Registro Mercantil'] },
  { category: 'Reglamento', items: ['Resolución No. 230/2002 — Reglamento del Registro Mercantil'] },
  { category: 'Tarifas', items: ['Resolución No. 51/2021 — Tarifas del Registro Mercantil'] },
  { category: 'Estadísticas', items: ['Extracto estadístico SIEC — Granma, febrero-marzo 2026'] },
];

export default function LegalFramework({ regulations }: { regulations: RegulationItem[] }) {
  const grouped: Record<string, RegulationItem[]> = regulations.length > 0
    ? regulations.reduce<Record<string, RegulationItem[]>>((groups, regulation) => {
        const category = regulation.type || 'Normativa';
        (groups[category] ||= []).push(regulation);
        return groups;
      }, {})
    : FALLBACK_FRAMEWORK.reduce<Record<string, RegulationItem[]>>((groups, category) => {
        groups[category.category] = category.items.map((title, index) => ({
          id: `${category.category}-${index}`,
          title,
          type: category.category,
        }));
        return groups;
      }, {});

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-2">
          <Gavel className="w-5 h-5 text-[#9E3A2E]" />
          <CardTitle className="text-[#1A1A1A]">Marco Legal</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <Accordion type="multiple" className="w-full">
          {Object.entries(grouped).map(([category, items]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-[#1A1A1A] font-semibold hover:no-underline">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="rounded-lg border border-[#D6C9BA] p-3 text-sm text-muted-foreground transition-colors hover:border-[#9E3A2E]">
                      <FileText className="w-4 h-4 text-[#9E3A2E] shrink-0" />
                      <div className="mt-2">
                        <p className="font-semibold text-[#1A1A1A]">{item.title}</p>
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
