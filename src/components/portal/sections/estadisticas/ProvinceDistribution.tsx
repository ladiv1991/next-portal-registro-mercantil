'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Map as MapIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const PROVINCES_DATA = [
  { province: 'La Habana', count: 15200 },
  { province: 'Villa Clara', count: 4200 },
  { province: 'Santiago de Cuba', count: 3800 },
  { province: 'Matanzas', count: 3500 },
  { province: 'Holguín', count: 2800 },
  { province: 'Camagüey', count: 2400 },
  { province: 'Ciego de Ávila', count: 1900 },
  { province: 'Pinar del Río', count: 1700 },
  { province: 'Santa Clara', count: 1500 },
  { province: 'Granma', count: 1200 },
  { province: 'Sancti Spíritus', count: 1100 },
  { province: 'Las Tunas', count: 980 },
  { province: 'Cienfuegos', count: 850 },
  { province: 'Guantánamo', count: 720 },
  { province: 'Isla de la Juventud', count: 450 },
];

export default function ProvinceDistribution() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-[var(--rm-primary)]" />
          <CardTitle className="text-[var(--rm-text)]">Distribución Territorial por Provincia</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {PROVINCES_DATA.map((prov) => {
            const maxCount = PROVINCES_DATA[0].count;
            const width = (prov.count / maxCount) * 100;
            return (
              <div key={prov.province}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-[var(--rm-text)] font-medium">{prov.province}</span>
                  <span className="text-muted-foreground">{prov.count.toLocaleString('es-ES')}</span>
                </div>
                <Progress value={width} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
