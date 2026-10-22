'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ReactMarkdown from 'react-markdown';
import {
  Search, FileText, Building2, PenTool, Globe2,
  Award, ArrowRight, Star, FileCheck, Eye, Shield,
  Zap, Clock, Headphones, Smartphone, BookOpen,
  ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { fadeInUp, staggerContainer } from '@/data/portal-data';
import AuthenticationModal from '@/components/portal/auth/AuthenticationModal';
import PremiumModal from '@/components/portal/PremiumModal';

// ===================== TYPES =====================
interface SliderItem {
  id: string;
  title: string;
  subtitle?: string;
  message?: string;
  imageUrl?: string;
  link?: string;
  linkLabel?: string;
  order: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color?: string;
  sectionId?: string;
  order: number;
  visible: boolean;
}

interface StatisticItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  icon?: string;
  order: number;
  visible: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  category?: string;
  imageUrl?: string;
  source?: string;
  publishedAt?: string;
  featured?: boolean;
  order: number;
}

interface SearchResult {
  id: string;
  name: string;
  nire: string;
  type?: string;
  province?: string;
  status?: string;
}

interface PublicContent {
  sliders: SliderItem[];
  services: ServiceItem[];
  statistics: StatisticItem[];
  news: NewsItem[];
}

// ===================== ICON MAP =====================
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search, FileText, Building2, PenTool, Globe2, Award,
  Smartphone, Eye, Shield, Zap, Clock, Headphones,
  Star, FileCheck, BookOpen,
};

// ===================== ANIMATED COUNTER =====================
function AnimatedCounter({ value, suffix = '', delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const numericValue = typeof value === 'number' ? value : parseInt(String(value).replace(/\D/g, ''), 10) || 0;

  const [displayValue, setDisplayValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const startTimer = setTimeout(() => {
      setStarted(true);
    }, delay);
    return () => clearTimeout(startTimer);
  }, [isInView, delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 2200;
    const steps = 70;
    const increment = numericValue / steps;
    let current = 0;
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      // Ease-out cubic
      const progress = frame / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.min(Math.floor(eased * numericValue), numericValue);
      setDisplayValue(current);
      if (frame >= steps) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, numericValue]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5, y: 20 }}
      animate={started ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.7, type: 'spring', stiffness: 180, damping: 15 }}
      className="text-center"
    >
      <span className="text-3xl md:text-5xl font-extrabold tabular-nums bg-clip-text text-transparent" style={{
        backgroundImage: 'linear-gradient(135deg, var(--c-accent, var(--rm-primary)) 0%, var(--c-accent-light, var(--rm-primary-light)) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {displayValue.toLocaleString('es-ES')}{suffix}
      </span>
    </motion.div>
  );
}

