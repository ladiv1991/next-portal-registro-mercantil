'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
} from 'recharts';

const CHART_CONST_CANCEL = [
  { year: '2020', constituciones: 2100, cancelaciones: 890 },
  { year: '2021', constituciones: 2400, cancelaciones: 1020 },
  { year: '2022', constituciones: 2800, cancelaciones: 1150 },
  { year: '2023', constituciones: 3200, cancelaciones: 980 },
  { year: '2024', constituciones: 3600, cancelaciones: 870 },
  { year: '2025', constituciones: 3840, cancelaciones: 650 },
];

export default function ConstitutionsBarChart() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--rm-primary)]" />
          <CardTitle className="text-[var(--rm-text)]">Constituciones vs Cancelaciones</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={CHART_CONST_CANCEL}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E6EA" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E6EA' }} />
            <Legend />
            <Bar dataKey="constituciones" name="Constituciones" fill="var(--rm-text)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelaciones" name="Cancelaciones" fill="var(--rm-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
