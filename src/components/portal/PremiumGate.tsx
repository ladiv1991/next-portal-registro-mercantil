'use client';

import { useRequiresPremium } from '@/hooks/use-feature-access';
import { Button, ButtonProps } from '@/components/ui/button';
import { ReactNode } from 'react';

interface PremiumGateButtonProps extends ButtonProps {
  children: ReactNode;
  featureName?: string;
  onAccess?: () => void | Promise<void>;
  showGateIcon?: boolean;
}

/**
 * Botón que requiere verificación de premium.
 * Si el usuario no tiene suscripción activa, muestra el modal de planes.
 */
export function PremiumGateButton({
  children,
  featureName = 'Acción',
  onAccess,
  showGateIcon = true,
  onClick,
  disabled,
  ...props
}: PremiumGateButtonProps) {
  const { handlePremiumAction, hasActiveSubscription } = useRequiresPremium();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    handlePremiumAction(async () => {
      await onAccess?.();
    }, featureName);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {showGateIcon && !hasActiveSubscription && (
        <span className="mr-2">🔒</span>
      )}
      {children}
    </Button>
  );
}

interface PremiumGateWrapperProps {
  children: ReactNode;
  featureName: string;
  fallback?: ReactNode;
  requiresPremium?: boolean;
}

/**
 * Wrapper que envuelve contenido que requiere premium.
 * Si no tiene acceso, muestra un mensaje o componente alternativo.
 */
export function PremiumGateWrapper({
  children,
  featureName,
  fallback,
  requiresPremium = true,
}: PremiumGateWrapperProps) {
  const { hasActiveSubscription, showPremiumModal } = useRequiresPremium();

  if (requiresPremium && !hasActiveSubscription) {
    return (
      <>
        {fallback || (
          <div className="text-center py-8 px-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-600 mb-4">
              Esta feature requiere una suscripción activa
            </p>
            <Button onClick={showPremiumModal} variant="default">
              Ver Planes
            </Button>
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}
