'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Search, FileText, Shield, Award, ChevronDown,
  CheckCircle2, AlertCircle, Loader2, RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { usePortalAuth } from '@/hooks/use-portal-auth';
import CompanyProfile from './consultas/CompanyProfile';
import AuthenticationModal from '@/components/portal/auth/AuthenticationModal';
import PremiumModal from '@/components/portal/PremiumModal';

// Framer Motion animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } },
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

interface SearchResult {
  id: string;
  name: string;
  nire: string;
  type?: string;
  province?: string;
  status?: string;
  activity?: string;
  constitution?: string;
}

export default function ConsultasSection({ initialQuery = '' }: { initialQuery?: string }) {
  const [searchType, setSearchType] = useState('denominacion');
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [csvInput, setCsvInput] = useState('');
  const [csvResult, setCsvResult] = useState<null | { valid: boolean; doc: string; date: string }>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter state
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filterOptions, setFilterOptions] = useState<{ provinces: string[]; types: string[]; statuses: string[] }>({
    provinces: [], types: [], statuses: [],
  });

  const { hasActiveSubscription, showPremiumModal } = usePortalAuth();

  // Fetch distinct filter values from DB
  useEffect(() => {
    fetch('/api/search/distinct')
      .then(r => r.ok ? r.json() : null)
      .then(json => json?.success && setFilterOptions(json.data))
      .catch(() => {});
  }, []);

  // Reset advanced filters when switching tabs
  useEffect(() => {
    if (searchType !== 'avanzada') {
      setSelectedProvince('');
      setSelectedType('');
      setSelectedStatus('');
    }
  }, [searchType]);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    setSearching(true);
    setHasSearched(true);
    try {
      const params = new URLSearchParams({ q: query });
      if (selectedProvince) params.set('province', selectedProvince);
      if (selectedType) params.set('type', selectedType);
      if (selectedStatus) params.set('status', selectedStatus);
      const res = await fetch(`/api/search?${params}`);
      if (res.ok) {
        const json = await res.json();
        setSearchResults(json.success ? (json.data?.results || []) : []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [selectedProvince, selectedType, selectedStatus]);

  // Execute search automatically if initialQuery is provided
  useEffect(() => {
    if (initialQuery.trim()) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearchClick = () => {
    performSearch(searchQuery);
  };

  const handleResetFilters = () => {
    setSelectedProvince('');
    setSelectedType('');
    setSelectedStatus('');
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch(searchQuery);
    }
  };

  const handleVerifyCsv = () => {
    if (csvInput.trim().length > 3) {
      setCsvResult({ valid: true, doc: 'Certificación Registral - Verificación pendiente', date: new Date().toLocaleDateString('es-ES') });
    }
  };

  const handleSolicitarClick = () => {
    setPremiumModalOpen(true);
  };

  const handleVerificarClick = () => {
    setPremiumModalOpen(true);
  };

  const handlePlanSelected = () => {
    setPremiumModalOpen(false);
    setAuthModalOpen(true);
  };

  return (
    <motion.div {...fadeInUp} initial="initial" animate="animate" exit="exit" className="animate-fade-in-up">
      {/* Header */}
      <section className="bg-[var(--rm-text)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-[var(--rm-primary)]/20 text-[var(--rm-primary)] border-[var(--rm-primary)]/30">
            <Search className="w-3 h-3 mr-1" />
            Consultas Públicas
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary-light mb-3">Búsqueda de Sujetos</h1>
          <p className="text-[var(--rm-muted)] max-w-2xl mx-auto">
            
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Tabs */}
        <Card className="glass-card mb-8 overflow-hidden">
          <CardContent className="p-6">
            <Tabs value={searchType} onValueChange={setSearchType}>
              <TabsList className="mb-6 bg-secondary">
                <TabsTrigger value="denominacion" className="data-[state=active]:bg-[var(--rm-text)] data-[state=active]:text-white">
                  Por Denominación
                </TabsTrigger>
<TabsTrigger value="avanzada" className="data-[state=active]:bg-[var(--rm-text)] data-[state=active]:text-white">
                  Búsqueda Avanzada
                </TabsTrigger>
              </TabsList>

              <TabsContent value="denominacion">
                <div className="flex gap-3">
                  <Input
                    placeholder="Ingrese la denominación o parte de ella..."
                    className="flex-1 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    className="bg-[var(--rm-text)] hover:bg-[var(--rm-text)]/90 h-12 px-8"
                    onClick={handleSearchClick}
                    disabled={searching}
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                    {searching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </TabsContent>
<TabsContent value="avanzada">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1">Provincia</Label>
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                      <SelectContent>
                        {filterOptions.provinces.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1">Tipo de Sujeto</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        {filterOptions.types.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground mb-1">Estado</Label>
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent>
                        {filterOptions.statuses.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Input
                    placeholder="Actividad económica, palabras clave..."
                    className="flex-1 min-w-0 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button
                    className="bg-[var(--rm-text)] hover:bg-[var(--rm-text)]/90 h-12 px-8"
                    onClick={handleSearchClick}
                    disabled={searching}
                  >
                    {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                    {searching ? 'Buscando...' : 'Buscar'}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-12 gap-2 border-muted-foreground/30"
                    onClick={handleResetFilters}
                    disabled={searching}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Limpiar
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Results */}
        {hasSearched && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold gradient-text-primary">Resultados de Búsqueda</h2>
              <span className="text-sm text-muted-foreground">
                {searching ? 'Buscando...' : `Se encontraron ${searchResults.length} resultado(s)`}
              </span>
            </div>
            {searching ? (
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3 py-8">
                    <Loader2 className="w-5 h-5 text-[var(--rm-primary)] animate-spin" />
                    <span className="text-muted-foreground">Buscando sociedades...</span>
                  </div>
                </CardContent>
              </Card>
            ) : searchResults.length > 0 ? (
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-2">
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[var(--rm-primary)]/5 hover:bg-[var(--rm-primary)]/5">
                          <TableHead className="font-semibold text-[var(--rm-text)]">NIRE</TableHead>
                          <TableHead className="font-semibold text-[var(--rm-text)]">Denominación</TableHead>
                          <TableHead className="font-semibold text-[var(--rm-text)] hidden md:table-cell">Tipo</TableHead>
                          <TableHead className="font-semibold text-[var(--rm-text)] hidden lg:table-cell">Provincia</TableHead>
                          <TableHead className="font-semibold text-[var(--rm-text)] hidden lg:table-cell">Actividad</TableHead>
                          <TableHead className="font-semibold text-[var(--rm-text)]">Estado</TableHead>
                          <TableHead className="font-semibold text-[var(--rm-text)] w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.map((company) => (
                          <React.Fragment key={company.id}>
                            <TableRow
                              className="cursor-pointer hover:bg-[var(--rm-primary)]/10"
                              onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
                            >
                              <TableCell className="font-mono text-sm">{company.nire}</TableCell>
                              <TableCell className="font-medium text-[var(--rm-text)]">{company.name}</TableCell>
                              {company.type && (
                                <TableCell className="hidden md:table-cell">
                                  <Badge variant="outline">{company.type}</Badge>
                                </TableCell>
                              )}
                              {company.province && (
                                <TableCell className="hidden lg:table-cell text-muted-foreground">{company.province}</TableCell>
                              )}
                              {company.activity && (
                                <TableCell className="hidden lg:table-cell text-muted-foreground">{company.activity}</TableCell>
                              )}
                              <TableCell>
                                <Badge className={
                                  ['Vigente', 'Extinta', 'Cancelada'].includes(company.status || '') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }>
                                  {company.status || 'Vigente'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedCompany === company.id ? 'rotate-180' : ''}`} />
                              </TableCell>
                            </TableRow>
                            {expandedCompany === company.id && (
                              <TableRow key={`${company.id}-detail`}>
                                <TableCell colSpan={7} className="bg-secondary/50 p-6">
                                  <CompanyProfile company={{
                                    nire: company.nire,
                                    denomination: company.name,
                                    type: company.type || '',
                                    province: company.province || '',
                                    activity: company.activity || '',
                                    status: company.status || 'Vigente',
                                    constitution: company.constitution || '',
                                  }} />
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card overflow-hidden">
                <CardContent className="p-6 text-center">
                  <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No se encontraron resultados para su búsqueda.</p>
                  <p className="text-sm text-muted-foreground mt-1">Intente con otros términos o verifique el NIRE ingresado.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Certificaciones y Verificación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Nota Simple */}
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[var(--rm-primary)]" />
                <CardTitle className="text-[var(--rm-text)]">Nota Simple</CardTitle>
              </div>
              <CardDescription>Obtenga un resumen de la información pública registral de cualquier sociedad</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Denominacion, tipo de Sujeto, Domicilio, Representante, Estado registral (Vigencia)
              </p>
              <div className="flex gap-2">
                <Input placeholder="NIRE o Denominación" className="flex-1" />
                <Button className="bg-[var(--rm-primary)] text-white hover:bg-[var(--rm-primary)]/90" onClick={handleSolicitarClick}>
                  Solicitar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Document Verifier */}
          <Card className="glass-card overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--rm-text)]" />
                <CardTitle className="text-[var(--rm-text)]">Verificador de Documentos</CardTitle>
              </div>
              <CardDescription>Verifique la autenticidad de documentos emitidos por el Registro Mercantil</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Ingrese el código CSV del documento"
                  className="flex-1"
                  value={csvInput}
                  onChange={(e) => { setCsvInput(e.target.value); setCsvResult(null); }}
                />
                <Button className="bg-[var(--rm-text)] hover:bg-[var(--rm-text)]/90 text-white" onClick={handleVerificarClick}>
                  Verificar
                </Button>
              </div>
              {csvResult && (
                <div className={`p-4 rounded-lg border ${csvResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {csvResult.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-semibold ${csvResult.valid ? 'text-green-800' : 'text-red-800'}`}>
                      {csvResult.valid ? 'Documento Válido' : 'Documento No Válido'}
                    </span>
                  </div>
                  {csvResult.valid && (
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Documento:</strong> {csvResult.doc}</p>
                      <p><strong>Fecha de emisión:</strong> {csvResult.date}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Certification Types */}
        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--rm-primary)]" />
              <CardTitle className="text-[var(--rm-text)]">Tipos de Certificación</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-50px' }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {[
                { title: 'Certificación Literal', desc: 'Copia fiel del asiento registral', cost: '900 CUP' },
                { title: 'Certificación En Relación', desc: 'Extremos determinados de los asientos', cost: '600 CUP' },
                { title: 'Certificación Negativa', desc: 'Acredita que los datos no constan en el Registro', cost: '600 CUP' },
                { title: 'Nota Simple Informativa', desc: 'Resumen de datos públicos sin valor probatorio', cost: '300 CUP' },
              ].map((cert) => (
                <motion.div key={cert.title} variants={fadeInUp}>
                  <div className="glass-card-inner p-4 hover:border-[var(--rm-primary)]/30">
                    <h4 className="font-semibold text-[var(--rm-text)] text-sm">{cert.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{cert.desc}</p>
                    <p className="text-sm font-bold text-[var(--rm-primary)] mt-2">{cert.cost}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
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
