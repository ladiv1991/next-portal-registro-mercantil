'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  BookOpen, Building2, PenTool, FileSpreadsheet, Globe2,
  CheckCircle2, ChevronRight,
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen, Building2, PenTool, FileSpreadsheet, Globe2, FileText: BookOpen,
};

interface GuideStep {
  title: string;
  description: string;
}

interface GuideData {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: string;
  order: number;
  visible: boolean;
}

const FALLBACK_GUIDES: GuideData[] = [
  {
    id: '1', title: 'Guía de Constitución de SRL', description: 'Paso a paso para constituir una Sociedad de Responsabilidad Limitada', icon: 'Building2',
    steps: JSON.stringify([
      { title: 'Solicitud de Denominación', description: 'Presente la solicitud de denominación social ante el Registro Mercantil, verificando la disponibilidad del nombre.' },
      { title: 'Redacción de Estatutos', description: 'Elabore los estatutos sociales con los requisitos legales vigentes, incluyendo objeto social, capital, socios y administración.' },
      { title: 'Aporte de Capital', description: 'Realice el aporte de capital social inicial en la entidad bancaria autorizada y obtenga el certificado correspondiente.' },
      { title: 'Registro en el RMC', description: 'Presente toda la documentación ante el Registro Mercantil de Cuba para la inscripción oficial de la sociedad.' },
    ]),
    order: 0, visible: true,
  },
  {
    id: '2', title: 'Guía de Modificaciones', description: 'Cómo realizar modificaciones en los datos de su sociedad', icon: 'PenTool',
    steps: JSON.stringify([
      { title: 'Identificar la Modificación', description: 'Determine qué aspecto de la sociedad necesita modificar: objeto social, capital, administración, domicilio, etc.' },
      { title: 'Preparar Documentación', description: 'Reúna la documentación requerida según el tipo de modificación: actas de junta, escrituras, certificados.' },
      { title: 'Presentar ante el RMC', description: 'Presente la solicitud de modificación con toda la documentación ante el Registro Mercantil correspondiente.' },
    ]),
    order: 1, visible: true,
  },
  {
    id: '3', title: 'Guía de Estado de Situación', description: 'Proceso de preparación y depósito de estado de situación', icon: 'FileSpreadsheet',
    steps: JSON.stringify([
      { title: 'Cierre Contable', description: 'Realice el cierre del ejercicio contable con los estados financieros correspondientes.' },
      { title: 'Auditoría Externa', description: 'Obtenga la auditoría externa de los estados financieros realizada por una firma autorizada.' },
    ]),
    order: 2, visible: true,
  },
  {
    id: '4', title: 'Guía de Inversión Extranjera (VUCE)', description: 'Requisitos y proceso para inversión extranjera en Cuba', icon: 'Globe2',
    steps: JSON.stringify([
      { title: 'Aprobación del MIC', description: 'Obtenga la aprobación del Ministerio de Inversión Extranjera (VUCE) para su proyecto de inversión.' },
      { title: 'Constitución de la Empresa', description: 'Constituya la empresa mixta o de capital 100% extranjero según la modalidad aprobada.' },
    ]),
    order: 3, visible: true,
  },
];

export default function GuidesSection() {
  const [guides, setGuides] = useState<GuideData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState<GuideData | null>(null);
  const [parsedSteps, setParsedSteps] = useState<GuideStep[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/public/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data.guides?.length > 0) {
            setGuides(json.data.guides);
          } else {
            setGuides(FALLBACK_GUIDES);
          }
        } else {
          setGuides(FALLBACK_GUIDES);
        }
      } catch {
        setGuides(FALLBACK_GUIDES);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const openGuide = (guide: GuideData) => {
    setSelectedGuide(guide);
    try {
      const steps = JSON.parse(guide.steps || '[]');
      setParsedSteps(Array.isArray(steps) ? steps : []);
    } catch {
      setParsedSteps([]);
    }
  };

  const stepsContent = parsedSteps.length === 0 ? (
    <div className="text-center py-8 text-muted-foreground">
      <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p>No hay pasos disponibles para esta guía.</p>
    </div>
  ) : (
    <div className="space-y-4">
      {parsedSteps.map((step, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.3 }}
          className="glass-card-inner p-5 flex gap-4 items-start"
        >
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-full bg-[var(--rm-primary)] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-cuban-red/20">
              {idx + 1}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-[var(--rm-text)] mb-1">{step.title || `Paso ${idx + 1}`}</h4>
            {step.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            )}
          </div>
          {idx === parsedSteps.length - 1 && (
            <div className="shrink-0 self-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
          )}
        </motion.div>
      ))}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: parsedSteps.length * 0.1 + 0.3 }}
        className="mt-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-center"
      >
        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-green-800">¡Proceso completado!</p>
        <p className="text-xs text-green-600 mt-1">Si necesita ayuda adicional, contacte nuestro soporte.</p>
      </motion.div>
    </div>
  );

  const GuideIcon = selectedGuide ? (iconMap[selectedGuide.icon] || BookOpen) : BookOpen;

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-[var(--rm-text)] mb-6 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[var(--rm-primary)]" />
        Guías Paso a Paso
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {guides.map((guide) => {
          const IconComponent = iconMap[guide.icon] || BookOpen;
          const stepsCount = (() => {
            try { return JSON.parse(guide.steps || '[]').length; } catch { return 0; }
          })();
          return (
            <motion.div key={guide.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
              <Card className="glass-card-inner cursor-pointer overflow-hidden group" onClick={() => openGuide(guide)}>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--rm-primary)]/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-[var(--rm-primary)]/20 transition-colors">
                    <IconComponent className="w-8 h-8 text-[var(--rm-primary)]" />
                  </div>
                  <h3 className="font-bold text-[var(--rm-text)] mb-2">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{guide.description}</p>
                  <Badge variant="outline" className="text-[var(--rm-primary)] border-[var(--rm-primary)]/30">{stepsCount} pasos</Badge>
                  <div className="mt-3 text-xs text-[var(--rm-primary)] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    Ver guía completa <ChevronRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Guide Detail Modal */}
      <Dialog open={!!selectedGuide} onOpenChange={(open) => !open && setSelectedGuide(null)}>
        <DialogContent className="sm:max-w-2xl p-0 gap-0 max-h-[90vh] flex flex-col overflow-hidden">
          {/* Fixed Header */}
          <div className="bg-gradient-to-r from-cuban-red/10 via-gold/10 to-cuban-red/5 px-6 py-6 shrink-0">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[var(--rm-text)] flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--rm-primary)]/15 flex items-center justify-center shrink-0">
                  <GuideIcon className="w-6 h-6 text-[var(--rm-primary)]" />
                </div>
                <span>{selectedGuide?.title}</span>
              </DialogTitle>
              <DialogDescription className="mt-2 text-base">{selectedGuide?.description}</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Steps */}
          <div className="overflow-y-auto flex-1 overscroll-contain px-6 py-6">
            {stepsContent}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
