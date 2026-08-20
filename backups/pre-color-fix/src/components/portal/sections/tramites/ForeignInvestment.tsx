'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe2, Clock } from 'lucide-react';
import { Banknote } from 'lucide-react';

const INVESTMENTS = [
  { title: 'Oficina de Representación', desc: 'Presencia comercial sin actividad económica directa. Ventana de conexión con el mercado cubano.', time: '30 días', cost: '2,000 CUP' },
  { title: 'Sucursal', desc: 'Establecimiento permanente con actividad económica en territorio nacional cubano.', time: '45 días', cost: '3,500 CUP' },
  { title: 'Contrato de Agencia', desc: 'Representación comercial de empresas extranjeras para la comercialización de productos y servicios.', time: '20 días', cost: '1,000 CUP' },
  { title: 'Empresa Mixta', desc: 'Constitución de sociedad con capital cubano y extranjero. Regulada por la Ley 118/2013.', time: '45 días', cost: '5,000 CUP' },
];

export default function ForeignInvestment() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe2 className="w-5 h-5 text-cuban-red" />
          <CardTitle className="text-navy">Inversión Extranjera</CardTitle>
        </div>
        <CardDescription>Modalidades de inversión extranjera registrables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INVESTMENTS.map((inv) => (
            <div key={inv.title} className="glass-card-inner p-4">
              <h4 className="font-bold text-navy">{inv.title}</h4>
              <p className="text-sm text-muted-foreground mt-2">{inv.desc}</p>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{inv.time}</span>
                <span className="flex items-center gap-1"><Banknote className="w-3 h-3" />{inv.cost}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
