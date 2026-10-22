'use client';

import React from 'react';
import {
  Shield,
  Share2,
  Megaphone,
  Mail,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Palette,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useTheme } from './ThemeSwitcher';

interface PortalFooterProps {
  onNavigate: (sectionId: string) => void;
}

export default function PortalFooter({ onNavigate }: PortalFooterProps) {
  const { theme } = useTheme();

  const handleQuickLinkClick = (link: string) => {
    const sectionId =
      link === 'Consultas Públicas'
        ? 'consultas'
        : link === 'Trámites en Línea'
          ? 'tramites'
          : link === 'Normativa Legal'
            ? 'normatividad'
            : link === 'Estadísticas'
              ? 'estadisticas'
              : 'normatividad';
    onNavigate(sectionId);
  };

  return (
    <footer className="footer-gradient">
      <div className="multicolor-stripe" />
      {/* Accent gradient line */}
      <div
        className="h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${theme.colors.accent}40, ${theme.colors.warm}30, ${theme.colors.accent}40, transparent)`,
        }}
      />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Institutional */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6" style={{ color: theme.colors.warm }} />
              <span className="text-white font-bold text-base">Registro Mercantil</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Portal oficial del Registro Mercantil de la República de Cuba, dependiente del Ministerio de Justicia.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[
                { icon: Share2, tip: 'Compartir' },
                { icon: Megaphone, tip: 'Redes Sociales' },
                { icon: Mail, tip: 'Contacto' },
              ].map(({ icon: Icon, tip }) => (
                <Tooltip key={tip}>
                  <TooltipTrigger asChild>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: theme.colors.accent + '20',
                        color: theme.colors.warm,
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>{tip}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Enlaces Rápidos</h3>
            <ul className="space-y-2.5">
              {['Consultas Públicas', 'Trámites en Línea', 'Normativa Legal', 'Estadísticas', 'Formularios'].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => handleQuickLinkClick(link)}
                    className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" style={{ color: theme.colors.accent }} />
                    <span>{link}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Contacto</h3>
            <ul className="space-y-3 text-sm">
              {[
                { icon: MapPin, text: 'Calle Obispo No. 154, La Habana Vieja' },
                { icon: Phone, text: '(+53) 7 862-3456' },
                { icon: Mail, text: 'info@registromercantil.cu' },
                { icon: Clock, text: 'Lun-Vie: 8:30 AM - 4:30 PM' },
              ].map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.colors.warm }} />
                  <span className="text-gray-300">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Información Legal</h3>
            <ul className="space-y-2.5">
              {['Aviso Legal', 'Política de Privacidad', 'Accesibilidad', 'Mapa del Sitio', 'Sugerencias'].map((link) => (
                <li key={link}>
                  <button className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-1.5 group">
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" style={{ color: theme.colors.accent }} />
                    <span>{link}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator
          className="my-8"
          style={{ backgroundColor: theme.colors.accent + '20' }}
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-300">
          <p>© 2026 Registro Mercantil de Cuba — Ministerio de Justicia. Todos los derechos reservados.</p>
          <div className="flex items-center w-40 h-20">
            
            <img src="/marca-pais.jpg" alt="Cuba" className="object-contain" />
           
          </div>
        </div>
      </div>
    </footer>
  );
}
