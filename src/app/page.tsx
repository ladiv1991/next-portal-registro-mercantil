'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/portal/layout/ThemeSwitcher';
import ThemeSwitcherComponent from '@/components/portal/layout/ThemeSwitcher';

import CmsLayout from '@/components/cms/cms-layout';
import { login as cmsLogin, logout as cmsLogout } from '@/components/cms/cms-api';
import type { User as CmsUser } from '@/components/cms/cms-types';

import { PortalHeader, PortalFooter, ScrollToTop } from '@/components/portal/layout';

const STORAGE_KEYS = {
  ACTIVE_SECTION: 'portal-active-section',
  SCROLL_Y: 'portal-scroll-y',
} as const;

const VALID_SECTIONS = ['home', 'consultas', 'tramites', 'normatividad', 'estadisticas', 'asistencia', 'acceso', 'legal'] as const;

function getInitialSection(): string {
  if (typeof window === 'undefined') return 'home';

  const hash = window.location.hash.slice(1);
  if (hash && VALID_SECTIONS.includes(hash as typeof VALID_SECTIONS[number])) {
    return hash;
  }

  const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SECTION);
  if (saved && VALID_SECTIONS.includes(saved as typeof VALID_SECTIONS[number])) {
    return saved;
  }

  const pending = sessionStorage.getItem('navigateToSection');
  if (pending) {
    sessionStorage.removeItem('navigateToSection');
    return pending;
  }

  return 'home';
}

function getInitialScrollY(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(STORAGE_KEYS.SCROLL_Y);
  return saved ? parseInt(saved, 10) : 0;
}

// ─── Lazy-loaded sections ───
// Each section is code-split into its own chunk and loaded only when rendered.
// `ssr: false` because sections are swapped via client-side state only.

const HomeSection = dynamic(
  () => import('@/components/portal/sections').then((m) => m.HomeSection),
  { ssr: true, loading: () => <SectionSkeleton /> }
);

const ConsultasSection = dynamic(
  () => import('@/components/portal/sections').then((m) => m.ConsultasSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const TramitesSection = dynamic(
  () => import('@/components/portal/sections').then((m) => m.TramitesSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const NormatividadSection = dynamic(
  () => import('@/components/portal/sections').then((m) => m.NormatividadSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const EstadisticasSection = dynamic(
  () => import('@/components/portal/sections').then((m) => m.EstadisticasSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const AsistenciaSection = dynamic(
  () => import('@/components/portal/sections').then((m) => m.AsistenciaSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const AccesoSection = dynamic(
  () => import('@/components/portal/sections').then((m) => m.AccesoSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const ForgotPasswordSection = dynamic(
  () => import('@/components/portal/sections').then((m) => m.ForgotPasswordSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

const SitePagesSection = dynamic(
  () => import('@/components/portal/sections').then((m) => m.SitePagesSection),
  { ssr: false, loading: () => <SectionSkeleton /> }
);

// Lazy-load the chatbot (heavy: markdown rendering, AI SDK)
const FloatingChatbot = dynamic(
  () => import('@/components/portal/layout').then((m) => m.FloatingChatbot),
  { ssr: false }
);

// ─── Section loading skeleton ───
function SectionSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#1A1A1A]/20 border-t-navy animate-spin" />
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </div>
    </div>
  );
}

// ============================================================
// MAIN PAGE ORCHESTRATOR
// ============================================================

export default function Home() {
  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cmsUser, setCmsUser] = useState<CmsUser | null>(null);
  const [loginError, setLoginError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  // ---- Restore scroll position on mount ----
  useEffect(() => {
    const scrollY = getInitialScrollY();
    if (scrollY > 0) {
      window.scrollTo({ top: scrollY, behavior: 'instant' });
    }
    setIsRestored(true);
  }, []);

  // ---- Save active section to localStorage on change ----
  useEffect(() => {
    if (isRestored) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SECTION, activeSection);
    }
  }, [activeSection, isRestored]);

  // ---- Save scroll position on scroll stop (debounced) ----
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        localStorage.setItem(STORAGE_KEYS.SCROLL_Y, window.scrollY.toString());
      }, 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // ---- Scroll detection for ScrollToTop button ----
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ---- Navigation ----
  const handleNavClick = useCallback((sectionId: string, query?: string) => {
    setActiveSection(sectionId);
    if (query !== undefined) {
      setSearchQuery(query);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ---- Chatbot navigation: listen for section changes from FloatingChatbot ----
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const section = (e as CustomEvent<string>).detail;
      if (section) handleNavClick(section);
    };

    window.addEventListener('navigate-to-section', handleNavigate);
    return () => window.removeEventListener('navigate-to-section', handleNavigate);
  }, [handleNavClick]);

  // ---- Authentication ----
  const handleCmsLogin = async (email: string, password: string, captchaId: string, captchaAnswer: string): Promise<boolean> => {
    setLoginError('');
    try {
      const result = await cmsLogin(email, password, captchaId, captchaAnswer);
      if (result && result.user) {
        setCmsUser(result.user);
        return true;
      }
      setLoginError('Error inesperado: no se recibieron datos del servidor.');
      return false;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de conexión con el servidor.';
      setLoginError(msg);
      return false;
    }
  };

  const handleCmsLogout = async () => {
    try {
      await cmsLogout();
    } catch {
      // ignore
    }
    // Clear persisted navigation state on logout
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SECTION);
    localStorage.removeItem(STORAGE_KEYS.SCROLL_Y);
    setCmsUser(null);
    setLoginError('');
  };

  // ---- CMS redirect ----
  if (cmsUser) {
    return <CmsLayout user={cmsUser} onLogout={handleCmsLogout} />;
  }

  // ---- Public portal ----
  return (
    <ThemeProvider>
      <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <PortalHeader activeSection={activeSection} onNavigate={handleNavClick} />

        <main id="main-content" className="flex-1">
          <AnimatePresence mode="wait">
            {activeSection === 'home' && <HomeSection key="home" onNavigate={handleNavClick} />}
            {activeSection === 'consultas' && <ConsultasSection key="consultas" initialQuery={searchQuery} />}
            {activeSection === 'tramites' && <TramitesSection key="tramites" />}
            {activeSection === 'normatividad' && <NormatividadSection key="normatividad" />}
            {activeSection === 'estadisticas' && <EstadisticasSection key="estadisticas" />}
            {activeSection === 'asistencia' && <AsistenciaSection key="asistencia" />}
            {activeSection === 'legal' && <SitePagesSection key="legal" />}
            {activeSection === 'acceso' && !showForgotPassword && (
              <AccesoSection key="acceso" onLogin={handleCmsLogin} loginError={loginError} onForgotPassword={() => setShowForgotPassword(true)} />
            )}
            {showForgotPassword && (
              <ForgotPasswordSection key="forgot-password" onBack={() => setShowForgotPassword(false)} />
            )}
          </AnimatePresence>
        </main>

        <PortalFooter onNavigate={handleNavClick} />
        <ScrollToTop visible={showScrollTop} />
        <Suspense fallback={null}>
          <FloatingChatbot />
        </Suspense>
        <ThemeSwitcherComponent />
      </div>
    </TooltipProvider>
    </ThemeProvider>
  );
}
