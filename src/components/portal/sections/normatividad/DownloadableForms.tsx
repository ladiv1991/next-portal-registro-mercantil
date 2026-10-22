'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';

const FORMS = [
  { name: 'Solicitud de Primera Inscripción de un Sujeto', format: 'PDF editable', size: '245 KB' },
  { name: 'Modelo de Estatutos Sociales - SRL', format: 'PDF', size: '180 KB' },
  { name: 'Modelo de Estatutos Sociales - SA', format: 'PDF', size: '210 KB' },
  { name: 'Solicitud de Modificación Societaria', format: 'PDF editable', size: '198 KB' },
  { name: 'Declaración de Estado de Situación', format: 'Excel', size: '125 KB' },
  { name: 'Solicitud de Certificación Registral', format: 'PDF editable', size: '95 KB' },
  { name: 'Solicitud de Nota Simple', format: 'PDF editable', size: '78 KB' },
  { name: 'Modelo Acta Constitutiva - Cooperativa', format: 'PDF', size: '220 KB' },
];

export default function DownloadableForms() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[var(--rm-primary)]" />
          <CardTitle className="text-[var(--rm-text)]">Formularios y Plantillas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FORMS.map((form) => (
            <div key={form.name} className="flex items-center justify-between p-3 glass-card-inner hover:border-[#7A2A1E]/30 hover:bg-secondary/50 transition-colors cursor-pointer group">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm text-[var(--rm-text)] group-hover:text-[var(--rm-primary)] transition-colors">{form.name}</p>
                <p className="text-xs text-muted-foreground">{form.format} • {form.size}</p>
              </div>
              <Download className="w-4 h-4 text-muted-foreground group-hover:text-[var(--rm-primary)] shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
