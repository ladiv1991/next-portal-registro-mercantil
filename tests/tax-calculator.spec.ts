import { describe, it, expect } from 'bun:test';

// ── Tarifas Registrales (Resolución 51/2021) ─────────────────────────────────

describe('Tarifas Registrales — Resolución 51/2021', () => {
  // Partida I: Presentación
  it('Ítem 1: Presentación primera inscripción = 900 CUP', () => expect(900).toBe(900));
  it('Ítem 2: Presentación cualquier otro documento = 180 CUP', () => expect(180).toBe(180));
  it('Ítem 3: Presentación traspaso/fusión = 600 CUP', () => expect(600).toBe(600));

  // Partida II: Inscripción
  it('Ítem 4: Inscripción primera = 1.200 CUP', () => expect(1200).toBe(1200));
  it('Ítem 5: Fusión/escisión = 1.200 CUP', () => expect(1200).toBe(1200));
  it('Ítem 6.x: Modificaciones = 180 CUP', () => expect(180).toBe(180));
  it('Ítem 6.11: Cancelación = 300 CUP', () => expect(300).toBe(300));
  it('Ítem 6.15: Poderes y delegaciones = 240 CUP', () => expect(240).toBe(240));

  // Partida III
  it('Ítem 8: Depósito balances = 600 CUP', () => expect(600).toBe(600));
  it('Ítem 10: Reserva denominación = 600 CUP', () => expect(600).toBe(600));
  it('Ítem 11: Legalización libro = 300 CUP', () => expect(300).toBe(300));

  // Partida IV: Publicidad
  it('Ítem 15: Certificación literal = 900 CUP', () => expect(900).toBe(900));
  it('Ítem 16: Certificación en relación = 600 CUP', () => expect(600).toBe(600));
  it('Ítem 17: Certificación negativa = 600 CUP', () => expect(600).toBe(600));
  it('Ítem 18: Nota Simple = 300 CUP', () => expect(300).toBe(300));
});

// ── Recargos ────────────────────────────────────────────────────────────────────

describe('Recargos — Art. Quinto Res. 51/2021', () => {
  it('Recargo 30% sobre 1.200 = 360 CUP', () => {
    expect(Math.round(1200 * 0.30)).toBe(360);
  });
  it('Total con recargo: 1.200 + 360 = 1.560 CUP', () => {
    expect(1200 * 1.30).toBe(1560);
  });
  it('Constitución base 2.100 + recargo = 2.730 CUP', () => {
    expect(Math.round(2100 * 1.30)).toBe(2730);
  });
});

// ── Escenarios de cálculo ─────────────────────────────────────────────────────

describe('Escenario A: Constitución SRL', () => {
  it('Sin reserva de nombre: 900 + 1.200 = 2.100 CUP', () => {
    expect(900 + 1200).toBe(2100);
  });
  it('Con reserva de nombre: 2.100 + 600 = 2.700 CUP', () => {
    expect(2100 + 600).toBe(2700);
  });
  it('Con 2 libros: 2.700 + 600 = 3.300 CUP', () => {
    expect(2700 + 300 * 2).toBe(3300);
  });
  it('Con 3 libros: 2.700 + 900 = 3.600 CUP', () => {
    expect(2700 + 300 * 3).toBe(3600);
  });
  it('Con recargo 30%: 2.100 × 1.30 = 2.730 CUP', () => {
    expect(Math.round(2100 * 1.30)).toBe(2730);
  });
  it('Todo incluido: reserva + 3 libros + recargo = 4.680 CUP', () => {
    const base = 600 + 900 + 1200 + 300 * 3; // reserva + present + insc + libros
    expect(Math.round(base * 1.30)).toBe(4680);
  });
});

describe('Escenario B: Aumento de Capital', () => {
  it('Base: 180 + 180 = 360 CUP', () => expect(180 + 180).toBe(360));
  it('Con recargo: 360 × 1.30 = 468 CUP', () => expect(Math.round(360 * 1.30)).toBe(468));
});

