'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Scale } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeInUp, staggerContainer } from '@/data/portal-data';
import LegalFramework from './normatividad/LegalFramework';
import FeeSchedule from './normatividad/FeeSchedule';
import TaxCalculator from './normatividad/TaxCalculator';
import DownloadableForms from './normatividad/DownloadableForms';
import GacetaSection from './normatividad/GacetaSection';
import Glossary from './normatividad/Glossary';

interface RegulationItem {
  id: string;
  title: string;
  type: string;
  number?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  effectiveDate?: string;
  category?: string;
  order: number;
  visible: boolean;
}

export default function NormatividadSection() {
  const [loading, setLoading] = useState(true);
  const [regulations, setRegulations] = useState<RegulationItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/public/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setRegulations(json.data.regulations || []);
          }
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
        <section className="bg-[var(--rm-text)] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-6 w-48 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-10 w-72 mx-auto mb-3 bg-white/20" />
            <Skeleton className="h-5 w-96 mx-auto bg-white/20" />
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-xl border border-gray-200">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
      {/* Header */}
      <section className="bg-[var(--rm-text)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-white text-[var(--rm-primary)] border-[var(--rm-primary)]/30 shadow-sm">
            <Scale className="w-3 h-3 mr-1" />
            Normatividad y Recursos
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary-light mb-3">Marco Legal y Documentos</h1>
          <p className="text-[var(--rm-muted)] max-w-2xl mx-auto">
            Consulte leyes, decretos, resoluciones, formularios y aranceles del Registro Mercantil.
          </p>
        </div>
      </section>

      {/* Banner DL 133/2026 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-lg border bg-[var(--rm-primary)]/5 border-[var(--rm-primary)]/30"
        >
          <AlertTriangle className="w-5 h-5 text-[var(--rm-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[var(--rm-primary)]">
              Nueva Norma: Decreto-Ley 133/2026 — Modifica DL 88, 89 y 90 sobre Inversión Extranjera
            </p>
            <p className="text-sm text-[var(--rm-muted)] mt-1">
              Publicado en Gaceta Oficial No. 71 Ordinaria de 2026. Revisa los cambios en el marco legal de inversión extranjera.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Banner DL 120/2026 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-start gap-3 p-4 rounded-lg border bg-[var(--rm-primary)]/5 border-[var(--rm-primary)]/30"
        >
          <AlertTriangle className="w-5 h-5 text-[var(--rm-primary)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-[var(--rm-primary)]">
              Nueva Norma: Decreto-Ley 120/2026 — Actualización del Marco Normativo Registral
            </p>
            <p className="text-sm text-[var(--rm-muted)] mt-1">
              En desarrollo. Información complementaria disponible próximamente en la Gaceta Oficial.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* 1. Marco Legal */}
        {regulations.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
          >
            <LegalFramework regulations={regulations} />
          </motion.div>
        )}
        {regulations.length === 0 && <LegalFramework regulations={[]} />}

        {/* 2. Calculadora de Costos */}
        <TaxCalculator />

        {/* 3. Tarifa de Derechos */}
        <FeeSchedule />

        {/* 4. Formularios y Plantillas */}
        <DownloadableForms />

        {/* 4. Gaceta Oficial */}
        <GacetaSection />

        {/* 5. Glosario */}
        <Glossary />
      </div>
    </motion.div>
  );
}
