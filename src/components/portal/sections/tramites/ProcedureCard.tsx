'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, ArrowRight, Stamp, Upload, FileCheck, CreditCard, Eye, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RefreshCw from '../RefreshCw';

const PROCEDURES = [
  {
    title: 'Solicitud de Primera Inscripción de un Sujeto',
    description: 'Constituya su sociedad de forma digital en 6 pasos simplificados',
    icon: Stamp,
    time: '15-30 días hábiles',
    cost: 'Según Res. 51/2021',
    color: 'text-[#9E3A2E]',
    bgColor: 'bg-[#7A2A1E]/10',
  },
  {
    title: 'Modificaciones Societarias',
    description: 'Actualice datos de su sociedad: capital, domicilio, representantes y más',
    icon: Upload,
    time: '5-15 días hábiles',
    cost: '180-300 CUP por acto',
    color: 'text-[#9E3A2E]',
    bgColor: 'bg-[#7A2A1E]/10',
  },
  {
    title: 'Depósito de Estado de Situación',
    description: 'Deposite las estado de situación de su sociedad conforme a la normativa vigente',
    icon: FileCheck,
    time: '3-7 días hábiles',
    cost: '150 - 800 CUP',
    color: 'text-[#1A1A1A]',
    bgColor: 'bg-[#1A1A1A]/10',
  },
  {
    title: 'Inversión Extranjera (VUCE)',
    description: 'Trámites para Oficinas de Representación, Sucursales y Contratos de Agencia',
    icon: CreditCard,
    time: '20-45 días hábiles',
    cost: '1,000 - 5,000 CUP',
    color: 'text-[#9E3A2E]',
    bgColor: 'bg-[#7A2A1E]/10',
  },
];

interface ProcedureCardProps {
  onIniciarTramite?: () => void;
}

export default function ProcedureCard({ onIniciarTramite }: ProcedureCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      {PROCEDURES.map((proc) => (
        <Card key={proc.title} className="glass-card-inner overflow-hidden">
          <div className="h-1 bg-[#7A2A1E]" />
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl ${proc.bgColor} flex items-center justify-center shrink-0`}>
                <proc.icon className={`w-7 h-7 ${proc.color}`} />
              </div>
              <div>
                <CardTitle className="text-xl text-[#1A1A1A]">{proc.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{proc.description}</p>
            <div className="flex gap-4 mb-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {proc.time}
              </div>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <Button
              className="bg-[#1A1A1A] hover:bg-[#1A1A1A]-light text-white"
              onClick={onIniciarTramite}
            >
              Iniciar Trámite
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