// ===================== FLOATING PARTICLE =====================
function FloatingParticle({ delay, x, size, color }: { delay: number; x: number; size: number; color?: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        bottom: '-10px',
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color || 'var(--c-accent, var(--rm-primary))'}, transparent)`,
        opacity: 0.06,
      }}
      animate={{
        y: [0, -80, -160, -240],
        opacity: [0, 0.06, 0.03, 0],
        scale: [1, 1.2, 0.8, 0.5],
      }}
      transition={{
        duration: 6,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

// ===================== MAIN COMPONENT =====================
export default function HomeSection({ onNavigate }: { onNavigate: (id: string, query?: string) => void }) {
  const [content, setContent] = useState<PublicContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Fetch public content
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/public/content');
        if (res.ok) {
          const json = await res.json();
          if (json.success) setContent(json.data);
        }
      } catch {
        // Silent fail - will use fallback static data
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Search handler with debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    setShowSearchDropdown(true);
    setSearchLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = await res.json();
          setSearchResults(json.success ? (json.data?.results || []) : []);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
  }, []);

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  // Track current slide index
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentSlide(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  // Sync current slide for AnimatePresence text transitions
  const [animKey, setAnimKey] = useState(0);
  useEffect(() => {
    setAnimKey((k) => k + 1);
  }, [currentSlide]);

  // Active sliders
  const sliders = content?.sliders?.length ? content.sliders : [];
  const services = content?.services?.length ? content.services : [];
  const statistics = content?.statistics?.length ? content.statistics : [];
  const newsItems = content?.news?.length ? content.news : [];

  const handleAccederClick = () => {
    // First show premium modal with plans
    setPremiumModalOpen(true);
  };

  const handlePlanSelected = () => {
    // After selecting a plan, show auth modal
    setPremiumModalOpen(false);
    setAuthModalOpen(true);
  };

  // Fallback static data for when no API data
  const fallbackStats = [
    { label: 'Sociedades activas', value: '45280', suffix: '+', icon: 'Building2' },
    { label: 'Trámites digitales', value: '128500', suffix: '+', icon: 'FileText' },
    { label: 'Constituciones 2025', value: '3840', suffix: '+', icon: 'Building2' },
    { label: 'Certificaciones emitidas', value: '67200', suffix: '+', icon: 'Award' },
  ];

  const activeStats = statistics.length > 0
    ? statistics.filter((s) => s.visible !== false)
    : fallbackStats;

  return (
    <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
      {/* ============ HERO SLIDER ============ */}
      <section className="relative h-[420px] sm:h-[480px] md:h-[540px] overflow-hidden">
        {loading ? (
          /* Loading skeleton for hero */
          <div className="absolute inset-0 bg-[var(--rm-text)]">
            <Skeleton className="w-full h-full" />
          </div>
        ) : sliders.length > 0 ? (
          /* Dynamic carousel */
          <div className="absolute inset-0" ref={emblaRef}>
            <div className="flex h-full">
              {sliders.map((slide, idx) => (
                <div key={slide.id} className="flex-none w-full h-full relative">
                  {slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                  <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {currentSlide === idx && (
                        <motion.div
                          key={animKey}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.6 }}
                        >
                          {slide.subtitle && (
                            <Badge className="mb-3 bg-[var(--rm-primary)]/20 text-[var(--rm-primary)] border-[var(--rm-primary)]/30 text-xs sm:text-sm px-3 py-0.5 sm:px-4 sm:py-1">
                              <Star className="w-3 h-3 mr-1" />
                              {slide.subtitle}
                            </Badge>
                          )}
                          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight max-w-3xl">
                            {slide.title}
                          </h1>
                          {slide.message && (
                            <p className="text-sm sm:text-base md:text-lg text-gray-300 max-w-2xl mb-6 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none">
                              {slide.message}
                            </p>
                          )}
                          {slide.linkLabel && (
                            <Button
                              size="lg"
                              className="bg-[var(--rm-primary)] text-[var(--rm-text)] hover:bg-[var(--rm-primary)]-light font-semibold text-sm sm:text-base"
                              onClick={() => slide.link && window.open(slide.link, '_blank')}
                            >
                              {slide.linkLabel} <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>

            {/* Prev/Next arrows - hidden on small screens, shown on md+ */}
            {sliders.length > 1 && (
              <>
                <button
                  onClick={scrollPrev}
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all items-center justify-center"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollNext}
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all items-center justify-center"
                  aria-label="Siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Dot indicators at bottom-20 */}
            {sliders.length > 1 && (
              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {sliders.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => emblaApi?.scrollTo(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentSlide
                        ? 'bg-[var(--rm-primary)] w-7'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Fallback static hero */
          <div className="absolute inset-0">
            <img
              src="/hero-banner.png"
              alt="Registro Mercantil de Cuba"
              className="w-full h-full object-cover"
            />
            <div className="hero-overlay absolute inset-0" />
            <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 h-full flex flex-col justify-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <Badge className="mb-3 sm:mb-4 bg-[var(--rm-primary)]/20 text-[var(--rm-primary)] border-[var(--rm-primary)]/30 text-xs sm:text-sm px-3 py-0.5 sm:px-4 sm:py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Portal Digital Oficial
                </Badge>
                <h1 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                  Portal del{' '}
                  <span className="beige-gradient">Registro Mercantil</span>
                  <br />
                  de Cuba
                </h1>
                <p className="text-sm sm:text-lg md:text-xl text-gray-300 max-w-2xl mb-6 sm:mb-8 leading-relaxed line-clamp-3 sm:line-clamp-none">
                  Plataforma digital para la gestión integral del Registro Mercantil.
                  Transformación digital al servicio de la seguridad jurídica y el desarrollo económico.
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Button
                    size="lg"
                    className="bg-[var(--rm-primary)] text-[var(--rm-text)] hover:bg-[var(--rm-primary)]-light font-semibold text-xs sm:text-sm"
                    onClick={() => onNavigate('consultas')}
                  >
                    <Search className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Consultar Sociedades</span>
                    <span className="sm:hidden">Consultar</span>
                  </Button>
                  <Button
                    size="lg"
                    className="bg-white text-[var(--rm-text)] hover:bg-gray-100 font-semibold shadow-lg shadow-black/20 text-xs sm:text-sm"
                    onClick={() => onNavigate('tramites')}
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5 sm:mr-2" />
                    <span className="hidden sm:inline">Iniciar Trámite</span>
                    <span className="sm:hidden">Trámites</span>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </section>

      {/* ============ SEARCH BLOCK ============ */}
      <section className="relative -mt-10 sm:-mt-14 md:-mt-16 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto glass-card shadow-xl shadow-navy/15 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-[var(--rm-primary)]/10 text-[var(--rm-primary)] px-4 py-1.5 rounded-full text-sm font-medium mb-3">
              <Search className="w-4 h-4" />
              Servicio más utilizado
            </div>
            <h2 className="text-xl sm:text-2xl font-bold gradient-text-primary">Consulte una denominación en el Registro Mercantil</h2>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">Verifique la disponibilidad de denominaciones sociales y consulte información pública de sociedades inscritas</p>
          </div>
          <div ref={searchRef} className="relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Ingrese denominación ..."
                  className="pl-10 h-12 text-base border-gray-300 focus:border-[var(--rm-primary)] focus:ring-cuban-red/20 rounded-xl"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                />
                {searchLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground animate-spin" />
                )}
              </div>
              <Button
                className="h-12 px-6 bg-[var(--rm-text)] text-white hover:bg-[var(--rm-text)]-light rounded-xl font-semibold text-base shadow-md"
                onClick={() => searchQuery.trim() ? onNavigate('consultas', searchQuery) : onNavigate('consultas')}
              >
                Buscar
              </Button>
            </div>

            {/* Search Results Dropdown */}
            {showSearchDropdown && (
              <>
                {searchLoading && searchResults.length === 0 ? (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--rm-text)]" />
                    <p className="text-sm text-muted-foreground">Buscando resultados...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--rm-primary)]/5 transition-colors text-left border-b border-gray-50 last:border-0"
                        onClick={() => {
                          setShowSearchDropdown(false);
                          setSearchQuery(result.name);
                          // Navigate to consultas with the selected company name
                          onNavigate('consultas', result.name);
                        }}
                      >
                        <div>
                          <p className="text-sm font-medium text-[var(--rm-text)]">{result.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {result.nire}
                            {result.type ? ` • ${result.type}` : ''}
                            {result.province ? ` • ${result.province}` : ''}
                          </p>
                        </div>
                        {result.status && (
                          <Badge className={
                            result.status === 'Vigente'
                              ? 'bg-green-100 text-green-800 text-xs'
                              : 'bg-yellow-100 text-yellow-800 text-xs'
                          }>
                            {result.status}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  searchQuery.trim() && !searchLoading && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 text-center">
                      <p className="text-sm text-muted-foreground">No se encontraron resultados para &quot;{searchQuery}&quot;</p>
                    </div>
                  )
                )}
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-5 pt-5 border-t border-gray-100">
            <button onClick={() => onNavigate('consultas')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--rm-primary)] transition-colors">
              <Building2 className="w-4 h-4" /> Búsqueda por nombre
            </button>
            <button onClick={() => onNavigate('consultas')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--rm-primary)] transition-colors">
              <FileCheck className="w-4 h-4" /> Consultar NIRE
            </button>
            <button onClick={() => onNavigate('consultas')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--rm-primary)] transition-colors">
              <Award className="w-4 h-4" /> Verificar certificación
            </button>
            <button onClick={() => onNavigate('consultas')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--rm-primary)] transition-colors">
              <FileText className="w-4 h-4" /> Nota simple
            </button>
          </div>
        </div>
      </section>

      {/* ============ SERVICES GRID ============ */}
      <section className="py-16 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary">Servicios Principales</h2>
            <p className="text-muted-foreground mt-2">Acceda rápidamente a los servicios del Registro Mercantil</p>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="border-gray-200">
                  <CardHeader className="pb-3">
                    <Skeleton className="w-12 h-12 rounded-lg mb-2" />
                    <Skeleton className="h-6 w-3/4" />
                  </CardHeader>
                  <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3 mt-2" /></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {(services.length > 0 ? services : [
                { title: 'Consultas Públicas', description: 'Busque sociedades, representantes y documentos registrados', icon: 'Search', color: 'bg-[var(--rm-text)]', sectionId: 'consultas' },
                { title: 'Solicitud de Primera Inscripción de un Sujeto', description: 'Inicie el proceso de constitución de forma digital', icon: 'Building2', color: 'bg-[var(--rm-primary)]', sectionId: 'tramites' },
                { title: 'Modificaciones', description: 'Realice solicitud de inscripción de modificaciones de los datos registrales de su sujeto', icon: 'PenTool', color: 'bg-[var(--rm-primary)]', sectionId: 'tramites' },
                { title: 'Estado de Situación', description: 'Deposite y consulte estado de situación de sociedades', icon: 'FileText', color: 'bg-[var(--rm-text)]', sectionId: 'tramites' },
                { title: 'Inversión Extranjera (VUCE)', description: 'Trámites para representaciones y sucursales extranjeras', icon: 'Globe2', color: 'bg-[var(--rm-primary)]', sectionId: 'tramites' },
                { title: 'Certificaciones', description: 'Obtenga certificaciones y notas simples registrales', icon: 'Award', color: 'bg-[var(--rm-primary)]', sectionId: 'consultas' },
              ]).map((card: ServiceItem | { title: string; description: string; icon: string; color: string; sectionId: string }, idx) => {
                const cardData = card as ServiceItem & { color?: string; sectionId?: string };
                const IconComp = iconMap[cardData.icon || ''] || FileText;

                // Theme-aware icon box colors: use CSS variables for fallback colors
                const rawColor = cardData.color || '';
                const isHexColor = rawColor.startsWith('#');

                // Map old class names to theme CSS variables
                const colorFallbacks: Record<string, string> = {
                  'bg-[var(--rm-primary)]': 'var(--c-accent, var(--rm-primary))',
                  'bg-[var(--rm-text)]': 'var(--c-navy, var(--rm-text))',
                  'bg-[var(--rm-primary)]': 'var(--c-warm, var(--rm-primary))',
                };

                const iconBoxBg = isHexColor ? rawColor : (colorFallbacks[rawColor] || 'var(--c-accent, var(--rm-primary))');

                return (
                  <motion.div key={cardData.id || idx} variants={fadeInUp}>
                    <Card
                      className="glass-card-inner cursor-pointer group h-full"
                      onClick={handleAccederClick}
                      style={{
                        // Theme-aware hover: lighten accent for subtle hover background
                        // @ts-ignore
                        '--card-hover-bg': 'var(--c-accent)',
                      } as React.CSSProperties}
                    >
                      <CardHeader className="pb-3">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
                          style={{ backgroundColor: iconBoxBg }}
                        >
                          <IconComp className="w-6 h-6 text-white" />
                        </div>
                        <CardTitle
                          className="text-lg transition-colors duration-200"
                          style={{
                            color: 'var(--c-navy, var(--rm-text))',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--c-accent-dark, var(--rm-primary))';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--c-navy, var(--rm-text))';
                          }}
                        >
                          {cardData.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{cardData.description}</p>
                      </CardContent>
                      <CardFooter>
                        <span
                          className="text-sm font-semibold flex items-center gap-1 transition-all duration-200"
                          style={{
                            color: 'var(--c-accent, var(--rm-primary))',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--c-accent-dark, var(--rm-primary))';
                            e.currentTarget.style.gap = '0.5rem';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--c-accent, var(--rm-primary))';
                            e.currentTarget.style.gap = '0.25rem';
                          }}
                        >
                          Acceder <ArrowRight className="w-4 h-4" />
                        </span>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ============ STATISTICS COUNTER ============ */}
      <section className="relative py-20 overflow-hidden multicolor-glow">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingParticle delay={0} x={10} size={120} color="var(--rm-primary)" />
          <FloatingParticle delay={1.5} x={30} size={80} color="var(--rm-primary)" />
          <FloatingParticle delay={3} x={55} size={100} color="var(--rm-primary)" />
          <FloatingParticle delay={4.5} x={75} size={60} color="var(--rm-primary-light)" />
          <FloatingParticle delay={2} x={90} size={90} color="var(--rm-primary)" />
        </div>

        {/* Section title */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary">
              Registro Mercantil en Cifras
            </h2>
            <p className="text-muted-foreground mt-2">Datos actualizados de nuestra gestión registral</p>
          </motion.div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center p-6 bg-white rounded-2xl shadow-sm">
                  <Skeleton className="w-8 h-8 rounded-full mx-auto mb-3" />
                  <Skeleton className="h-10 w-24 mx-auto mb-2" />
                  <Skeleton className="h-4 w-32 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {activeStats.map((stat, i) => {
                const IconComp = iconMap[stat.icon || ''] || Building2;
                return (
                  <motion.div
                    key={stat.id || stat.label}
                    initial={{ opacity: 0, y: 40, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{
                      type: 'spring',
                      stiffness: 150,
                      damping: 18,
                      delay: i * 0.12,
                    }}
                    whileHover={{
                      y: -6,
                      scale: 1.03,
                      transition: { duration: 0.25, ease: 'easeOut' },
                    }}
                    className="relative text-center p-6 md:p-8 glass-card-inner overflow-hidden group cursor-default"
                  >
                    {/* Decorative corner gradient */}
                    <div
                      className="absolute top-0 right-0 w-24 h-24 opacity-[0.04] rounded-bl-[60px] group-hover:opacity-[0.08] transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(135deg, var(--c-accent, var(--rm-primary)) 0%, var(--c-accent-light, var(--rm-primary-light)) 100%)',
                      }}
                    />

                    {/* Progress ring decoration */}
                    <div className="relative inline-flex mb-5">
                      <motion.div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto relative"
                        style={{ backgroundColor: 'var(--c-accent, var(--rm-primary))' }}
                        initial={{ rotate: -10, scale: 0 }}
                        whileInView={{ rotate: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 220, damping: 16, delay: i * 0.12 + 0.2 }}
                      >
                        <IconComp className="w-7 h-7 text-white" />
                        {/* Pulse ring */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{ border: '2px solid var(--c-accent, var(--rm-primary))' }}
                          initial={{ scale: 1, opacity: 0.5 }}
                          whileInView={{ scale: 1.5, opacity: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.5, delay: i * 0.12 + 0.5, repeat: Infinity, repeatDelay: 2 }}
                        />
                      </motion.div>
                    </div>

                    {/* Animated counter */}
                    <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} delay={i * 150} />

                    {/* Label */}
                    <motion.p
                      className="text-sm font-medium mt-2"
                      style={{ color: 'var(--rm-muted)' }}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 + 0.4 }}
                    >
                      {stat.label}
                    </motion.p>

                    {/* Animated underline bar */}
                    <motion.div
                      className="h-[2px] rounded-full mt-4 mx-auto"
                      style={{
                        background: 'linear-gradient(90deg, transparent, var(--c-accent, var(--rm-primary)), transparent)',
                      }}
                      initial={{ width: 0 }}
                      whileInView={{ width: '40px' }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.12 + 0.6, ease: 'easeOut' }}
                    />
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom decorative gradient */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(158,58,46,0.1), transparent)',
          }}
        />
      </section>

      {/* ============ NEWS GRID ============ */}
      <section className="py-16 bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary">Noticias y Anuncios</h2>
              <p className="text-muted-foreground mt-1">Últimas novedades del Registro Mercantil</p>
            </div>
            <Button variant="outline" className="hidden sm:flex border-[var(--rm-primary)] text-[var(--rm-primary)] hover:bg-[var(--rm-primary)]/10">
              Ver todas <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-gray-200 overflow-hidden">
                  <Skeleton className="h-2 w-full" />
                  <CardHeader><Skeleton className="h-4 w-20 mb-2" /><Skeleton className="h-6 w-full" /></CardHeader>
                  <CardContent><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4 mt-2" /></CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {(newsItems.length > 0 ? newsItems : [
                { title: 'Nueva plataforma digital para trámites mercantiles', summary: 'El Registro Mercantil lanza su nueva plataforma que permite realizar la totalidad de los trámites de forma digital, reduciendo tiempos y facilitando el acceso a los servicios registrales.', category: 'Innovación', publishedAt: '2025-01-15' },
                { title: 'Actualización del Tarifa de Derechos 2025', summary: 'Se publica el nuevo tarifa de derechos con tarifas actualizadas para todos los trámites registrales, incluyendo nuevas tarifas para servicios digitales.', category: 'Normativa', publishedAt: '2025-01-08' },
                { title: 'Plan de modernización del Registro Mercantil 2025-2027', summary: 'El Ministerio de Justicia aprueba el plan de modernización que incluye digitalización total, interoperabilidad con otros registros y mejora de servicios al ciudadano.', category: 'Institucional', publishedAt: '2025-01-02' },
              ]).map((item, i) => {
                const news = item as NewsItem;
                const categoryColor = news.category === 'Innovación' ? 'bg-[var(--rm-primary)]' : news.category === 'Normativa' ? 'bg-[var(--rm-primary)]' : 'bg-[var(--rm-text)]';
                const categoryBg = news.category === 'Innovación' ? 'bg-[var(--rm-primary)]/10 text-[var(--rm-primary)]' : news.category === 'Normativa' ? 'bg-[var(--rm-primary)]/10 text-[var(--rm-primary)]' : 'bg-[var(--rm-text)]/10 text-[var(--rm-text)]';
                const dateStr = news.publishedAt
                  ? new Date(news.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
                  : '';
                return (
                  <motion.div key={news.id || i} variants={fadeInUp}>
                    <Card className="glass-card-inner overflow-hidden h-full flex flex-col">
                      <div className={`h-2 ${categoryColor}`} />
                      <CardHeader className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {news.category && (
                            <Badge variant="secondary" className={categoryBg}>
                              {news.category}
                            </Badge>
                          )}
                          {dateStr && (
                            <span className="text-xs text-muted-foreground">{dateStr}</span>
                          )}
                        </div>
                        <CardTitle className="text-lg text-[var(--rm-text)] leading-snug">{news.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-sm text-muted-foreground leading-relaxed">{news.summary}</p>
                      </CardContent>
                      <CardFooter>
                        <button
                          className="text-sm text-[var(--rm-primary)] font-medium flex items-center gap-1 hover:gap-2 transition-all"
                          onClick={() => setSelectedNews(news)}
                        >
                          Leer más <ArrowRight className="w-4 h-4" />
                        </button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* ============ BENEFITS SECTION (static) ============ */}
      <section className="py-16 bg-[var(--rm-text)]">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">¿Por qué elegir nuestro portal?</h2>
            <p className="text-gray-300 mt-2">Beneficios de la plataforma digital del Registro Mercantil</p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { title: '100% Digital', description: 'Todos los trámites pueden realizarse de forma electrónica', icon: Smartphone },
              { title: 'Transparencia Total', description: 'Acceso público a información registral verificable', icon: Eye },
              { title: 'Seguridad Jurídica', description: 'Certificaciones con validez legal y firma digital', icon: Shield },
              { title: 'Rapidez', description: 'Reducción del 70% en tiempos de procesamiento', icon: Zap },
              { title: 'Accesibilidad', description: 'Plataforma disponible las 24 horas, 7 días a la semana', icon: Clock },
              { title: 'Soporte Integral', description: 'Asistencia técnica y jurídica en cada paso del proceso', icon: Headphones },
            ].map((benefit) => (
              <motion.div key={benefit.title} variants={fadeInUp}>
                <div className="p-6 glass-card-dark multicolor-shimmer">
                  <benefit.icon className="w-8 h-8 text-[var(--rm-primary)] mb-4" />
                  <h3 className="text-white font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ CTA SECTION (static) ============ */}
      <section className="py-16 bg-[var(--rm-primary)]/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold gradient-text-primary mb-4">¿Necesita ayuda con un trámite?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Nuestro equipo de especialistas está disponible para brindarle asistencia personalizada
            en cada paso del proceso registral.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-[var(--rm-text)] text-white hover:bg-[var(--rm-text)]-light" onClick={() => onNavigate('asistencia')}>
              <Headphones className="w-4 h-4 mr-2" />
              Centro de Asistencia
            </Button>
            <Button size="lg" variant="outline" className="border-[var(--rm-text)] text-[var(--rm-text)] hover:bg-[var(--rm-text)]/5" onClick={() => onNavigate('normatividad')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Consultar Normativa
            </Button>
          </div>
        </div>
      </section>

      {/* ============ SERVICE DETAIL DIALOG ============ */}
      <Dialog open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[var(--rm-text)]">{selectedService?.title}</DialogTitle>
            <DialogDescription>{selectedService?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Este servicio está disponible a través del portal del Registro Mercantil. 
              Para más información, consulte la sección de trámites o contacte con nuestro equipo de asistencia.
            </p>
            <div className="flex gap-3">
              <Button className="flex-1 bg-[var(--rm-text)] hover:bg-[var(--rm-text)]-light text-white" onClick={() => { setSelectedService(null); onNavigate('tramites'); }}>
                <FileText className="w-4 h-4 mr-2" />
                Iniciar Trámite
              </Button>
              <Button variant="outline" className="flex-1 border-[var(--rm-text)] text-[var(--rm-text)]" onClick={() => { setSelectedService(null); onNavigate('asistencia'); }}>
                <Headphones className="w-4 h-4 mr-2" />
                Asistencia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ============ NEWS DETAIL DIALOG ============ */}
      <Dialog open={!!selectedNews} onOpenChange={(open) => !open && setSelectedNews(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              {selectedNews?.category && (
                <Badge variant="secondary" className={
                  selectedNews.category === 'Innovación' ? 'bg-[var(--rm-primary)]/10 text-[var(--rm-primary)]' :
                  selectedNews.category === 'Normativa' ? 'bg-[var(--rm-primary)]/10 text-[var(--rm-primary)]' : 'bg-[var(--rm-text)]/10 text-[var(--rm-text)]'
                }>
                  {selectedNews.category}
                </Badge>
              )}
              {selectedNews?.publishedAt && (
                <span className="text-xs text-muted-foreground">
                  {new Date(selectedNews.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            <DialogTitle className="text-[var(--rm-text)] text-xl leading-snug">{selectedNews?.title}</DialogTitle>
            {selectedNews?.source && (
              <DialogDescription>Fuente: {selectedNews.source}</DialogDescription>
            )}
          </DialogHeader>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            {selectedNews?.content ? (
              <ReactMarkdown>{selectedNews.content}</ReactMarkdown>
            ) : (
              <p>{selectedNews?.summary || 'Contenido no disponible.'}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Authentication Modal */}
      <AuthenticationModal open={authModalOpen} onOpenChange={setAuthModalOpen} />

      {/* Premium Modal */}
      <PremiumModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
        onSelectPlan={handlePlanSelected}
      />
    </motion.div>
  );
}
