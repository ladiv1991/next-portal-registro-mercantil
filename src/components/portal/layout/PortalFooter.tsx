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

// Minimal placeholder QR SVG — visual decoration only. To encode real data, swap in qrcode.react or a build-time generator.
function QrCode() {
  return (
    <svg
      viewBox="0 0 21 21"
      width={64}
      height={64}
      aria-label="Código QR del portal"
      role="img"
      className="text-white/80"
    >
      {/* Three finder patterns */}
      {[
        [0, 0],
        [14, 0],
        [0, 14],
      ].map(([cx, cy], idx) => (
        <g key={idx}>
          <rect x={cx} y={cy} width="7" height="7" fill="currentColor" />
          <rect
            x={cx + 1}
            y={cy + 1}
            width="5"
            height="5"
            fill="var(--footer-bg, #0f172a)"
          />
          <rect
            x={cx + 2}
            y={cy + 2}
            width="3"
            height="3"
            fill="currentColor"
          />
        </g>
      ))}
      {/* Data modules — deterministic pattern for visual QR feel */}
      <g fill="currentColor">
        <rect x="8" y="0" width="1" height="1" />
        <rect x="11" y="0" width="2" height="1" />
        <rect x="17" y="0" width="1" height="1" />
        <rect x="19" y="0" width="1" height="1" />
        <rect x="0" y="8" width="1" height="1" />
        <rect x="2" y="8" width="2" height="1" />
        <rect x="6" y="8" width="1" height="1" />
        <rect x="10" y="8" width="1" height="1" />
        <rect x="13" y="8" width="2" height="1" />
        <rect x="18" y="8" width="1" height="1" />
        <rect x="1" y="10" width="1" height="1" />
        <rect x="4" y="10" width="2" height="1" />
        <rect x="8" y="10" width="1" height="1" />
        <rect x="11" y="10" width="1" height="1" />
        <rect x="15" y="10" width="2" height="1" />
        <rect x="19" y="10" width="1" height="1" />
        <rect x="0" y="12" width="1" height="1" />
        <rect x="3" y="12" width="1" height="1" />
        <rect x="7" y="12" width="2" height="1" />
        <rect x="12" y="12" width="1" height="1" />
        <rect x="16" y="12" width="1" height="1" />
        <rect x="19" y="12" width="1" height="1" />
        <rect x="1" y="14" width="1" height="1" />
        <rect x="4" y="14" width="1" height="1" />
        <rect x="8" y="14" width="1" height="1" />
        <rect x="13" y="14" width="2" height="1" />
        <rect x="17" y="14" width="1" height="1" />
        <rect x="0" y="16" width="2" height="1" />
        <rect x="5" y="16" width="1" height="1" />
        <rect x="9" y="16" width="1" height="1" />
        <rect x="14" y="16" width="2" height="1" />
        <rect x="18" y="16" width="1" height="1" />
        <rect x="1" y="18" width="1" height="1" />
        <rect x="4" y="18" width="2" height="1" />
        <rect x="8" y="18" width="1" height="1" />
        <rect x="11" y="18" width="1" height="1" />
        <rect x="15" y="18" width="1" height="1" />
        <rect x="19" y="18" width="1" height="1" />
        <rect x="0" y="19" width="1" height="1" />
        <rect x="3" y="19" width="1" height="1" />
        <rect x="7" y="19" width="2" height="1" />
        <rect x="12" y="19" width="1" height="1" />
        <rect x="16" y="19" width="2" height="1" />
        <rect x="19" y="19" width="1" height="1" />
        <rect x="6" y="10" width="1" height="1" />
        <rect x="17" y="10" width="1" height="1" />
        <rect x="9" y="8" width="1" height="1" />
        <rect x="16" y="14" width="1" height="1" />
        <rect x="12" y="16" width="1" height="1" />
        <rect x="5" y="18" width="1" height="1" />
        <rect x="18" y="15" width="1" height="1" />
        <rect x="2" y="15" width="1" height="1" />
        <rect x="10" y="17" width="1" height="1" />
        <rect x="19" y="17" width="1" height="1" />
      </g>
    </svg>
  );
}

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

  const portalUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://registro-mercantil.xetid.cu';

  return (
    <footer className="footer-gradient" style={{ backgroundColor: theme.colors.dark }}>
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
                  window.location.href = `mailto:${FOOTER_EMAIL}?subject=${encodeURIComponent('Consulta Portal Registro Mercantil')}&body=${encodeURIComponent('Hola,\n\nMe comunico desde el portal web del Registro Mercantil de Cuba.')}`;
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
                <a
                  href={`tel:${FOOTER_PHONE.replace(/[^\d+]/g, '')}`}
                  className="inline-flex"
                  aria-label={`Llamar a ${FOOTER_PHONE}`}
                >
                  <ObfuscatedContact
                    fullValue={FOOTER_PHONE.replace(/[() ]/g, '-')}
                    type="phone"
                    label={FOOTER_PHONE}
                    className="py-0.5"
                  />
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.colors.warm }} />
                <a
                  href={`mailto:${FOOTER_EMAIL}?subject=${encodeURIComponent('Consulta Portal Registro Mercantil')}&body=${encodeURIComponent('Hola,\n\nMe comunico desde el portal web del Registro Mercantil de Cuba.\n\n')}`}
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
              {/* QR code */}
              <li className="flex items-start gap-2.5 pt-2 border-t border-white/10 mt-1">
                <QrCode />
                <span className="text-xs text-white/50 leading-relaxed">
                  Escanea para acceder<br />al portal ({portalUrl})
                </span>
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