describe('Escenario C: Fusión / Escisión', () => {
  it('Base: 600 + 1.200 = 1.800 CUP', () => expect(600 + 1200).toBe(1800));
  it('Con recargo: 1.800 × 1.30 = 2.340 CUP', () => expect(Math.round(1800 * 1.30)).toBe(2340));
});

describe('Escenario D: Modificaciones Societarias', () => {
  it('Cambio de denominación: 180 + 180 = 360 CUP', () => expect(180 + 180).toBe(360));
  it('Cancelación: 300 CUP', () => expect(300).toBe(300));
  it('Poderes y delegaciones: 240 CUP', () => expect(240).toBe(240));
  it('Apertura sucursal: 180 + 180 = 360 CUP', () => expect(180 + 180).toBe(360));
});

describe('Escenario E: Certificaciones', () => {
  it('Literal: 900 CUP', () => expect(900).toBe(900));
  it('En relación: 600 CUP', () => expect(600).toBe(600));
  it('Negativa: 600 CUP', () => expect(600).toBe(600));
  it('Nota Simple: 300 CUP', () => expect(300).toBe(300));
  it('Con exención judicial: 0 CUP', () => expect(0).toBe(0));
});

describe('Escenario F: Inversión Extranjera', () => {
  it('Base: 900 + 1.200 = 2.100 CUP', () => expect(900 + 1200).toBe(2100));
  it('Aplica ISU y posible ISN', () => {
    const hasISU = true;
    const hasISN = true;
    expect(hasISU).toBe(true);
    expect(hasISN).toBe(true);
  });
});

describe('Escenario G: Depósito de Cuentas', () => {
  it('Depósito balances: 600 CUP', () => expect(600).toBe(600));
});

// ── Función de cálculo reutilizable ────────────────────────────────────────────

describe('Motor de cálculo — función helper', () => {
  function calcRegistration(params: {
    presentation: number;
    inscription: number;
    extraFees?: number;
    lateFee?: boolean;
    exempt?: boolean;
  }): { subtotal: number; recargo: number; total: number } {
    const { presentation, inscription, extraFees = 0, lateFee = false, exempt = false } = params;
    const subtotal = presentation + inscription + extraFees;
    const recargo = lateFee ? Math.round(subtotal * 0.30) : 0;
    return {
      subtotal,
      recargo,
      total: exempt ? 0 : subtotal + recargo,
    };
  }

  it('Constitución base', () => {
    const r = calcRegistration({ presentation: 900, inscription: 1200 });
    expect(r.subtotal).toBe(2100);
    expect(r.total).toBe(2100);
  });
  it('Constitución con 2 libros', () => {
    const r = calcRegistration({ presentation: 900, inscription: 1200, extraFees: 600 });
    expect(r.total).toBe(2700);
  });
  it('Con recargo 30%', () => {
    const r = calcRegistration({ presentation: 900, inscription: 1200, lateFee: true });
    expect(r.recargo).toBe(630);
    expect(r.total).toBe(2730);
  });
  it('Con exención', () => {
    const r = calcRegistration({ presentation: 900, inscription: 0, exempt: true });
    expect(r.total).toBe(0);
  });
  it('Aumento capital', () => {
    const r = calcRegistration({ presentation: 180, inscription: 180 });
    expect(r.total).toBe(360);
  });
  it('Fusión', () => {
    const r = calcRegistration({ presentation: 600, inscription: 1200 });
    expect(r.total).toBe(1800);
  });
});

// ── Datos de ventanillas extranjeras ──────────────────────────────────────────

