'use client';

import { Check, Zap, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
  isActive: boolean;
  recommended?: boolean;
}

interface PricingPlansProps {
  plans?: PricingPlan[];
  onSelectPlan?: (plan: PricingPlan) => void;
  isLoading?: boolean;
  hideDescription?: boolean;
}

export function PricingPlans({
  plans = [],
  onSelectPlan,
  isLoading = false,
  hideDescription = false,
}: PricingPlansProps) {
  const [allPlans, setAllPlans] = useState<PricingPlan[]>(() => plans);

  useEffect(() => {
    if (plans.length > 0) {
      return;
    }

    let isActive = true;

    fetch('/api/payment/plans')
      .then((res) => res.ok ? res.json() : Promise.resolve(null))
      .then((data) => {
        if (!isActive) return;
        setAllPlans(data?.plans || data?.data || []);
      })
      .catch(() => {
        if (!isActive) return;
        setAllPlans([]);
      });

    return () => {
      isActive = false;
    };
  }, [plans.length]);

  const displayPlans = plans.length > 0 ? plans : allPlans.length > 0 ? allPlans : getDefaultPlans();
  const sortedPlans = [...displayPlans].sort((a, b) => a.price - b.price);
  const recommended = sortedPlans[1] || sortedPlans[0];

  const iconMap: Record<string, React.ReactNode> = {
    'Plan Básico': <Shield className="w-7 h-7 sm:w-8 sm:h-8" />,
    'Plan Premium': <Zap className="w-7 h-7 sm:w-8 sm:h-8" />,
    'Plan Empresarial': <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8" />,
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8">
      {!hideDescription && (
        <div className="text-center space-y-2 px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
            Planes de Acceso
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-snug">
            Elige el plan perfecto para tu negocio y accede a todas las funciones del Registro Mercantil.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 px-2 sm:px-0">
        {sortedPlans.map((plan) => {
          const isRecommended = plan.id === recommended.id;
          return (
            <div
              key={plan.id}
              className={`relative transition-all duration-300 ${
                isRecommended ? 'lg:scale-[1.03]' : ''
              }`}
            >
              {isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-0.5 sm:px-4 sm:py-1 rounded-full text-[10px] sm:text-sm font-semibold whitespace-nowrap">
                    ⭐ Recomendado
                  </span>
                </div>
              )}

              <Card
                className={`h-full flex flex-col transition-all duration-300 hover:shadow-xl p-4 sm:p-5 lg:p-7 rounded-xl sm:rounded-2xl ${
                  isRecommended
                    ? 'ring-2 ring-amber-500 border-amber-500/50 bg-gradient-to-br from-amber-50 to-white'
                    : 'hover:border-gray-300'
                }`}
              >
                {/* Plan Icon and Title */}
                <div className="text-center mb-4 sm:mb-5 lg:mb-6">
                  <div className="flex justify-center mb-2 sm:mb-3">
                    {iconMap[plan.name]}
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1 sm:mb-1.5 break-words leading-tight">{plan.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 break-words leading-snug">{plan.description}</p>
                </div>

                {/* Pricing */}
                <div className="text-center py-4 sm:py-5 lg:py-6 border-y border-gray-200">
                  <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                      {plan.price.toLocaleString('es-ES')}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">{plan.currency}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2 break-words">
                    por {plan.duration} {plan.duration === 1 ? 'día' : 'días'}
                  </p>
                </div>

                {/* Features */}
                <div className="flex-1 py-4 sm:py-5 lg:py-6 space-y-2 sm:space-y-2.5 min-w-0">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-2.5 min-w-0">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-700 break-words leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => onSelectPlan?.(plan)}
                  disabled={isLoading}
                  className={`w-full py-2.5 sm:py-3 text-sm sm:text-base font-semibold transition-all rounded-lg sm:rounded-xl ${
                    isRecommended
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {isLoading ? 'Cargando...' : 'Seleccionar Plan'}
                </Button>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-5 sm:pt-6 lg:pt-8 border-t border-gray-200 px-2 sm:px-0">
        {[
          { title: 'Sin tarjeta de crédito', desc: 'Comienza gratis, paga cuando estés listo' },
          { title: 'Cancela cuando quieras', desc: 'Sin contratos ni compromisos a largo plazo' },
          { title: 'Soporte 24/7', desc: 'Equipo siempre disponible para ayudarte' },
        ].map((item, idx) => (
          <div key={idx} className="text-center px-1 sm:px-2">
            <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base break-words">{item.title}</p>
            <p className="text-[11px] sm:text-xs lg:text-sm text-gray-600 break-words leading-snug">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDefaultPlans(): PricingPlan[] {
  return [
    {
      id: '1', name: 'Plan Básico', description: 'Perfecto para comenzar',
      price: 500, currency: 'CUP', duration: 30, isActive: true,
      features: ['Búsqueda ilimitada de sociedades', 'Información pública completa', 'Consulta de estado registral', 'Historial básico de datos públicos'],
    },
    {
      id: '2', name: 'Plan Premium', description: 'Lo más popular',
      price: 1500, currency: 'CUP', duration: 30, isActive: true, recommended: true,
      features: ['Búsqueda ilimitada de sociedades', 'Información completa de representantes', 'Descarga de certificaciones', 'Notas simples sin límite', 'Historial completo registral', 'Seguimiento de trámites en línea'],
    },
    {
      id: '3', name: 'Plan Empresarial', description: 'Para profesionales',
      price: 3500, currency: 'CUP', duration: 90, isActive: true,
      features: ['Todo del Plan Premium', 'Búsqueda y monitoreo automático', 'Acceso API para integración', 'Reportes personalizados', 'Apoyo técnico prioritario', 'Gestión de múltiples usuarios (hasta 10)'],
    },
  ];
}
