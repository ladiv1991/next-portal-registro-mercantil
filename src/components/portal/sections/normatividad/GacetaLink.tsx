'use client';

import { useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { findGaceta, GacetaEntry } from '@/data/gaceta-registry';

interface GacetaLinkProps {
  /** Texto completo de la norma (ej: "Resolución No. 51/2021") */
  name: string;
  /** id de la entrada en el registro (opcional, se busca por nombre si no se provee) */
  gacetaId?: string;
  /** Clase CSS adicional */
  className?: string;
  /** Si es true, muestra solo el texto sin icono */
  plain?: boolean;
}

/**
 * Componente que convierte el nombre de una norma, resolución o ley en un
 * enlace que abre el chatbot con búsqueda pre-rellenada sobre esa norma.
 *
 * Uso:
 *   <GacetaLink name="Resolución No. 51/2021" />
 *   <GacetaLink name="Ley No. 181" gacetaId="ley-181-2026" />
 */
export default function GacetaLink({ name, gacetaId, className = '', plain = false }: GacetaLinkProps) {
  const entry: GacetaEntry | undefined = gacetaId ? findGaceta(gacetaId) : findGacetaByName(name);

  if (!entry) {
    return <span className={className}>{name}</span>;
  }

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('chatbot-search', { detail: entry.name }));
  }, [entry.name]);

  const label = plain ? entry.name : (
    <span className="flex items-center gap-1">
      {entry.name}
      <ExternalLink className="w-3 h-3 text-[var(--rm-primary)] opacity-60 shrink-0" />
    </span>
  );

  return (
    <span
      onClick={handleClick}
      className={`text-[var(--rm-primary)] hover:underline font-medium transition-colors cursor-pointer ${className}`}
      title={`Consultar en chatbot: ${entry.name}`}
    >
      {label}
    </span>
  );
}