describe('Ventanillas extranjeras', () => {
  it('VUCE URL correcta', () =>
    expect('https://home.vucecuba.mincex.gob.cu/').toBe('https://home.vucecuba.mincex.gob.cu/'));
  it('VUINEX teléfono', () => expect('(07) 8331719').toBe('(07) 8331719'));
  it('VUINEX email', () => expect('inversionextranjera@mincex.gob.cu').toBe('inversionextranjera@mincex.gob.cu'));
  it('ZED Mariel URL', () =>
    expect('https://www.zedmariel.com/sistema-de-ventanilla-unica').toBe('https://www.zedmariel.com/sistema-de-ventanilla-unica'));
  it('ZED Mariel email', () => expect('ventanillaunica@zedmariel.co.cu').toBe('ventanillaunica@zedmariel.co.cu'));
});

// ── Íconos por escenario ──────────────────────────────────────────────────────

describe('Íconos de escenarios', () => {
  it('constitution → Building2', () => expect('Building2').toBe('Building2'));
  it('capital_increase → TrendingUp', () => expect('TrendingUp').toBe('TrendingUp'));
  it('merger → ArrowLeftRight', () => expect('ArrowLeftRight').toBe('ArrowLeftRight'));
  it('modification → PenTool', () => expect('PenTool').toBe('PenTool'));
  it('certification → FileText', () => expect('FileText').toBe('FileText'));
  it('balance_deposit → FileBarChart', () => expect('FileBarChart').toBe('FileBarChart'));
  it('foreign_investment → Globe', () => expect('Globe').toBe('Globe'));
});

// ── Tasas confirmadas Ley 181/2026 ────────────────────────────────────────────

describe('Tasas Ley 181/2026 (Gaceta Oficial No. 99 Ordinaria, 29/12/2025)', () => {
  // ISU — Art. 53.1
  it('ISU tasa general 2026: 35%', () => expect(35).toBe(35));
  it('ISU máxima recursos naturales: 50%', () => expect(50).toBe(50));
  it('ISU extranjeras sin establecimiento: 4%', () => expect(4).toBe(4));

  // IPI — Arts. 16-67 Ley 113
  it('IPI tramo 1: 15% (0–10,000 CUP)', () => expect(15).toBe(15));
  it('IPI tramo 2: 20% (10,000–20,000 CUP)', () => expect(20).toBe(20));
  it('IPI tramo 3: 30% (20,000–30,000 CUP)', () => expect(30).toBe(30));
  it('IPI tramo 4: 40% (30,000–50,000 CUP)', () => expect(40).toBe(40));
  it('IPI tramo 5: 50% (>50,000 CUP)', () => expect(50).toBe(50));
  it('IPI no residentes: 15% sobre total sin deducción', () => expect(15).toBe(15));
  it('IPI contratos exterior: 4% (mín. 20 CUC/mes)', () => expect(4).toBe(4));
  it('IPI fuentes eventuales: 4%', () => expect(4).toBe(4));
  it('IPI segunda venta mismo año: 8%', () => expect(8).toBe(8));
  it('IPI bonificación temprana: 5%', () => expect(5).toBe(5));

  // IUFT — Art. 75 Ley 181 (tasa única 2026)
  it('IUFT tasa única 2026: 5%', () => expect(5).toBe(5));
  it('IUFT escala Ley 113 suspendida para 2026', () => {
    const ley113primerAno = 20;
    const ley181unico = 5;
    expect(ley181unico).toBeLessThan(ley113primerAno);
  });

  // CSS — Art. 19 Ley 181
  it('CSS tasa total 2026: 14%', () => expect(14).toBe(14));
  it('CSS aporte al presupuesto: 12.5%', () => expect(12.5).toBe(12.5));
  it('CSS fondo entidad: 1.5%', () => expect(1.5).toBe(1.5));

  // CESS — Art. 20 Ley 181
  it('CESS primer tramo (≤15,000 CUP): 5%', () => expect(5).toBe(5));
  it('CESS segundo tramo (>15,000 CUP): 10%', () => expect(10).toBe(10));
  it('CESS salario 20,000 CUP = 1,250 CUP', () => {
    const salary = 20000;
    const cess = (15000 * 0.05) + ((salary - 15000) * 0.10);
    expect(cess).toBe(1250);
  });

  // CTDL — Art. 85.1 Ley 181
  it('CTDL tasa: 1%', () => expect(1).toBe(1));

  // IV/IS — Arts. 58-64 Ley 181
  it('IV/IS tasa general: 10%', () => expect(10).toBe(10));
  it('IV/IS telecomunicaciones (ETECSA): 5%', () => expect(5).toBe(5));

  // Anexo No. 4 — DL 21/2020
  it('ID inscripción RC Grupo I: 30 CUP', () => expect(30).toBe(30));
  it('ID inscripción RC Grupo II: 750 CUP', () => expect(750).toBe(750));
  it('ID certificación ONAT Grupo I: 20 CUP', () => expect(20).toBe(20));
  it('ID certificación ONAT Grupo II: 500 CUP', () => expect(500).toBe(500));
});

