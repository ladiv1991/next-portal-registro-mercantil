'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, FileText, ExternalLink } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const LEGAL_FRAMEWORK = [
  {
    category: 'Leyes',
    items: [
      'Ley No. 48/84 - Ley de las Sociedades Mercantiles',
      'Ley No. 118/2013 - Ley de la Inversión Extranjera (VUCE)',
      'Ley No. 107/2016 - Ley del Registro Mercantil',
      'Código de Comercio de Cuba',
    ],
  },
  {
    category: 'Decretos Ley',
    items: [
      'Decreto Ley No. 354/2019 - Reglamento del Registro Mercantil',
      'Decreto Ley No. 349/2019 - Solicitud de Primera Inscripción de un Sujeto',
    ],
  },
  {
    category: 'Resoluciones',
    items: [
      'Resolución No. 120/2020 - Normas Procedimentales',
      'Resolución No. 85/2021 - Tarifa de Derechos',
      'Resolución No. 45/2023 - Digitalización de Trámites',
      'Resolución No. 92/2024 - Estado de Situación Digitales',
    ],
  },
  {
    category: 'Instrucciones',
    items: [
      'Instrucción No. 01/2024 - Procedimiento de Constitución Digital',
      'Instrucción No. 02/2024 - Modificaciones Societarias',
      'Instrucción No. 03/2024 - Depósito de Estado de Situación',
    ],
  },
];

export default function LegalFramework() {
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
          {LEGAL_FRAMEWORK.map((category) => (
            <AccordionItem key={category.category} value={category.category}>
              <AccordionTrigger className="text-[#1A1A1A] font-semibold hover:no-underline">
                {category.category}
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {category.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#1A1A1A] cursor-pointer transition-colors">
                      <FileText className="w-4 h-4 text-[#9E3A2E] shrink-0" />
                      {item}
                      <ExternalLink className="w-3 h-3 ml-auto" />
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
