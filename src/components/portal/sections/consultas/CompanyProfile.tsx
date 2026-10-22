'use client';

import {
  Building2, Users, FileText, Award, Badge, Crown, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortalAuth } from '@/hooks/use-portal-auth';

interface CompanyProfileProps {
  company: {
    nire: string;
    denomination: string;
    type: string;
    province: string;
    activity: string;
    status: string;
    constitution: string;
  };
}

export default function CompanyProfile({ company }: CompanyProfileProps) {
  const { hasActiveSubscription, showPremiumModal } = usePortalAuth();
  const hasPremium = hasActiveSubscription();

  const handlePremiumAction = (feature: string) => {
    if (!hasPremium) {
      showPremiumModal(feature);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="glass-card-inner">
        <h3 className="font-bold text-[var(--rm-text)] mb-3 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[var(--rm-primary)]" />
          Nota Simple Informativa
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-muted-foreground">Denominación:</span>
            <span className="font-medium">{company.denomination}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-muted-foreground">NIRE:</span>
            <span className="font-mono">{company.nire}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-muted-foreground">Tipo:</span>
            <span>{company.type}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-muted-foreground">Provincia:</span>
            <span>{company.province}</span>
          </div>

          {/* Información Premium */}
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-muted-foreground">Actividad:</span>
            {hasPremium ? (
              <span>{company.activity}</span>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-yellow-500" />
                <Button
                  variant="link"
                  className="h-auto p-0 text-yellow-600 hover:text-yellow-700"
                  onClick={() => handlePremiumAction('información completa')}
                >
                  Ver actividad
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-muted-foreground">Constitución:</span>
            {hasPremium ? (
              <span>{company.constitution}</span>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-yellow-500" />
                <Button
                  variant="link"
                  className="h-auto p-0 text-yellow-600 hover:text-yellow-700"
                  onClick={() => handlePremiumAction('fecha de constitución')}
                >
                  Ver fecha
                </Button>
              </div>
            )}
          </div>

          {/* Más información básica gratuita */}
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Estado:</span>
            <span className={`font-medium ${company.status === 'Vigente' ? 'text-green-600' : 'text-red-600'}`}>
              {company.status}
            </span>
          </div>
        </div>
      </div>

      {/* Panel de Representantes - Premium */}
      <div className="glass-card-inner">
        <h3 className="font-bold text-[var(--rm-text)] mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-[var(--rm-primary)]" />
          Representantes
          {!hasPremium && <Crown className="w-4 h-4 text-yellow-500" />}
        </h3>

        {hasPremium ? (
          <>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>Carlos Manuel Rodríguez Vega</span>
                <Badge variant="outline">Presidente</Badge>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span>María Elena García Pérez</span>
                <Badge variant="outline">Vicepresidenta</Badge>
              </div>
              <div className="flex justify-between py-2">
                <span>Juan Pablo López Hernández</span>
                <Badge variant="outline">Secretario</Badge>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="bg-[var(--rm-primary)] text-white hover:bg-[var(--rm-primary)]/90">
                <FileText className="w-3 h-3 mr-1" />
                Nota Simple
              </Button>
              <Button size="sm" variant="outline" className="border-[var(--rm-text)] text-[var(--rm-text)]">
                <Award className="w-3 h-3 mr-1" />
                Certificación
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-muted-foreground mb-3">
              La información de representantes y documentos requiere una suscripción premium.
            </p>
            <Button
              onClick={() => handlePremiumAction('información de representantes')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Ver Planes Premium
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
