'use client';

import Link from 'next/link';
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
 * enlace a su entrada correspondiente en la Gaceta Oficial del sitio.
 *
 * Uso:
 *   <GacetaLink name="Resolución No. 51/2021" />
 *   <GacetaLink name="Ley No. 181" gacetaId="ley-181-2026" />
 */
export default function GacetaLink({ name, gacetaId, className = '', plain = false }: GacetaLinkProps) {
  const entry: GacetaEntry | undefined = gacetaId ? findGaceta(gacetaId) : findGacetaByName(name);

  if (!entry) {
    // Si no hay entrada registrada, mostrar como texto plano con el número de gaceta si se conoce
    return <span className={className}>{name}</span>;
  }

  const href = `#normatividad?gaceta=${entry.id}`;
  const label = plain ? entry.name : (
    <span className="flex items-center gap-1">
      {entry.name}
      <ExternalLink className="w-3 h-3 text-[var(--rm-primary)] opacity-60 shrink-0" />
    </span>
  );

  return (
    <Link
      href={href}
      className={`text-[var(--rm-primary)] hover:underline font-medium transition-colors ${className}`}
      title={`Ver en Gaceta Oficial: ${entry.gaceta}`}
    >
      {label}
    </Link>
  );
}