'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface PortalUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  identityCard?: string;
  enzonaId?: string;
  isVerified: boolean;
  subscriptions: UserSubscription[];
}

interface UserSubscription {
  id: string;
  planId: string;
  plan: {
    id: string;
    name: string;
    features: string[];
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
  paymentStatus: string;
}

interface PortalAuthContextType {
  user: PortalUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasActiveSubscription: (feature?: string) => boolean;
  showPremiumModal: (feature?: string) => void;
  isLoading: boolean;
}

const PortalAuthContext = createContext<PortalAuthContextType | undefined>(undefined);

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PortalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [premiumModal, setPremiumModal] = useState<{ isOpen: boolean; feature?: string }>({
    isOpen: false,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/portal/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/portal/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
  };

  const hasActiveSubscription = (feature?: string): boolean => {
    if (!user) return false;

    const activeSubs = user.subscriptions.filter(sub =>
      sub.isActive &&
      sub.paymentStatus === 'completed' &&
      new Date(sub.endDate) > new Date()
    );

    if (!feature) return activeSubs.length > 0;

    return activeSubs.some(sub =>
      sub.plan.features.some(f =>
        f.toLowerCase().includes(feature.toLowerCase())
      )
    );
  };

  const showPremiumModal = (feature?: string) => {
    setPremiumModal({ isOpen: true, feature });
  };

  const closePremiumModal = () => {
    setPremiumModal({ isOpen: false });
  };

  return (
    <PortalAuthContext.Provider
      value={{
        user,
        login,
        logout,
        hasActiveSubscription,
        showPremiumModal,
        isLoading,
      }}
    >
      {children}
      <PremiumModal
        isOpen={premiumModal.isOpen}
        onClose={closePremiumModal}
        requiredFeature={premiumModal.feature}
        portalUser={user}
      />
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (context === undefined) {
    throw new Error('usePortalAuth must be used within a PortalAuthProvider');
  }
  return context;
}

// Import the PremiumModal component
import dynamic from 'next/dynamic';

const PremiumModal = dynamic(
  () => import('@/components/portal/PremiumModal'),
  { ssr: false }
);