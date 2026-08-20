'use client';

import { usePortalAuth } from './use-portal-auth';
import { useCallback, useState } from 'react';

export interface FeatureAccessOptions {
  feature: string;
  requiredPlan?: 'basic' | 'premium' | 'enterprise';
  onDenied?: () => void;
}

/**
 * Hook para controlar acceso a features premium.
 * En esta fase piloto, siempre muestra el modal si no hay suscripción.
 * Las validaciones reales se implementarán después.
 */
export function useFeatureAccess() {
  const { user, hasActiveSubscription, showPremiumModal } = usePortalAuth();
  const [accessLog, setAccessLog] = useState<
    Array<{ feature: string; timestamp: Date; allowed: boolean }>
  >([]);

  const checkAccess = useCallback(
    async (options: FeatureAccessOptions): Promise<boolean> => {
      const { feature, requiredPlan, onDenied } = options;

      // Log del acceso (para debugging)
      const accessEntry = {
        feature,
        timestamp: new Date(),
        allowed: false,
      };

      // En fase piloto: si no tiene suscripción, muestra modal
      if (!hasActiveSubscription()) {
        console.log(`[Feature Access] ${feature}: Sin suscripción activa - mostrando modal`);
        showPremiumModal();
        accessEntry.allowed = false;
        setAccessLog((prev) => [...prev, accessEntry]);
        onDenied?.();
        return false;
      }

      // TODO: Implementar validaciones reales en el futuro
      // - Verificar el plan específico requerido
      // - Validar límites de uso (rate limiting, quotas)
      // - Registrar uso en analytics
      // - Validar permisos del usuario

      console.log(`[Feature Access] ${feature}: Acceso permitido`);
      accessEntry.allowed = true;
      setAccessLog((prev) => [...prev, accessEntry]);
      return true;
    },
    [hasActiveSubscription, showPremiumModal]
  );

  /**
   * Wrapper para funciones que requieren verificación de features.
   * Uso: const wrappedFunction = wrapFeature('feature-name', myFunction);
   */
  const wrapFeature = useCallback(
    <T extends (...args: any[]) => Promise<any>>(featureName: string, fn: T): T => {
      return (async (...args) => {
        const allowed = await checkAccess({ feature: featureName });
        if (allowed) {
          return fn(...args);
        }
        throw new Error(`Acceso denegado a la feature: ${featureName}`);
      }) as T;
    },
    [checkAccess]
  );

  /**
   * Guard de React para componentes que requieren premium.
   * Muestra el modal si no hay acceso.
   */
  const requireFeature = useCallback(
    (featureName: string): boolean => {
      if (!hasActiveSubscription()) {
        showPremiumModal();
        return false;
      }
      return true;
    },
    [hasActiveSubscription, showPremiumModal]
  );

  return {
    // Métodos principales
    checkAccess,
    wrapFeature,
    requireFeature,

    // Info del usuario
    user,
    hasActiveSubscription: hasActiveSubscription(),
    showPremiumModal,

    // Debug
    accessLog,
    clearAccessLog: () => setAccessLog([]),
  };
}

/**
 * Hook simplificado para solo mostrar modal si no tiene acceso.
 * Uso en botones/componentes simples.
 */
export function useRequiresPremium() {
  const portalAuth = usePortalAuth();
  const { hasActiveSubscription: checkHasActiveSubscription, showPremiumModal } = portalAuth;

  const handlePremiumAction = useCallback(
    (action: () => void | Promise<void>, actionName: string = 'Acción') => {
      const hasSubscription = checkHasActiveSubscription();
      if (!hasSubscription) {
        console.log(`[Premium Gate] ${actionName}: Usuario sin suscripción`);
        showPremiumModal();
        return false;
      }
      action();
      return true;
    },
    [checkHasActiveSubscription, showPremiumModal]
  );

  return { 
    handlePremiumAction, 
    hasActiveSubscription: checkHasActiveSubscription(),
    showPremiumModal,
  };
}
