'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
} from 'recharts';

const CHART_SOCIEDADES = [
  { name: 'SRL', value: 18450, color: '#1A1A1A' },
  { name: 'SA', value: 12040, color: '#EDE0D4' },
  { name: 'Cooperativa', value: 6780, color: '#9E3A2E' },
  { name: 'Estatal', value: 4560, color: '#4A90D9' },
  { name: 'Mixta', value: 2350, color: '#2D8B55' },
  { name: 'Natural', value: 1100, color: '#8B5CF6' },
];

export default function SocietiesPieChart() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <PieChartIcon className="w-5 h-5 text-cuban-red" />
          <CardTitle className="text-navy">Sociedades Activas por Tipo</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={CHART_SOCIEDADES}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ strokeWidth: 1 }}
            >
              {CHART_SOCIEDADES.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <RechartsTooltip
              formatter={(value: number) => value.toLocaleString('es-ES')}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E2E6EA' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
