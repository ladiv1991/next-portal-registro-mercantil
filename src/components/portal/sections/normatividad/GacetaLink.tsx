'use client';

import { findGaceta, findGacetaByName, GacetaEntry } from '@/data/gaceta-registry';

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
 * botón que abre el chatbot con una búsqueda sobre esa normativa.
 *
 * Uso:
 *   <GacetaLink name="Resolución No. 51/2021" />
 *   <GacetaLink name="Ley No. 181" gacetaId="ley-181-2026" />
 */
export default function GacetaLink({ name, gacetaId, className = '', plain = false }: GacetaLinkProps) {
  const entry: GacetaEntry | undefined = gacetaId ? findGaceta(gacetaId) : findGacetaByName(name);

  const handleClick = () => {
    // Open chatbot
    window.dispatchEvent(new Event('open-chatbot'));
    // Trigger search in chatbot after it opens (animation takes ~400ms)
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('chatbot-law-search', { detail: entry?.title ?? name }));
    }, 500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-[var(--rm-primary)] hover:underline font-medium transition-colors cursor-pointer bg-transparent border-none p-0 ${className}`}
      title={entry ? `Buscar sobre: ${entry.title}` : `Buscar sobre: ${name}`}
    >
      {plain ? name : (
        <span className="flex items-center gap-1">
          {entry?.name ?? name}
          {!plain && <span className="text-[var(--rm-primary)] opacity-60 text-[10px]">ⓘ</span>}
        </span>
      )}
    </button>
  );
}
