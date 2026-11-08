'use client';

import React, { useState, useCallback } from 'react';
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
  CheckCircle2,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useTheme } from './ThemeSwitcher';
import ObfuscatedContact from './ObfuscatedContact';

interface PortalFooterProps {
  onNavigate: (sectionId: string) => void;
}

const FOOTER_PHONE = '(+53) 7 862-3456';
const FOOTER_EMAIL = 'info@registromercantil.cu';

export default function PortalFooter({ onNavigate }: PortalFooterProps) {
  const { theme } = useTheme();
  const [copiedMsg, setCopiedMsg] = useState('');

  // ─── Share ───────────────────────────────────────────────────────
  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = document.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${title} — ${url}`);
      setCopiedMsg('Enlace copiado al portapapeles');
      setTimeout(() => setCopiedMsg(''), 2000);
    } catch {
      setCopiedMsg('No se pudo compartir');
      setTimeout(() => setCopiedMsg(''), 2000);
    }
  }, []);

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
            <p className="text-sm text-white/70 leading-relaxed">
              Portal oficial del Registro Mercantil de la República de Cuba, dependiente del Ministerio de Justicia.
            </p>
            <div className="flex items-center gap-3 mt-4">
              {[
                { icon: Share2, tip: 'Compartir página', action: handleShare },
                { icon: Megaphone, tip: 'Redes Sociales', action: () => {} },
                { icon: Mail, tip: 'Contacto', action: () => {
                  window.location.href = `mailto:${FOOTER_EMAIL}`;
                }},
              ].map(({ icon: Icon, tip, action }) => (
                <Tooltip key={tip}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={action}
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                      style={{
                        backgroundColor: theme.colors.accent + '20',
                        color: theme.colors.warm,
                      }}
                      aria-label={tip}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{tip}</TooltipContent>
                </Tooltip>
              ))}
            </div>
            {copiedMsg && (
              <p className="mt-2 text-xs text-white/80 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />{copiedMsg}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Enlaces Rápidos</h3>
            <ul className="space-y-2.5">
              {['Consultas Públicas', 'Trámites en Línea', 'Normativa Legal', 'Estadísticas', 'Formularios'].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => handleQuickLinkClick(link)}
                    className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1.5 group"
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
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.colors.warm }} />
                <span className="text-white/70">Calle Obispo No. 154, La Habana Vieja</span>
              </li>
              <li className="flex items-start gap-2.5 relative">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.colors.warm }} />
                <ObfuscatedContact
                  fullValue={FOOTER_PHONE.replace(/[() ]/g, '-')}
                  type="phone"
                  label={FOOTER_PHONE}
                  className="py-0.5"
                />
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.colors.warm }} />
                <a
                  href={`mailto:${FOOTER_EMAIL}`}
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label={`Enviar correo a ${FOOTER_EMAIL}`}
                >
                  <ObfuscatedContact
                    fullValue={FOOTER_EMAIL}
                    type="email"
                    label={FOOTER_EMAIL}
                    className="py-0.5"
                  />
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.colors.warm }} />
                <span className="text-white/70">Lun-Vie: 8:30 AM - 4:30 PM</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Información Legal</h3>
            <ul className="space-y-2.5">
              {['Aviso Legal', 'Política de Privacidad', 'Accesibilidad', 'Mapa del Sitio', 'Sugerencias'].map((link) => (
                <li key={link}>
                  <button className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1.5 group">
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>© 2026 Registro Mercantil de Cuba — Ministerio de Justicia. Todos los derechos reservados.</p>
          <div className="flex items-center w-40 h-20">
            <img src="/marca-pais.jpg" alt="Cuba" className="object-contain" />
          </div>
        </div>
      </div>
    </footer>
  );
}
