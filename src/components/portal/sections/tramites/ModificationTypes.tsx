'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PenTool, CircleDollarSign, MapPin, UserCog, Target, Layers } from 'lucide-react';
import RefreshCw from '../RefreshCw';

const MODIFICATION_TYPES = [
  { title: 'Modificación de Capital', description: 'Aumento o reducción del capital social', icon: CircleDollarSign },
  { title: 'Cambio de Domicilio', description: 'Traslado del domicilio social a nueva dirección', icon: MapPin },
  { title: 'Representantes', description: 'Nombramiento, revocación o sustitución de representantes', icon: UserCog },
  { title: 'Objeto Social', description: 'Modificación del objeto social de la sociedad', icon: Target },
  { title: 'Fusión', description: 'Fusión de dos o más sociedades mercantiles', icon: Layers },
  { title: 'Transformación', description: 'Cambio de tipo societario', icon: RefreshCw },
];

export default function ModificationTypes() {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-[var(--rm-text)] mb-4 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-[var(--rm-primary)]" />
        Tipos de Modificaciones Societarias
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODIFICATION_TYPES.map((mod) => (
          <Card key={mod.title} className="glass-card-inner cursor-pointer overflow-hidden">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--rm-primary)]/10 flex items-center justify-center shrink-0">
                <mod.icon className="w-5 h-5 text-[var(--rm-text)]" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-[var(--rm-text)]">{mod.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
