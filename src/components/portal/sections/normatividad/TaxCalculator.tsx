"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, AlertCircle, CheckCircle2, RotateCcw, Building2, TrendingUp, ArrowLeftRight, PenTool, FileText, FileBarChart, Globe } from 'lucide-react';

// ── Tarifas Registrales (Resolución 51/2021) ─────────────────────────────────
const REGISTRATION_FEES: Array<{
  key: string;
  label: string;
  icon: React.ReactNode;
  items: { num: string; acto: string; amount: number }[];
  basePresentation: number;
  baseInscription: number;
}> = [
  {
    key: 'constitution',
    label: 'Constitución de Sociedad Mercantil (SRL / SPC)',
    icon: <Building2 className="w-4 h-4" />,
    items: [
      { num: '1', acto: 'Presentación + calificación (primera inscripción)', amount: 900 },
      { num: '4', acto: 'Inscripción (primera inscripción)', amount: 1200 },
      { num: '10', acto: 'Reserva de denominación', amount: 600 },
      { num: '11', acto: 'Legalización de libros (por cada libro)', amount: 300 },
    ],
    basePresentation: 900,
    baseInscription: 1200,
  },
  {
    key: 'capital_increase',
    label: 'Aumento o Disminución de Capital',
    icon: <TrendingUp className="w-4 h-4" />,
    items: [
      { num: '2', acto: 'Presentación (cualquier otro documento)', amount: 180 },
      { num: '6.5', acto: 'Inscripción (aumento/disminución de capital)', amount: 180 },
    ],
    basePresentation: 180,
    baseInscription: 180,
  },
  {
    key: 'merger',
    label: 'Fusión / Escisión',
    icon: <ArrowLeftRight className="w-4 h-4" />,
    items: [
      { num: '3', acto: 'Presentación (traspaso, fusión o escisión)', amount: 600 },
      { num: '5', acto: 'Inscripción (fusión y escisión)', amount: 1200 },
    ],
    basePresentation: 600,
    baseInscription: 1200,
  },
  {
    key: 'modification',
    label: 'Modificaciones Societarias',
    icon: <PenTool className="w-4 h-4" />,
    items: [
      { num: '2', acto: 'Presentación (cualquier otro documento)', amount: 180 },
      { num: '6.1–6.19', acto: 'Inscripción (cambio nombre, domicilio, objeto, etc.)', amount: 180 },
      { num: '6.11', acto: 'Cancelación del sujeto inscrito', amount: 300 },
      { num: '6.15', acto: 'Poderes y delegaciones', amount: 240 },
    ],
    basePresentation: 180,
    baseInscription: 180,
  },
  {
    key: 'certification',
    label: 'Certificaciones y Publicidad Registral',
    icon: <FileText className="w-4 h-4" />,
    items: [
      { num: '15', acto: 'Certificación literal', amount: 900 },
      { num: '16', acto: 'Certificación en relación', amount: 600 },
      { num: '17', acto: 'Certificación negativa', amount: 600 },
      { num: '18', acto: 'Nota Simple Informativa', amount: 300 },
    ],
    basePresentation: 0,
    baseInscription: 0,
  },
  {
    key: 'balance_deposit',
    label: 'Depósito de Cuentas Anuales',
    icon: <FileBarChart className="w-4 h-4" />,
    items: [
      { num: '8', acto: 'Depósito y publicidad de balances certificados', amount: 600 },
    ],
    basePresentation: 0,
    baseInscription: 0,
  },
  {
    key: 'foreign_investment',
    label: 'Inversión Extranjera (AEI / Empresas Mixtas)',
    icon: <Globe className="w-4 h-4" />,
    items: [
      { num: '1', acto: 'Presentación + calificación (primera inscripción)', amount: 900 },
      { num: '4', acto: 'Inscripción (primera inscripción)', amount: 1200 },
    ],
    basePresentation: 900,
    baseInscription: 1200,
  },
];

