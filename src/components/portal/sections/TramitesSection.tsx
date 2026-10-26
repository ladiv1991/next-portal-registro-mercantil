'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeInUp, staggerContainer } from '@/data/portal-data';
import ProcedureCard from './tramites/ProcedureCard';
import ConstitutionSteps from './tramites/ConstitutionSteps';
import ModificationTypes from './tramites/ModificationTypes';
import ForeignInvestment from './tramites/ForeignInvestment';
import AuthenticationModal from '@/components/portal/auth/AuthenticationModal';
import PremiumModal from '@/components/portal/PremiumModal';

interface ProcedureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  time?: string;
  cost?: string;
  requirements?: string;
  steps?: string;
  order: number;
  visible: boolean;
}

export default function TramitesSection() {
  const [loading, setLoading] = useState(true);
  const [procedures, setProcedures] = useState<ProcedureItem[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const vuceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/public/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setProcedures(json.data.procedures || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleIniciarTramite = () => {
    setPremiumModalOpen(true);
  };

  const handlePlanSelected = () => {
    setPremiumModalOpen(false);
    setAuthModalOpen(true);
  };

  const handleNavigateVUCE = () => {
    vuceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
        <section className="bg-[var(--rm-text)] py-16">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
            <Skeleton className="h-6 w-40 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-10 w-64 mx-auto mb-3 bg-white/20" />
            <Skeleton className="h-5 w-96 mx-auto bg-white/20" />
          </div>
        </section>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-200">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
      <section className="bg-[var(--rm-text)] py-16">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <Badge className="mb-4 bg-white text-[var(--rm-primary)] border-[var(--rm-primary)]/30 shadow-sm">
            <FileText className="w-3 h-3 mr-1" />
            Trámites en Línea
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary-light mb-3">Gestión de Trámites</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Realice todos sus trámites mercantiles de forma digital. Constitución, modificaciones, situación e inversión extranjera.
          </p>
        </div>
      </section>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {procedures.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
          >
            <ProcedureCard
              onIniciarTramite={handleIniciarTramite}
              onNavigateToVUCE={handleNavigateVUCE}
            />
          </motion.div>
        ) : (
          <ProcedureCard
            onIniciarTramite={handleIniciarTramite}
            onNavigateToVUCE={handleNavigateVUCE}
          />
        )}

        <ConstitutionSteps />
        <ModificationTypes />
        <div ref={vuceRef}>
          <ForeignInvestment />
        </div>
      </div>

      <AuthenticationModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <PremiumModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        onSelectPlan={handlePlanSelected}
      />
    </motion.div>
  );
}
