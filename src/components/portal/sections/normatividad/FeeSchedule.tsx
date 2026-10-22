"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TARIFAS = [
  { num: "1", acto: "Asiento de presentación, examen y calificación — Primera inscripción de sujetos y contratos AEI", tarifa: "900.00 CUP" },
  { num: "2", acto: "Asiento de presentación, examen y calificación — Cualquier otro documento", tarifa: "180.00 CUP" },
  { num: "3", acto: "Asiento de presentación — Traspaso, fusión o escisión", tarifa: "600.00 CUP" },
  { num: "4", acto: "Asiento de inscripción — Primera inscripción de sujetos y contratos AEI", tarifa: "1,200.00 CUP" },
  { num: "5", acto: "Asiento de inscripción — Fusión y escisión de empresas, sociedades o cooperativas", tarifa: "1,200.00 CUP" },
  { num: "6.1", acto: "Cambio de denominación", tarifa: "180.00 CUP" },
  { num: "6.2", acto: "Cambio de domicilio o sede social", tarifa: "180.00 CUP" },
  { num: "6.3", acto: "Cambio de otras circunstancias de identificación de la entidad", tarifa: "180.00 CUP" },
  { num: "6.4", acto: "Prórroga o modificación del término de vigencia", tarifa: "180.00 CUP" },
  { num: "6.5", acto: "Aumento o disminución de capital o participación social", tarifa: "180.00 CUP" },
  { num: "6.6", acto: "Transformación de la sociedad", tarifa: "180.00 CUP" },
  { num: "6.7", acto: "Modificación de objeto social o encargo estatal", tarifa: "180.00 CUP" },
  { num: "6.8", acto: "Actividades secundarias, eventuales y de apoyo al objeto social", tarifa: "180.00 CUP" },
  { num: "6.9", acto: "Disolución y/o terminación de la entidad o contrato AEI", tarifa: "180.00 CUP" },
  { num: "6.10", acto: "Liquidación y/o extinción de la entidad o contrato AEI", tarifa: "180.00 CUP" },
  { num: "6.11", acto: "Cancelación del sujeto inscrito, acto o contrato AEI", tarifa: "300.00 CUP" },
  { num: "6.12", acto: "Traspaso y/o cambio de subordinación de la entidad", tarifa: "180.00 CUP" },
  { num: "6.13", acto: "Modificación de accionistas, socios o partes; emisiones de certificados de acciones y otros valores", tarifa: "180.00 CUP" },
  { num: "6.14", acto: "Movimientos de directivos (nombramientos y ceses)", tarifa: "180.00 CUP" },
  { num: "6.15", acto: "Poderes, delegaciones de facultades de directivos; nombramientos y ceses de presidentes, administradores, auditores, secretarios", tarifa: "240.00 CUP" },
  { num: "6.16", acto: "Delegaciones de facultades para contratación o con incidencia registral", tarifa: "240.00 CUP" },
  { num: "6.17", acto: "Apertura, cierre y demás actos relativos a sucursales y UEB", tarifa: "180.00 CUP" },
  { num: "6.18", acto: "Suspensión o reactivación del Perfeccionamiento Empresarial", tarifa: "180.00 CUP" },
  { num: "6.19", acto: "Cualquier otro acto o circunstancia por decisión de la entidad o disposición legal", tarifa: "300.00 CUP" },
  { num: "7", acto: "Cualquier otro documento modificativo de las circunstancias inscritas", tarifa: "180.00 CUP" },
  { num: "8", acto: "Depósito y publicidad de Balances de los Estados Financieros certificados", tarifa: "600.00 CUP" },
  { num: "9", acto: "Rectificaciones registrales", tarifa: "300.00 CUP" },
  { num: "10", acto: "Reserva y protección de la denominación solicitada", tarifa: "600.00 CUP" },
  { num: "11", acto: "Legalización de libros del ejercicio correspondiente (por cada libro)", tarifa: "300.00 CUP" },
  { num: "12", acto: "Notas al margen del asiento de inscripción, anotación o cancelación", tarifa: "300.00 CUP" },
  { num: "13", acto: "Búsqueda de datos registrales", tarifa: "300.00 CUP" },
  { num: "14", acto: "Exhibición o manifestación del asiento en libros registrales", tarifa: "1,200.00 CUP" },
  { num: "15", acto: "Certificación literal de uno o varios asientos de inscripción", tarifa: "900.00 CUP" },
  { num: "16", acto: "Certificación en relación a uno o varios asientos o extremos determinados", tarifa: "600.00 CUP" },
  { num: "17", acto: "Certificación Negativa", tarifa: "600.00 CUP" },
  { num: "18", acto: "Nota Simple Informativa", tarifa: "300.00 CUP" },
];

export default function FeeSchedule() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <CardTitle>Tarifa de Derechos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Conforme a la Resolución No. 51/2021 del Ministerio de Justicia,
          en ejercicio de la facultad conferida por el inciso c) del Artículo 28
          del Decreto-Ley No. 226/2001 del Registro Mercantil.
        </p>
        <div className="glass-card-inner overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--rm-text)]/5">
                <TableHead className="font-semibold text-[var(--rm-text)] w-16">No.</TableHead>
                <TableHead className="font-semibold text-[var(--rm-text)]">Acto o Circunstancia Inscriptible</TableHead>
                <TableHead className="font-semibold text-[var(--rm-text)] text-right w-40">Tarifa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TARIFAS.map((fee) => (
                <TableRow key={fee.num} className="hover:bg-[var(--rm-text)]/3 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{fee.num}</TableCell>
                  <TableCell className="text-sm">{fee.acto}</TableCell>
                  <TableCell className="text-right font-semibold text-[var(--rm-text)]">{fee.tarifa}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-xs text-muted-foreground">
            <strong>Exenciones (Sexto de la Res. 51/2021):</strong> Certificaciones
            o notas simples solicitadas por mandamiento judicial, solicitud del Fiscal,
            del Ministerio de Justicia o de la Administración cuando requieran sustanciar
            de oficio un hecho.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Recargos (Art. 27, DL 226/2001):</strong> El incumplimiento de los
            términos para la inscripción genera un recargo del 30% del valor del acto
            inscriptible.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Tipo de certificaciones (Art. 75, DL 226/2001):</strong> Literal
            (copia fiel del asiento, 900 CUP), En relación (extremos determinados, 600 CUP),
            Negativa (datos no constan en el Registro, 600 CUP), Nota Simple Informativa
            (resumen de datos públicos, 300 CUP). Requieren legitimación del solicitante
            conforme al Art. 82 del Reglamento (Res. 230/2002).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}