// ── Tarifas ONAT 2026 — Ley 181 (Gaceta Oficial No. 99 Ordinaria, 29/12/2025) ──
// Todas las tasas confirmadas para el año fiscal 2026.

interface TaxRule {
  id: string;
  nombre: string;
  tasa: string;            // Ej: '35%' | '5%' | '14%'
  tasaDetalle: string;     // Desglose para escalas progresivas
  baseLegal: string;       // Art. específico Ley 113 / Ley 181
  aplicableA: string[];    // keys de REGISTRATION_FEES
  nota?: string;
}

const TAX_RULES: TaxRule[] = [
  {
    id: 'ISU',
    nombre: 'Impuesto sobre Utilidades (ISU)',
    tasa: '35%',
    tasaDetalle: 'Art. 97, Ley 113 · Art. 53.1, Ley 181/2026',
    baseLegal: 'Utilidades imponibles de personas jurídicas',
    aplicableA: ['constitution', 'merger', 'foreign_investment'],
    nota: 'Tasa máx. 50% para extracción de recursos naturales. 4% para extranjeras sin establecimiento permanente.',
  },
  {
    id: 'IPI',
    nombre: 'Impuesto sobre los Ingresos Personales (IPI)',
    tasa: '15–50%',
    tasaDetalle: '5 tramos: 15% (0–10k) → 20% (10k–20k) → 30% (20k–30k) → 40% (30k–50k) → 50% (>50k)',
    baseLegal: 'Arts. 16–67, Ley 113',
    aplicableA: ['foreign_investment'],
    nota: 'No residentes: 15% sobre total sin deducción. Contratos exterior: 4% (mín. 20 CUC/mes). Fuentes eventuales: 4%. Segunda venta mismo año: 8%. Bonificación 5% si declara antes del 28 feb.',
  },
  {
    id: 'IUFT',
    nombre: 'Impuesto por Utilización de la Fuerza de Trabajo (IUFT)',
    tasa: '5% (fijo 2026)',
    tasaDetalle: 'Art. 75, Ley 181/2026 — Tasa única temporal. Escala progresiva Ley 113 (20%→5%) suspendida para 2026.',
    baseLegal: 'Total remuneraciones (nómina)',
    aplicableA: ['constitution'],
    nota: 'Exención: personal agropecuario directo (cooperativas, UBPC, empresas estatales). Personas naturales ≤5 trabajadores exentos.',
  },
  {
    id: 'CSS',
    nombre: 'Contribución a la Seguridad Social (CSS)',
    tasa: '14%',
    tasaDetalle: 'Art. 19, Ley 181/2026 — 12.5% al Presupuesto + 1.5% fondo entidad',
    baseLegal: 'Total salarios devengados',
    aplicableA: ['constitution'],
    nota: 'No aplica a constitución (no hay nómina aún). Se activa al iniciar operaciones.',
  },
  {
    id: 'CTDL',
    nombre: 'Contribución Territorial para el Desarrollo Local (CTDL)',
    tasa: '1%',
    tasaDetalle: 'Art. 85.1, Ley 181/2026',
    baseLegal: 'Ingresos brutos por ventas o servicios',
    aplicableA: ['constitution'],
    nota: 'Se descuenta costo de adquisición para importadoras antes de aplicar el 1%. Financiamiento de desarrollo territorial municipal.',
  },
];

// ── Impuesto sobre Documentos (Anexo No. 4, Ley 113 modificado por DL 21/2020) ─
interface DocTaxGroup {
  grupo: string;
  descripcion: string;
  inscripcion: number;   // CUP
  certificacion: number; // CUP
  nota: string;
}

