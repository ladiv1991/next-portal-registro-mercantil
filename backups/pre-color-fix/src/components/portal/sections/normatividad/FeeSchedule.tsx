'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Banknote } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const FEE_SCHEDULE = [
  { procedure: 'Constitución SRL', cost: '500 CUP' },
  { procedure: 'Constitución SA', cost: '1,200 CUP' },
  { procedure: 'Constitución Cooperativa', cost: '300 CUP' },
  { procedure: 'Modificación de Capital', cost: '400 CUP' },
  { procedure: 'Cambio de Domicilio', cost: '200 CUP' },
  { procedure: 'Cambio de Representantes', cost: '300 CUP' },
  { procedure: 'Modificación Objeto Social', cost: '350 CUP' },
  { procedure: 'Fusión de Sociedades', cost: '1,500 CUP' },
  { procedure: 'Transformación Societaria', cost: '1,000 CUP' },
  { procedure: 'Certificación Completa', cost: '250 CUP' },
  { procedure: 'Nota Simple', cost: '50 CUP' },
  { procedure: 'Depósito Cuentas Anuales', cost: '150 CUP' },
  { procedure: 'Oficina Representación (Ext)', cost: '2,000 CUP' },
  { procedure: 'Sucursal (Ext)', cost: '3,500 CUP' },
];

export default function FeeSchedule() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="p-6">
        <div className="flex items-center gap-2">
          <Banknote className="w-5 h-5 text-cuban-red" />
          <CardTitle className="text-navy">Arancel de Derechos 2025</CardTitle>
        </div>
        <CardDescription>Tarifas vigentes para los servicios registrales</CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="overflow-x-auto glass-card-inner">
          <Table>
            <TableHeader>
              <TableRow className="bg-navy/5 hover:bg-navy/5">
                <TableHead className="font-semibold text-navy">Procedimiento</TableHead>
                <TableHead className="font-semibold text-navy text-right">Costo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {FEE_SCHEDULE.map((fee) => (
                <TableRow key={fee.procedure}>
                  <TableCell className="text-sm">{fee.procedure}</TableCell>
                  <TableCell className="text-right font-semibold text-navy">{fee.cost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
