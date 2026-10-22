'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Crown, X, Sparkles, Zap, Shield, BarChart3 } from 'lucide-react';
import { PricingPlan } from './PricingPlans';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredFeature?: string;
  portalUser?: any;
  onSelectPlan?: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'Plan Básico': <Shield className="w-6 h-6 sm:w-7 sm:h-7" />,
  'Plan Premium': <Zap className="w-6 h-6 sm:w-7 sm:h-7" />,
  'Plan Empresarial': <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7" />,
};

export default function PremiumModal({
  isOpen,
  onClose,
  requiredFeature,
  portalUser,
  onSelectPlan
}: PremiumModalProps) {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payment/plans');
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || data.data || []);
      }
    } catch { /* use defaults */ }
    finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = (plan: PricingPlan) => {
    if (onSelectPlan) onSelectPlan();
  };

  const displayPlans = plans.length > 0 ? plans : getDefaultPlans();
  const sortedPlans = [...displayPlans].sort((a, b) => a.price - b.price);
  const recommended = sortedPlans[1] || sortedPlans[0];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(15,27,45,0.85) 0%, rgba(30,30,30,0.90) 50%, rgba(158,58,46,0.6) 100%)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full flex flex-col overflow-hidden"
            style={{
              maxWidth: 'min(96vw, 1200px)',
              maxHeight: 'min(94vh, 820px)',
              borderRadius: 'clamp(12px, 2vw, 22px)',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(165deg, rgba(255,255,255,0.97) 0%, rgba(248,245,240,0.98) 100%)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.04) inset',
            }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top accent line */}
            <div className="h-[2px] w-full" style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--c-accent, var(--rm-primary)) 25%, var(--c-warm, var(--rm-primary-light)) 50%, var(--c-accent, var(--rm-primary)) 75%, transparent 100%)',
            }} />

            {/* Header */}
            <div className="flex items-start justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
              <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4 min-w-0 flex-1">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--c-accent, var(--rm-primary)), var(--c-warm, var(--rm-primary-light)))',
                    boxShadow: '0 4px 15px rgba(158,58,46,0.3)',
                  }}
                >
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg lg:text-2xl font-bold truncate" style={{ color: 'var(--c-navy, var(--rm-text))' }}>
                    Desbloquea Funciones Premium
                  </h2>
                  <p className="text-[11px] sm:text-xs lg:text-sm text-gray-500 mt-0.5 leading-snug">
                    Accede a todas las herramientas avanzadas del Registro Mercantil.
                    {requiredFeature && <> Para utilizar <span className="font-medium" style={{ color: 'var(--rm-primary)' }}>"{requiredFeature}"</span>, necesitas activar un plan.</>}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0 ml-2"
                aria-label="Cerrar"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-5 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
              {/* Plans Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-5 sm:mb-6" style={{ paddingBottom: '8px' }}>
                {sortedPlans.map((plan, idx) => {
                  const isRecommended = plan.id === recommended.id;
                  const PlanIcon = iconMap[plan.name] || <Shield className="w-6 h-6 sm:w-7 sm:h-7" />;

                  return (
                    <motion.div
                      key={plan.id}
                      className="pb-1 pt-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                    >
                      <div
                        className="h-full flex flex-col rounded-xl sm:rounded-2xl p-3.5 sm:p-4 lg:p-5 relative transition-transform duration-300 ease-out group"
                        style={{
                          background: isRecommended
                            ? 'linear-gradient(165deg, rgba(158,58,46,0.04) 0%, rgba(192,112,48,0.06) 100%)'
                            : 'rgba(255,255,255,0.8)',
                          border: isRecommended
                            ? '2px solid rgba(158,58,46,0.2)'
                            : '1px solid rgba(0,0,0,0.08)',
                          boxShadow: isRecommended
                            ? '0 8px 30px rgba(158,58,46,0.08), 0 2px 8px rgba(0,0,0,0.03)'
                            : '0 2px 8px rgba(0,0,0,0.03)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = isRecommended
                            ? '0 16px 48px rgba(158,58,46,0.15), 0 6px 16px rgba(0,0,0,0.06)'
                            : '0 12px 32px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.04)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = isRecommended
                            ? '0 8px 30px rgba(158,58,46,0.08), 0 2px 8px rgba(0,0,0,0.03)'
                            : '0 2px 8px rgba(0,0,0,0.03)';
                        }}
                      >
                        {isRecommended && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                            <span
                              className="text-white text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                              style={{
                                background: 'linear-gradient(135deg, var(--rm-primary), var(--rm-primary-light))',
                                boxShadow: '0 4px 15px rgba(158,58,46,0.35)',
                              }}
                            >
                              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              Recomendado
                            </span>
                          </div>
                        )}

                        {/* Icon */}
                        <div className="flex justify-center mb-2 sm:mb-3">
                          <div
                            className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-lg sm:rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                            style={{
                              background: isRecommended
                                ? 'linear-gradient(135deg, var(--rm-primary), var(--rm-primary-light))'
                                : 'rgba(15,27,45,0.06)',
                              color: isRecommended ? '#fff' : 'var(--c-navy, var(--rm-text))',
                            }}
                          >
                            {PlanIcon}
                          </div>
                        </div>

                        {/* Plan Name */}
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-center mb-0.5 sm:mb-1 break-words leading-tight" style={{ color: 'var(--c-navy, var(--rm-text))' }}>
                          {plan.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-gray-500 text-center mb-2.5 sm:mb-3 lg:mb-4 break-words leading-snug">{plan.description}</p>

                        {/* Price */}
                        <div className="text-center py-2 sm:py-3 mb-2.5 sm:mb-3 lg:mb-4 rounded-lg sm:rounded-xl" style={{ background: 'rgba(0,0,0,0.02)' }}>
                          <div className="flex items-baseline justify-center gap-0.5 sm:gap-1">
                            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold" style={{ color: 'var(--c-navy, var(--rm-text))' }}>
                              {plan.price.toLocaleString('es-ES')}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500">{plan.currency}</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                            por {plan.duration} {plan.duration === 1 ? 'día' : 'días'}
                          </p>
                        </div>

                        {/* Features */}
                        <ul className="flex-1 space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 lg:mb-5 min-w-0">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-1.5 sm:gap-2 text-[11px] sm:text-xs lg:text-sm text-gray-600 min-w-0">
                              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none">
                                <circle cx="10" cy="10" r="10" fill="var(--c-accent, var(--rm-primary))" fillOpacity="0.1" />
                                <path d="M6 10l3 3 5-6" stroke="var(--c-accent, var(--rm-primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span className="break-words leading-snug">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <button
                          onClick={() => handleSelectPlan(plan)}
                          disabled={isLoading}
                          className="w-full py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-semibold transition-all duration-300 disabled:opacity-50"
                          style={{
                            background: isRecommended
                              ? 'linear-gradient(135deg, var(--c-accent, var(--rm-primary)), var(--c-warm, var(--rm-primary-light)))'
                              : 'var(--c-navy, var(--rm-text))',
                            color: '#fff',
                            boxShadow: isRecommended ? '0 3px 12px rgba(158,58,46,0.2)' : 'none',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = isRecommended
                              ? '0 6px 20px rgba(158,58,46,0.3)'
                              : '0 4px 12px rgba(0,0,0,0.12)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = isRecommended ? '0 3px 12px rgba(158,58,46,0.2)' : 'none';
                          }}
                        >
                          {isLoading ? 'Cargando...' : 'Seleccionar Plan'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 lg:gap-4 pt-3 sm:pt-4 lg:pt-5 border-t border-gray-100">
                {[
                  { icon: '💳', title: 'Sin tarjeta de crédito', desc: 'Comienza gratis, paga cuando estés listo' },
                  { icon: '↩️', title: 'Cancela cuando quieras', desc: 'Sin contratos ni compromisos' },
                  { icon: '🛡️', title: 'Seguridad garantizada', desc: 'Encriptación de nivel empresarial' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-start gap-2 sm:gap-2.5 p-2.5 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl"
                    style={{ background: 'rgba(0,0,0,0.02)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                  >
                    <span className="text-base sm:text-lg lg:text-xl shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold truncate" style={{ color: 'var(--c-navy, var(--rm-text))' }}>{item.title}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 leading-snug break-words">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Phase note */}
              <div
                className="mt-3 sm:mt-4 lg:mt-5 p-3 sm:p-4 rounded-lg sm:rounded-xl flex items-start gap-2.5 sm:gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(99,102,241,0.05) 100%)',
                  border: '1px solid rgba(59,130,246,0.12)',
                }}
              >
                <span className="text-base sm:text-lg shrink-0 mt-0.5">🔬</span>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-blue-800">Fase Piloto Activa</p>
                  <p className="text-[10px] sm:text-xs text-blue-700 mt-0.5 leading-snug break-words">
                    En esta fase inicial, la selección de planes se registra para recopilar feedback.
                    El procesamiento de pagos con ENZONA entrará en la siguiente fase.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Use createPortal to render modal directly into document.body
  // This prevents ancestor CSS (transforms, filters, etc.) from breaking fixed positioning
  if (!mounted) return null;
  return createPortal(modalContent, document.body);
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
