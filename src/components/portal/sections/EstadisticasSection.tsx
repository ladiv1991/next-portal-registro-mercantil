'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import {
  BarChart3, Building2, TrendingUp, Activity, PenTool, Download, FileText, ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fadeInUp, staggerContainer } from '@/data/portal-data';

// Lazy-load chart components (heavy: recharts adds ~80KB+)
const SocietiesPieChart = dynamic(() => import('./estadisticas/SocietiesPieChart'), { ssr: false });
const ConstitutionsBarChart = dynamic(() => import('./estadisticas/ConstitutionsBarChart'), { ssr: false });
const SectorsHorizontalChart = dynamic(() => import('./estadisticas/SectorsHorizontalChart'), { ssr: false });
const ProvinceDistribution = dynamic(() => import('./estadisticas/ProvinceDistribution'), { ssr: false });

interface StatisticItem {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  icon?: string;
  order: number;
  visible: boolean;
}

export default function EstadisticasSection() {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<StatisticItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/public/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setStatistics(json.data.statistics || []);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fallbackIndicators = [
    { label: 'Total Sociedades', value: '45,280', change: '+4.2%', icon: Building2, positive: true },
    { label: 'Nuevas Constituciones', value: '3,840', change: '+12.5%', icon: TrendingUp, positive: true },
    { label: 'Cancelaciones', value: '650', change: '-25.3%', icon: Activity, positive: false },
    { label: 'Modificaciones', value: '8,720', change: '+8.1%', icon: PenTool, positive: true },
  ];

  const indicators = statistics.length > 0
    ? statistics.filter((s) => s.visible !== false).slice(0, 4).map((s) => ({
        label: s.label,
        value: s.value,
        change: '+0%',
        icon: Building2,
        positive: true,
      }))
    : fallbackIndicators;

  if (loading) {
    return (
      <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
        <section className="bg-[#1A1A1A] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Skeleton className="h-6 w-48 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-10 w-64 mx-auto mb-3 bg-white/20" />
            <Skeleton className="h-5 w-96 mx-auto bg-white/20" />
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200">
                <Skeleton className="h-5 w-20 mb-2" />
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-6 rounded-xl border border-gray-200">
                <Skeleton className="h-6 w-1/3 mb-4" />
                <Skeleton className="h-64 w-full" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
      {/* Header */}
      <section className="bg-[#1A1A1A] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-[#9E3A2E]/20 text-[#9E3A2E] border-[#9E3A2E]/30">
            <BarChart3 className="w-3 h-3 mr-1" />
            Estadísticas y Datos Abiertos
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary-light mb-3">Panel de Estadísticas</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Datos estadísticos del Registro Mercantil. Transparencia y acceso a la información registral.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Key Indicators */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {indicators.map((ind, i) => (
            <motion.div key={ind.label + i} variants={fadeInUp}>
              <Card className="glass-card-inner overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <ind.icon className="w-5 h-5 text-[#9E3A2E]" />
                    <Badge className={ind.positive ? 'bg-green-100 text-green-800 text-xs' : 'bg-red-100 text-red-800 text-xs'}>
                      {ind.change}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{ind.value}</p>
                  <p className="text-xs text-muted-foreground">{ind.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SocietiesPieChart />
          <ConstitutionsBarChart />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SectorsHorizontalChart />
          <ProvinceDistribution />
        </div>

        {/* Open Data & Downloads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-[#9E3A2E]" />
                <CardTitle className="text-[#1A1A1A]">Informes Descargables</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: 'Informe Anual 2024', format: 'PDF', size: '2.4 MB' },
                  { title: 'Boletín Estadístico Q4 2024', format: 'PDF', size: '1.1 MB' },
                  { title: 'Datos Abiertos - Sociedades Activas', format: 'CSV', size: '4.8 MB' },
                  { title: 'Serie Histórica 2015-2024', format: 'XLSX', size: '3.2 MB' },
                  { title: 'Reporte de Inversión Extranjera (VUCE) 2024', format: 'PDF', size: '1.8 MB' },
                ].map((report) => (
                  <div key={report.title} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-[#7A2A1E]/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[#1A1A1A]/5 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#1A1A1A]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A] group-hover:text-[#9E3A2E] transition-colors">{report.title}</p>
                        <p className="text-xs text-muted-foreground">{report.format} • {report.size}</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-muted-foreground group-hover:text-[#9E3A2E]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#9E3A2E]" />
                <CardTitle className="text-[#1A1A1A]">Portal de Datos Abiertos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Acceda a las APIs y conjuntos de datos del Registro Mercantil para aplicaciones de terceros e investigación.
                </p>
                <div className="space-y-3">
                  {[
                    { title: 'API REST de Consultas', desc: 'Endpoints para búsqueda de sujetos, representantes y actos registrales', status: 'Vigente' },
                    { title: 'Dataset Sociedades Activas', desc: 'Conjunto completo de datos de sociedades activas con actualización diaria', status: 'Vigente' },
                    { title: 'Dataset Estadístico', desc: 'Datos agregados de constituciones, cancelaciones y modificaciones', status: 'Vigente' },
                    { title: 'API de Verificación CSV', desc: 'Servicio de verificación de documentos registrales por código CSV', status: 'Vigente' },
                  ].map((api) => (
                    <div key={api.title} className="p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-[#1A1A1A]">{api.title}</h4>
                        <Badge className="bg-green-100 text-green-800 text-xs">{api.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{api.desc}</p>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A]/5">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Documentación de APIs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
