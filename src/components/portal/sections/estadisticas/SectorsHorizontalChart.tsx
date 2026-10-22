'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';

const CHART_SECTORES = [
  { sector: 'Turismo y Hotelería', valor: 18.5 },
  { sector: 'Producción Alimentaria', valor: 15.2 },
  { sector: 'Construcción', valor: 12.8 },
  { sector: 'Tecnologías', valor: 10.4 },
  { sector: 'Transporte', valor: 8.6 },
  { sector: 'Salud y Farmacia', valor: 7.3 },
  { sector: 'Comercio', valor: 6.9 },
  { sector: 'Agroindustria', valor: 6.2 },
  { sector: 'Telecomunicaciones', valor: 5.8 },
  { sector: 'Energía', valor: 4.5 },
];

export default function SectorsHorizontalChart() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[var(--rm-primary)]" />
          <CardTitle className="text-[var(--rm-text)]">Sectores Económicos más Dinámicos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={CHART_SECTORES} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EA" />
            <XAxis type="number" tick={{ fontSize: 11 }} unit="%" />
            <YAxis type="category" dataKey="sector" tick={{ fontSize: 10 }} width={120} />
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E6EA' }} formatter={(v: number) => `${v}%`} />
            <Bar dataKey="valor" fill="var(--rm-primary-light)" radius={[0, 4, 4, 0]} name="Dinamismo" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
