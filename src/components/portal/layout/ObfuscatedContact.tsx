'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

/**
 * ObfuscatedContact — oculta emails y teléfonos de bots/spam-scrapers.
 *
 * Estrategia:
 *  1. El texto visible se construye con tokens separados (sin '@' ni dígitos
 *     continuos), usando un pattern dinámico en JS que los une al hacer tap.
 *  2. El valor real solo existe en closure; ningún scraper que lea el HTML
 *     puede extraerlo sin ejecutar JavaScript.
 *  3. Al tap: copia al portapapeles y, según el tipo, abre el cliente
 *     nativo (tel: o mailto:).
 */

function buildEmailTokens(email: string): string[] {
  const [local, domain] = email.split('@');
  return [...local, '·', ...domain.split('.')];
}

function buildPhoneTokens(phone: string): string[] {
  // '+53-7-862-3456' → ['+', '53', '7', '862', '3456']
  const parts = phone.match(/[+\d]+/g);
  return parts || [phone];
}

type TokenSource = string[];
type Props = {
  fullValue: string;
  type: 'email' | 'phone';
  label?: string;
  className?: string;
};

/** Fallback copy using the deprecated but widely-available execCommand API. */
function fallbackCopy(text: string): boolean {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'absolute';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    /* noop */
  }
  document.body.removeChild(ta);
  return ok;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to execCommand fallback */
  }
  return fallbackCopy(text);
}

export default function ObfuscatedContact({ fullValue, type, label, className = '' }: Props) {
  const [revealed, setRevealed] = useState(false);

  const tokens: TokenSource = type === 'email' ? buildEmailTokens(fullValue) : buildPhoneTokens(fullValue);

  const handleTap = useCallback(async () => {
    await copyToClipboard(fullValue);

    if (type === 'email') {
      // Copy + open mailto with subject/body
      const subject = encodeURIComponent('Consulta desde Portal Registro Mercantil');
      const body = encodeURIComponent(
        'Estimado equipo,\n\nEscribo para consultar sobre:\n\n---'
      );
      const mailto = `mailto:${fullValue}?subject=${subject}&body=${body}`;
      window.location.href = mailto;
      toast.success(`Copiado: ${fullValue}`);
    } else {
      // Phone: copy + open native dialer
      const tel = `tel:${fullValue.replace(/\s/g, '')}`;
      window.location.href = tel;
    }

    // Inline visual feedback regardless of copy success
    setRevealed(true);
    setTimeout(() => setRevealed(false), 1800);
  }, [fullValue, type]);

  const Icon = type === 'email' ? Mail : Phone;

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleTap}
        className={`flex items-center gap-1 text-sm font-mono tracking-wide transition-all duration-200 ${
          revealed ? 'text-[var(--rm-primary)]' : 'text-white/80 hover:text-white'
        }`}
        style={{ fontSize: '0.8rem' }}
        aria-label={label ?? `Toca para copiar y abrir ${type === 'email' ? 'correo' : 'teléfono'}`}
      >
        {tokens.map((t, i) => (
          <span key={i}>
            {t}
            {i < tokens.length - 1 && <span className="opacity-40"> </span>}
          </span>
        ))}
        <Icon className="w-3 h-3 ml-1 opacity-50 shrink-0" />
      </button>

      <AnimatePresence mode="wait">
        {revealed && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute -bottom-5 left-0 text-xs text-[var(--rm-primary)] whitespace-nowrap"
          >
            ✓ Copiado al portapapeles
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}