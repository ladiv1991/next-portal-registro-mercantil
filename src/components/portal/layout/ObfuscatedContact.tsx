'use client';

import React, { useState, useCallback } from 'react';
import { Copy, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ObfuscatedContact — oculta emails y teléfonos de bots/spam-scrapers.
 *
 * Estrategia:
 *  1. El texto visible se construye con tokens separados (sin '@' ni dígitos
 *     continuos), usando un pattern dinámico en JS que los une al hacer tap.
 *  2. El valor real solo existe en closure; ningún scraper que lea el HTML
 *     puede extraerlo sin ejecutar JavaScript.
 *  3. En móvil, un tap muestra el valor real copiado al portapapeles.
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

export default function ObfuscatedContact({ fullValue, type, label, className = '' }: Props) {
  const [revealed, setRevealed] = useState(false);

  const tokens: TokenSource = type === 'email' ? buildEmailTokens(fullValue) : buildPhoneTokens(fullValue);

  const handleTap = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullValue);
      setRevealed(true);
      setTimeout(() => setRevealed(false), 1800);
    } catch {
      // Fallback: open mailto / tel directly
      if (type === 'email') window.location.href = `mailto:${fullValue}`;
      else window.location.href = `tel:${fullValue.replace(/\s/g, '')}`;
    }
  }, [fullValue, type]);

  return (
    <div className={className}>
      {/* Visible tokens — no bot can stitch them back together without running JS */}
      <button
        type="button"
        onClick={handleTap}
        className={`flex items-center gap-1 text-sm font-mono tracking-wide transition-all duration-200 ${
          revealed ? 'text-[var(--rm-primary)]' : 'text-white/70 hover:text-white'
        }`}
        style={{ fontSize: '0.8rem' }}
        aria-label={label ?? `Toca para ver ${type === 'email' ? 'correo' : 'teléfono'}`}
      >
        {tokens.map((t, i) => (
          <span key={i}>
            {t}
            {i < tokens.length - 1 && <span className="opacity-40"> </span>}
          </span>
        ))}
        <Copy className="w-3 h-3 ml-1 opacity-50 shrink-0" />
      </button>

      {/* Confirmation toast */}
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