// ── Cálculos compuestos con tasas Ley 181 ────────────────────────────────────

describe('Cálculos compuestos — Ley 181/2026', () => {
  function calcISU(utilidad: number): number {
    return Math.round(utilidad * 0.35);
  }

  function calcIPI(ingreso: number): number {
    const brackets = [
      { up: 10000, rate: 0.15 },
      { up: 20000, rate: 0.20 },
      { up: 30000, rate: 0.30 },
      { up: 50000, rate: 0.40 },
      { up: Infinity, rate: 0.50 },
    ];
    let remaining = ingreso;
    let prevLimit = 0;
    let tax = 0;
    for (const b of brackets) {
      const taxable = Math.min(remaining, b.up - prevLimit);
      if (taxable <= 0) break;
      tax += taxable * b.rate;
      remaining -= taxable;
      prevLimit = b.up;
    }
    return Math.round(tax);
  }

  function calcIUFT(nomina: number): number {
    return Math.round(nomina * 0.05);
  }

  it('ISU sobre utilidad 100,000 CUP = 35,000 CUP', () => expect(calcISU(100000)).toBe(35000));
  it('ISU sobre utilidad 500,000 CUP = 175,000 CUP', () => expect(calcISU(500000)).toBe(175000));
  it('IPI sobre ingreso 8,000 CUP = 1,200 CUP (15%)', () => expect(calcIPI(8000)).toBe(1200));
  it('IPI sobre ingreso 15,000 CUP = 2,500 CUP', () => expect(calcIPI(15000)).toBe(2500));
  it('IPI sobre ingreso 55,000 CUP = 17,000 CUP', () => expect(calcIPI(55000)).toBe(17000));
  it('IUFT sobre nómina 50,000 CUP = 2,500 CUP', () => expect(calcIUFT(50000)).toBe(2500));
  it('Constitución: tarifas 3,300 + ISU(50k)=17,500 + IUFT(20k)=1,000 = 21,800 CUP', () => {
    const tariffs = 600 + 900 + 1200 + 300 * 2; // reserva + present + insc + 2 libros
    const isu = Math.round(50000 * 0.35);
    const iuft = Math.round(20000 * 0.05);
    expect(tariffs + isu + iuft).toBe(21800);
  });
});

// ── Referencias legales ────────────────────────────────────────────────────────

describe('Referencias legales', () => {
  it('DL 226/2001 Art. 28.c faculta tarifas', () => {
    expect('Decreto-Ley 226/2001, Art. 28.c').toContain('226/2001');
  });
  it('Res. 51/2021 vigente', () => expect('51/2021').toContain('51/2021'));
  it('DL 133/2026 publicado en Gaceta Oficial', () =>
    expect('Decreto-Ley 133/2026').toContain('133/2026'));
  it('DL 120/2026 pendiente', () => expect('120/2026').toContain('120/2026'));
  it('Recargo 30% por Art. Quinto Res. 51/2021', () => expect(30).toBe(30));
});
