'use client';

import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Search,
  FileText,
  Scale,
  BarChart3,
  HelpCircle,
  Lock,
  Bell,
  Menu,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import AuthenticationModal from '@/components/portal/auth/AuthenticationModal';

// ---- Icon map for nav items ----
const ICON_MAP: Record<string, React.ElementType> = {
  Landmark,
  Search,
  FileText,
  Scale,
  BarChart3,
  HelpCircle,
  Lock,
};

const NAV_ITEMS_CONFIG = [
  { id: 'home', label: 'Portada', iconName: 'Landmark' },
  { id: 'consultas', label: 'Consultas', iconName: 'Search' },
  { id: 'tramites', label: 'Trámites', iconName: 'FileText' },
  { id: 'normatividad', label: 'Normatividad', iconName: 'Scale' },
  { id: 'estadisticas', label: 'Estadísticas', iconName: 'BarChart3' },
  { id: 'asistencia', label: 'Asistencia', iconName: 'HelpCircle' },
];

interface PortalHeaderProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export default function PortalHeader({ activeSection, onNavigate }: PortalHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'autenticarse') {
      // Navigate to AccesoSection for CMS admin login (uses /api/auth/login)
      onNavigate('acceso');
    } else {
      onNavigate(sectionId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'shadow-lg shadow-black/20'
          : ''
      }`}
      style={{
        background: scrolled
          ? 'linear-gradient(180deg, #121212 0%, var(--rm-text) 100%)'
          : 'linear-gradient(180deg, #111111 0%, #1E1E1E 100%)',
      }}
    >
      {/* Cuban flag stripe */}
      <div className="multicolor-stripe" />

      {/* Matte dark sub-line */}
      <div
        className="h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNavClick('home')} className="flex items-center gap-3 group">
            <div className="relative">
              <img src="/favicon.png" alt="Registro Mercantil de Cuba" className="w-10 h-10 transition-transform duration-300 group-hover:scale-105" />
              {/* Subtle glow ring */}
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ boxShadow: '0 0 12px rgba(158, 58, 46, 0.3)' }}
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-bold text-sm leading-tight tracking-wide">Registro Mercantil</div>
              <div className="text-xs text-gray-300 font-medium">República de Cuba</div>
            </div>
          </button>

          {/* Desktop Nav - Matte Dark Style */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS_CONFIG.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                >
                  {/* Background layer */}
                  <div
                    className={`absolute inset-0 rounded-lg transition-all duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                    }`}
                    style={{
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(158, 58, 46, 0.9) 0%, rgba(122, 42, 30, 0.9) 100%)'
                        : 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                      boxShadow: isActive
                        ? '0 2px 12px rgba(158, 58, 46, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                        : 'none',
                    }}
                  />
                  {/* Text layer */}
                  <span
                    className={`relative z-10 flex items-center gap-1.5 transition-colors duration-300 ${
                      isActive ? 'text-white' : 'text-gray-300 hover:text-gray-100'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="w-1 h-1 rounded-full bg-white/80"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-300 rounded-lg"
                >
                  <Bell className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notificaciones</TooltipContent>
            </Tooltip>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-white/5 hidden sm:flex transition-all duration-300 rounded-lg"
              onClick={() => handleNavClick('consultas')}
            >
              <Search className="w-4 h-4" />
            </Button>

            <Button
              size="sm"
              className="hidden sm:flex transition-all duration-300 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, var(--rm-primary) 0%, var(--rm-primary) 100%)',
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              onClick={() => handleNavClick('autenticarse')}
            >
              <Lock className="w-4 h-4 mr-1" />
              Autenticarse
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-300 hover:text-white lg:hidden transition-colors rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 p-0 border-l border-white/10"
                style={{
                  background: 'linear-gradient(180deg, #111111 0%, var(--rm-text) 100%)',
                }}
              >
                <SheetHeader className="p-6 border-b border-white/10">
                  <SheetTitle className="text-white text-left">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5" style={{ color: 'var(--c-accent, var(--rm-primary))' }} />
                      <span>Menú de Navegación</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-80px)]">
                  <div className="p-4 space-y-1">
                    {NAV_ITEMS_CONFIG.map((item) => {
                      const IconComponent = ICON_MAP[item.iconName];
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-300 ${
                            isActive
                              ? 'text-white shadow-lg'
                              : 'text-gray-300 hover:bg-white/5 hover:text-gray-100'
                          }`}
                          style={
                            isActive
                              ? {
                                  background: 'linear-gradient(135deg, rgba(158,58,46,0.8) 0%, rgba(122,42,30,0.8) 100%)',
                                  boxShadow: '0 2px 12px rgba(158,58,46,0.25)',
                                }
                              : {}
                          }
                        >
                          {IconComponent && (
                            <IconComponent className="w-4 h-4" style={isActive ? { color: 'var(--rm-surface)' } : undefined} />
                          )}
                          {item.label}
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                          )}
                        </button>
                      );
                    })}
                    <Separator className="my-3 bg-white/10" />
                    <Button
                      className="w-full rounded-lg text-white transition-all duration-300 shadow-lg shadow-black/20"
                      style={{
                        background: 'linear-gradient(135deg, var(--rm-primary) 0%, var(--rm-primary) 100%)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                      onClick={() => handleNavClick('autenticarse')}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Autenticarse
                    </Button>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom accent line on scroll */}
      {scrolled && (
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.5 }}
          className="multicolor-stripe"
          style={{ height: '2px' }}
        />
      )}

      {/* Authentication Modal */}
      <AuthenticationModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </header>
  );
}