const DOC_TAX_GROUPS: DocTaxGroup[] = [
  {
    grupo: 'Grupo I',
    descripcion: 'Personas naturales residentes, entidades estatales, cooperativas, MIPYMES cubanas',
    inscripcion: 30,
    certificacion: 20,
    nota: 'Registro de Contribuyentes + Certificación fiscal ONAT',
  },
  {
    grupo: 'Grupo II',
    descripcion: 'Extranjeros no residentes, empresas mixtas, sucursales extranjeras, personas naturales no residentes',
    inscripcion: 750,
    certificacion: 500,
    nota: 'Tasas 25× superiores al Grupo I por moneda en divisas',
  },
];

type ScenarioKey = string;

export default function TaxCalculator() {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>('constitution');
  const [numBooks, setNumBooks] = useState(2);
  const [hasLateFee, setHasLateFee] = useState(false);
  const [exemption, setExemption] = useState('');

  const scenario = REGISTRATION_FEES.find((s) => s.key === selectedScenario)!;

  // Calculate fees
  const presentationFee = scenario.basePresentation;
  const inscriptionFee = scenario.baseInscription;
  const booksFee = scenario.key === 'constitution' ? numBooks * 300 : 0;
  const reservationFee = scenario.key === 'constitution' && selectedScenario === 'constitution' ? 600 : 0;

  // Certification-specific: use the selected cert fee instead of presentation+inscription
  let subtotal = 0;
  if (selectedScenario === 'certification') {
    const certAmounts: Record<string, number> = { '15': 900, '16': 600, '17': 600, '18': 300 };
    subtotal = certAmounts[exemption] || 0;
  } else {
    subtotal = presentationFee + inscriptionFee + booksFee + reservationFee;
  }

  const lateFeePercent = 30;
  const lateFeeAmount = hasLateFee ? Math.round(subtotal * (lateFeePercent / 100)) : 0;
  const total = hasLateFee || exemption ? subtotal + lateFeeAmount : subtotal;

  // Determine applicable taxes (Ley 181/2026 confirmed rates)
  const applicableTaxes = TAX_RULES.filter((tax) => tax.aplicableA.includes(selectedScenario));

  const handleReset = () => {
    setSelectedScenario('constitution');
    setNumBooks(2);
    setHasLateFee(false);
    setExemption('');
  };

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[var(--rm-primary)]" />
            <CardTitle className="text-[var(--rm-text)]">Calculadora de Costos Registrales</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">Res. 51/2021</Badge>
        </div>
        <CardDescription>
          Estime los derechos registrales (Res. 51/2021) y los impuestos ONAT vigentes en 2026 (Ley 181).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scenario Selector */}
        <div>
          <label className="text-sm font-medium text-[var(--rm-text)] mb-2 block">
            Tipo de Trámite
          </label>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REGISTRATION_FEES.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  <span className="flex items-center gap-2">
                    {s.icon}
                    {s.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Scenario-specific options */}
        {selectedScenario === 'constitution' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[var(--rm-text)] mb-2 block">
                N° de libros a legalizar
              </label>
              <Select value={String(numBooks)} onValueChange={(v) => setNumBooks(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} {n === 1 ? 'libro' : 'libros'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasLateFee}
                  onChange={(e) => setHasLateFee(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-[var(--rm-text)]">Incluye recargo por extemporaneidad (30%)</span>
              </label>
            </div>
          </div>
        )}

        {selectedScenario === 'certification' && (
          <div>
            <label className="text-sm font-medium text-[var(--rm-text)] mb-2 block">
              Tipo de Certificación
            </label>
            <Select value={exemption} onValueChange={setExemption}>
              <SelectTrigger><SelectValue placeholder="Seleccione tipo..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Certificación Literal — 900 CUP</SelectItem>
                <SelectItem value="16">Certificación en Relación — 600 CUP</SelectItem>
                <SelectItem value="17">Certificación Negativa — 600 CUP</SelectItem>
                <SelectItem value="18">Nota Simple Informativa — 300 CUP</SelectItem>
              </SelectContent>
            </Select>
            {/* Exemption checkbox */}
            <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasLateFee}
                onChange={(e) => setHasLateFee(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-[var(--rm-text)]">Exento (mandato judicial / solicitud MINJUS / Fiscalía)</span>
            </label>

            {/* Document tax info */}
            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 mb-2">Impuesto sobre Documentos (Anexo No. 4, DL 21/2020)</p>
              {DOC_TAX_GROUPS.map((g) => (
                <div key={g.grupo} className="text-xs text-slate-600 space-y-0.5">
                  <p><strong>{g.grupo}</strong> — {g.descripcion}</p>
                  <p>Inscripción RC: {g.inscripcion} CUP · Certificación ONAT: {g.certificacion} CUP</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fee breakdown */}
        <div className="glass-card-inner p-4 space-y-2">
          <h4 className="text-sm font-semibold text-[var(--rm-text)] mb-3">Desglose de Tarifas</h4>
          {selectedScenario === 'certification' ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Certificación</span>
                <span className="font-medium">{subtotal > 0 ? `${subtotal.toLocaleString()} CUP` : '—'}</span>
              </div>
              {hasLateFee && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Exención (Art. Sexto, Res. 51/2021)</span>
                  <span className="font-medium text-green-600">0 CUP</span>
                </div>
              )}
            </>
          ) : (
            <>
              {presentationFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Presentación y calificación</span>
                  <span className="font-medium">{presentationFee.toLocaleString()} CUP</span>
                </div>
              )}
              {inscriptionFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Inscripción</span>
                  <span className="font-medium">{inscriptionFee.toLocaleString()} CUP</span>
                </div>
              )}
              {reservationFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reserva de denominación</span>
                  <span className="font-medium">{reservationFee.toLocaleString()} CUP</span>
                </div>
              )}
              {booksFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Legalización de libros ({numBooks} × 300)</span>
                  <span className="font-medium">{booksFee.toLocaleString()} CUP</span>
                </div>
              )}
              {lateFeeAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Recargo 30% (extemporaneidad)</span>
                  <span className="font-medium text-red-600">+{lateFeeAmount.toLocaleString()} CUP</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-semibold text-[var(--rm-text)]">Total estimado</span>
                <span className="font-bold text-[var(--rm-primary)] text-lg">{total.toLocaleString()} CUP</span>
              </div>
            </>
          )}
        </div>

        {/* Applicable taxes — Ley 181/2026 rates */}
        {applicableTaxes.length > 0 && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Impuestos aplicables (Ley 181/2026 confirmada)</p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1.5">
                  {applicableTaxes.map((tax) => (
                    <li key={tax.id}>
                      <strong>{tax.nombre}</strong> — <span className="font-mono text-blue-900">{tax.tasa}</span>
                      {tax.tasaDetalle && <span className="ml-1 text-blue-600">· {tax.tasaDetalle}</span>}
                      {tax.nota && <span className="block text-blue-500 mt-0.5">💡 {tax.nota}</span>}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-blue-500 mt-2">
                  Fuente: Ley 181 "Del Presupuesto del Estado para el año 2026" (Gaceta Oficial No. 99 Ordinaria, 29/12/2025)
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedScenario === 'foreign_investment' && (
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Gestión a través de Ventanillas</p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li><strong>VUINEX:</strong> Infanta #16 e/ 23 y Humboldt, Plaza de la Revolución, La Habana · (07) 8331719</li>
                  <li><strong>VUCE Cuba:</strong> <a href="https://home.vucecuba.mincex.gob.cu/" target="_" rel="noopener noreferrer" className="underline">home.vucecuba.mincex.gob.cu</a></li>
                  <li><strong>ZED Mariel:</strong> <a href="https://www.zedmariel.com/sistema-de-ventanilla-unica" target="_" rel="noopener noreferrer" className="underline">zedmariel.com/sistema-de-ventanilla-unica</a></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleReset}
          className="w-full gap-2 border-muted-foreground/30 hover:bg-muted"
        >
          <RotateCcw className="w-4 h-4" />
          Restablecer valores
        </Button>
      </CardContent>
    </Card>
  );
}
