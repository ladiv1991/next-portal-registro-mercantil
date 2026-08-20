'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Clock, Stamp, Upload, FileCheck, CreditCard, Eye, Award } from 'lucide-react';

const CONSTITUTION_STEPS = [
  { step: 1, title: 'Reserva de Denominación', description: 'Verifique y reserve el nombre de su sociedad', icon: Stamp, time: '1 día' },
  { step: 2, title: 'Carga de Documentos', description: 'Suba los documentos requeridos en formato digital', icon: Upload, time: '2-3 días' },
  { step: 3, title: 'Validación', description: 'El registrador revisa y valida la documentación', icon: FileCheck, time: '3-5 días' },
  { step: 4, title: 'Pago de Arancel', description: 'Realice el pago correspondiente en línea', icon: CreditCard, time: '1 día' },
  { step: 5, title: 'Seguimiento', description: 'Monitoree el estado de su trámite en tiempo real', icon: Eye, time: 'Continuo' },
  { step: 6, title: 'Certificación', description: 'Reciba su certificación registral digital', icon: Award, time: '1-2 días' },
];

export default function ConstitutionSteps() {
  return (
    <Card className="glass-card mb-10 overflow-hidden">
      <CardHeader className="bg-navy/5 rounded-t-xl">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-cuban-red" />
          <CardTitle className="text-navy">Proceso de Constitución de Sociedades - 6 Pasos</CardTitle>
        </div>
        <CardDescription>Siga estos pasos para constituir su sociedad de forma digital</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CONSTITUTION_STEPS.map((step) => (
            <div key={step.step} className="glass-card-inner relative p-4">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gold text-navy flex items-center justify-center text-sm font-bold">
                {step.step}
              </div>
              <div className="mt-2">
                <step.icon className="w-6 h-6 text-navy mb-2" />
                <h4 className="font-semibold text-navy">{step.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                <p className="text-xs text-cuban-red mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {step.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
