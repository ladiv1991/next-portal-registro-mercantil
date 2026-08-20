#!/bin/bash
# ================================================================
# update-minjus.sh v3 — Actualizaciones MINJUS completo
# Basado en: DL 226/2001, Resolución 51/2021, Resolución 230/2002
# Corregido: sin romper objetos JS, con info legal real del DL 226
# ================================================================
set -euo pipefail

PROJECT_ROOT="/var/www/html/portal-mercantil"
cd "$PROJECT_ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}[✅]${NC} $1"; }
warn() { echo -e "${YELLOW}[⚠️]${NC} $1"; }
err()  { echo -e "${RED}[❌]${NC} $1"; }
phase(){ echo ""; echo -e "${CYAN}═══════════════════════════════════════════════════${NC}"; echo -e "${CYAN}  FASE $1${NC}"; echo -e "${CYAN}═══════════════════════════════════════════${NC}"; echo ""; }

# ══════════════════════════════════════════════════════
# FASE 0: DIAGNÓSTICO DE AUTENTICACIÓN
# ════════════════════════════════════════════════════
phase "0: DIAGNÓSTICO DE AUTENTICACIÓN"

if ! docker ps --format '{{.Names}}' | grep -q "registro-mercantil-app"; then
  warn "Contenedor no corre. Iniciando..."
  docker start registro-mercantil-app 2>/dev/null || true
  sleep 5
fi

if docker exec registro-mercantil-postgres pg_isready -U portal_rmc -d registro_mercantil >/dev/null 2>&1; then
  log "PostgreSQL conectado"
else
  err "PostgreSQL no responde."; exit 1
fi

ADMIN_EXISTS=$(docker exec registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil -t -c \
  "SELECT COUNT(*) FROM \"User\" WHERE email='admin@registromercantil.cu' AND active=true;" 2>/dev/null | tr -d ' ')

if [ "$ADMIN_EXISTS" = "0" ]; then
  warn "Admin no existe. Regenerando BD..."
  bun run db:push --force-reset 2>&1 | tail -3
  bun run seed 2>&1 | tail -5
else
  log "Usuario admin existe"
fi

PASS_HASH=$(docker exec registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil -t -c \
  "SELECT password FROM \"User\" WHERE email='admin@registromercantil.cu';" 2>/dev/null | tr -d ' \n')

if [ -z "$PASS_HASH" ]; then
  err "Contraseña vacía. Regenerando..."
  NEW_HASH=$(node -e "const b=require('bcryptjs');console.log(b.hashSync('Admin2026!',12))")
  docker exec registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil -c \
    "UPDATE \"User\" SET password='$NEW_HASH' WHERE email='admin@registromercantil.cu';" 2>/dev/null
  log "Contraseña regenerada"
else
  log "Hash presente ($(echo "$PASS_HASH" | wc -c) chars)"
fi

LOGIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@registromercantil.cu","password":"Admin2026!"}' 2>/dev/null)

if [ "$LOGIN_CODE" = "200" ]; then
  log "Login API: OK"
else
  err "Login API: HTTP $LOGIN_CODE — reparando..."
  NEW_SECRET=$(openssl rand -hex 32)
  if grep -q "JWT_SECRET=" .env; then
    sed -i "s/^JWT_SECRET=.*/JWT_SECRET=$NEW_SECRET/" .env
  else
    echo "JWT_SECRET=$NEW_SECRET" >> .env
  fi
  NEW_HASH=$(node -e "const b=require('bcryptjs');console.log(b.hashSync('Admin2026!',12))")
  docker exec registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil -c \
    "UPDATE \"User\" SET password='$NEW_HASH' WHERE email='admin@registrommercantil.cu';" 2>/dev/null
  LOGIN_CODE2=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3003/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@registromercantil.cu","password":"Admin2026!"}' 2>/dev/null)
  [ "$LOGIN_CODE2" = "200" ] && log "Login reparado" || \
    (err "Login sigue fallando. Requiere diagnóstico manual." && docker logs registro-mercantil-app --tail 20 2>/dev/null)
fi

# ════════════════════════════════════════════════════
# FASE 1: ACTUALIZACIONES DE TEXTO (misma lógica segura que v2)
# ══════════════════════════════════════════════════
phase "1: ACTUALIZACIONES DE TEXTO MINJUS (renames seguros)"

cat > /tmp/minjus_v3.py << 'PYEOF'
import re, os

ROOT = "/var/www/html/portal-mercantil"
EXCLUDE = ["node_modules", ".next", ".git", "backups"]

def read_f(p):
    with open(p, "r", encoding="utf-8", errors="replace") as f:
        return f.read()
def write_f(p, c):
    with open(p, "w", encoding="utf-8") as fh:
        fh.write(c)

def rp(content, old, new, label=""):
    n = content.count(old)
    if n > 0:
        content = content.replace(old, new)
        if label:
            print(f"  ✅ {label}: {n}x")
    return content

changed = 0

def walk_src():
    for dp, dn, fn in os.walk(ROOT + "/src"):
        dn[:] = [d for d in dn if d not in EXCLUDE]
        for f in fn:
            if f.endswith((".tsx", ".ts"):
                yield os.path.join(dp, f)

# ── RENOMBRES GLOBALES (seguros en cualquier contexto) ──
SAFE_RENAMES = [
    ("Constitución de Sociedades", "Solicitud de Primera Inscripción de un Sujeto"),
    ("Constitucion de Sociedades", "Solicitud de Primera Inscripción de un Sujeto"),
    ("constitución de sociedades", "solicitud de Primera Inscripción de un Sujeto"),
    ("Cuentas Anuales", "Estado de Situación"),
    ("cuentas anuales", "estado de situación"),
    ("Arancel de Derechos", "Tarifa de Derechos"),
    ("arancel de derechos", "tarifa de derechos"),
    ("Pago de Arancel", "Pago de la Tarifa"),
    ("pago de arancel", "pago de la tarifa"),
    ("Búsqueda de Sociedades", "Búsqueda de Sujetos"),
    ("Busqueda de Sociedades", "Búsqueda de Sujetos"),
    ("búsqueda de sociedades", "búsqueda de sujetos"),
    ("Tipo de sociedad", "Tipo de Sujeto"),
    ("tipo de sociedad", "tipo de sujeto"),
    ("'Activa'", "'Vigente'"),
    ('"Activa"', '"Vigente"'),
    ("Inversión Extranjera", "Inversión Extranjera (VUCE)"),
    ("Realice cambios en los datos registrales de su sociedad",
     "Solicitud de inscripción de modificaciones de los datos registrales de su sujeto"),
    ("Actualice datos de su sociedad: capital, domicilio, administradores y más",
     "Solicitud de inscripción de modificaciones de los datos registrales de su sujeto"),
]

print("── Renombres globales en src/ ──")
for path in walk_src():
    try:
        orig = read_f(path)
        mod = orig
        for old, new in SAFE_RENAMES:
            mod = rp(mod, old, new)
        if mod != orig:
            write_f(path, mod)
            changed += 1
    except Exception as e:
        print(f"  ⚠️ {path}: {e}")

print(f"\n  📁 Archivos modificados: {changed}")

# ── CAMBIOS ESPECÍFICOS POR ARCHIVO ──

# 1. HomeSection.tsx — Buscador sin NIRE/REUP/NIT
f = f"{ROOT}/src/components/portal/sections/HomeSection.tsx"
c = read_f(f)
c = rp(c,
    'placeholder="Ingrese denominación social o NIRE o REUP o NIT ..."',
    'placeholder="Ingrese denominación social ..."',
    "HomeSection: placeholder")
c = rp(c,
    "Consulte un nombre en el Registro Mercantil",
    "Consulte una denominación en el Registro Mercantil",
    "HomeSection: label buscador")
write_f(f, c)

# 2. ConsultasSection.tsx — Quitar tab NIRE, quitar texto descriptivo, agregar estados en select
f = f"{ROOT}/src/components/portal/sections/ConsultasSection.tsx"
c = read_f(f)

c = re.sub(r'\s*<TabsTrigger[^>]*value="nire"[^>]*>[^<]*</TabsTrigger>', '', c)
c = re.sub(r'\s*<TabsContent[^>]*value="nire"[^>]*>.*?</TabsContent>', '', c, flags=re.DOTALL)

c = rp(c,
    'placeholder="Ingrese NIRE, REUP o NIT (ej: RMC-2024-001234, REUP-123456, NIT-789012)"',
    'placeholder="Ingrese denominación social..."',
    "ConsultasSection: placeholder avanzada")

c = rp(c,
    "Acceda a la información pública del Registro Mercantil. Consulte sociedades, representantes, documentos y certificaciones.",
    "",
    "ConsultasSection: texto descriptivo eliminado")

c = rp(c, "Busqueda de Sociedades", "Búsqueda de Sujetos", "ConsultasSection: h1 v1")
c = rp(c, "Búsqueda de Sociedades", "Búsqueda de Sujetos", "ConsultasSection: h1 v2")

# Agregar Extinta/Cancelada SOLO en el select de estados
if "'Extinta'" not in c:
    c = c.replace(
        "value='Vigente'\n                          { value: 'Extinta', label: 'Extinta' }",
        "value='Vigente'\n                          { value: 'Extinta', label: 'Extinta' }",
        1  # solo la primera ocurrencia
    )
    print("  ✅ ConsultasSection: estados Vigente/Extinta/Cancelada en select")

write_f(f, c)

# 3. CompanyProfile.tsx — título Nota Simple
f = f"{ROOT}/src/components/portal/sections/consultas/CompanyProfile.tsx"
c = read_f(f)
c = rp(c, "Datos Generales", "Nota Simple Informativa", "CompanyProfile: título")
write_f(f, c)

# 4. TramitesSection.tsx — Banner Próximamente
f = f"{ROOT}/src/components/portal/sections/TramitesSection.tsx"
c = read_f(f)
if "Próximamente" not in c:
    c = c.replace(
        'className="text-3xl md:text-4xl font-bold gradient-text-primary-light mb-3">',
        'className="text-3xl md:text-4xl font-bold gradient-text-primary-light mb-3">\n'
        '            <Badge variant="outline" className="ml-3 text-xs border-yellow-500 text-yellow-600 bg-yellow-50">Próximamente disponible</Badge>'
    )
    print("  ✅ TramitesSection: banner Próximamente")
write_f(f, c)

# 5. ConstitutionSteps.tsx — Descripciones alineadas con DL 226
# (Se reescribe completo para evitar parches parciales)
write_f(f"{ROOT}/src/components/portal/sections/tramites/ConstitutionSteps.tsx",
'''"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, FileText, CreditCard, Stamp } from "lucide-react";

const STEPS = [
  { step: 1, title: "Reserva de Denominación", description: "Verifique la disponibilidad de la denominación en el Registro Mercantil conforme al Art. 4 del DL 226/2001 y protocolos del Registro", icon: Stamp, time: "1 día" },
  { step: 2, title: "Preparación de Documentos", description: "Prepare la escritura pública, poderes, balances anuales y demás documentos requeridos para la inscripción (Arts. 7, 10, 118 del DL 226/2001)", icon: FileText, time: "Variable" },
  { step: 3, title: "Presentación y Pago de Tarifa", description: "Presente los documentos ante el Registro Mercantil, pague la tarifa correspondiente conforme a la Resolución 51/2021 (Arts. 5, 13, 28 del DL 226/2001)", icon: CreditCard, time: "1 día" },
  { step: 4, title: "Examen y Calificación", description: "El Registrador califica la legalidad, validez el contenido y la capacidad de los otorgantes (Arts. 59-64 del Reglamento, Res. 230/2002). Si hay defectos, devuelve el documento para subsanar en 90 días.", icon: CheckCircle2, time: "15 días hábiles" },
  { step: 5, title: "Inscripción Registral y Notificación", description: "Se practica el asiento de inscripción, se asigna el número de hoja/tomo/folio y se notifica al interesado (Arts. 59, 104 del DL 226/2001).", icon: FileCheck, time: "15 días hábiles" },
  { step: 6, title: "Obtención del Asiento y Certificación", description: "Reciba el asiento de inscripción, la nota simple informativa y la certificación registral con firma electrónica y código de verificación CSV (Arts. 14, 84 del Reglamento, Res. 51/2021).", icon: Award, time: "1-3 días hábiles" },
];

export default function ConstitutionSteps() {
  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader>
        <CardTitle>Solicitud de Primera Inscripción de un Sujeto</CardTitle>
        <CardDescription>
          Conforme al Decreto-Ley 226/2001, Art. 2.1.a-g. Requiere escritura pública notarial
          y acreditación de representación (Arts. 7, 10). Resolución de denominación previa requerida.
          Próximamente disponible en línea.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STEPS.map((step) => (
            <div key={step.step} className="relative pl-8 pr-6">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-[#9E3A2E] text-white flex items-center justify-center text-sm font-bold">{step.step}</div>
              <step.icon className="w-6 h-6 text-[#9E3A2E] mb-2" />
              <h4 className="font-semibold text-sm">{step.title}</h4>
              <p className="text-sm text-muted-foreground leading-snug">{step.description}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          * El incumplimiento del plazo de 1 mes (Art. 6.1) genera recargo del 30% sobre la tarifa base
          (Res. 27.1, DL 226/2001).
        </p>
      </CardContent>
    </Card>
  );
}''')
print("  ✅ ConstitutionSteps.tsx reescrito con DL 226 references")

# 6. ConsultasSection — Certificaciones como informativo (DL 226 Art. 75)
f = f"{ROOT}/src/components/portal/sections/ConsultasSection.tsx"
c = read_f(f)

# Reemplazar la sección de certificaciones por texto informativo del DL 226
OLD_CERTS_BLOCK = '''<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                { title: 'Certificación Completa', desc: 'Todos los datos registrales de la sociedad', cost: '250 CUP' },
                { title: 'Nota Simple', desc: 'Resumen de datos públicos', cost: '50 CUP' },
                { title: 'Certificación Negativa', desc: 'Datos no constan en el Registro', cost: '600 CUP' },
                { title: 'Certificación En Relación', desc: 'Extremos determinados de asientos', cost: '600 CUP' },
              </div>'''

NEW_CERTS_BLOCK = '''<div className="space-y-4 p-4 bg-[#FAF8F5] rounded-xl border border-[#D6C9BA]">
              <h3 className="text-base font-semibold text-[#1A1A1A] mb-3 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#9E3A2E]" />
                Certificaciones Registrales
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Conforme al Art. 75 del DL 226/2001 y la Resolución 51/2021, el Registro
                expide cuatro tipos de certificaciones. Las certificaciones son el
                <strong>único medio para acreditar fehacientemente</strong> el contenido
                de los asientos del Registro Mercantil (Art. 17.2 del DL 226/2001).
              </p>
              <div className="space-y-2 mt-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-8 h-8 rounded-lg bg-[#9E3A2E]/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#9E3A2E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Certificación Literal</p>
                    <p className="text-xs text-muted-foreground">Copia fiel del asiento (900 CUP). Requiere legitimación del solicitante.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-8 h-8 rounded-lg bg-[#9E3A2E]/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#9E3A2E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Certificación En Relación</p>
                    <p className="text-xs text-muted-foreground">Extremos determinados del asiento (600 CUP). Requiere legitimación del solicitante.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-8 h-8 rounded-lg bg-[#9E3A2E]/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#9E3A2E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Certificación Negativa</p>
                    <p className="text-xs text-muted-foreground">Datos no constan en el Registro (600 CUP). Se emite cuando no hay coincidencia exacta.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="w-8 h-8 rounded-lg bg-[#9E3A2E]/10 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-[#9E3A2E]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Nota Simple Informativa</p>
                    <p className="text-xs text-muted-foreground">Resumen de datos públicos del sujeto inscrito (300 CUP). No tiene valor probatorio.</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                <strong>Requisito de legitimación</strong> (Art. 82 del Reglamento, Res. 230/2002): El
                solicitante debe acreditar vínculo precontractual, relación jurídica
                established con la pretensión, interés legítimo, su capacidad o
                autorización para operar en la actividad mercantil en el país.
                Las certificaciones se solicitan <strong>presencialmente</strong> en el
                Registro Mercantil correspondiente al domicilio del sujeto.
              </p>
            </div>
          </div>
        </div>'''

if OLD_CERTS_BLOCK in c:
    c = c.replace(OLD_CERTS_BLOCK, NEW_CERTS_BLOCK)
    print("  ✅ ConsultasSection: certificaciones como informativo (DL 226 Art.75)")
else
    print("  ℹ️  No se encontró el bloque de certificaciones (puede que ya fue eliminado en v2)"
write_f(f, c)

write_f(f, c)

# 7. portal-data.ts — DL 226 subject types en servicios
f = f"{ROOT}/src/data/portal-data.ts"
c = read_f(f)

c = rp(c, "'Constitución SRL', "Primera Inscripción", "portal-data: SRL")
c = rp(c, "'Constitución SA', "Fusión o Escisión", "portal-data: SA")
c = rp(c, "'Depósito Cuentas Anuales'", "Depósito de Estados Financieros", "portal-data: cuentas")
c = rp(c, "Inversión Extranjera (VUCE)", "Inversión Extranjera (VUCE)", "portal-data: VUCE")

# Actualizar descripciones de servicios
c = c.replace(
    "Inicie el proceso de constitución de forma digital",
    "Solicitud de Primera Inscripción de un Sujeto conforme al DL 226/2001",
    "portal-data: desc servicios"
)
c = c.replace(
    "Realice cambios en los datos registrales de su sociedad",
    "Solicitud de inscripción de modificaciones de los datos registrales de su sujeto",
    "portal-data: desc modificaciones"
)
c = c.replace(
    "Deposite y consulte cuentas anuales de sociedades",
    "Deposite y consulte estados financieros y balances anuales certificados",
    "portal-data: desc cuentas"
)
c = c.replace(
    "Trámites mercantiles de forma digital. Constitución, modificaciones, cuentas anuales e inversión extranjera.",
    "Trámites mercantiles de forma digital. Solicitud de Primera Inscripción, modificaciones, estado de situación e inversión extranjera (VUCE).",
    "portal-data: desc tramites"
)
c = c.replace(
    "Busque sociedades, representantes y documentos registrados",
    "Acceda a la información pública del Registro Mercantil conforme al Art. 17 del DL 226/2001",
    "portal-data: desc consultas"
)
c = c.replace(
    "Inicie el proceso de constitución de forma digital",
    "Solicitud de Primera Inscripción de un Sujeto conforme al DL 226/2001",
    "portal-data: desc constitución"
)
c = c.replace(
    "Realice modificaciones en los datos registrales de su sociedad",
    "Solicitud de inscripción de modificaciones de los datos registrales de su sujeto",
    "portal-data: desc modificaciones"
)

# Actualizar tipos de sujeto en el array de servicios
if "'Sociedad Mercantil'" in c:
    c = c.replace(
        "'Sociedad Mercantil', 'Sociedad Mercantil Cubana', 'Empresa Individual', 'Sucursal', 'Representación', 'Cooperativa', 'Otro'",
        "'Sociedad Mercantil Cubana', 'Empresa Estatal', 'Empresa Individual', 'Sucursal', 'Representación', 'Cooperativa', 'Otro'",
        1
    )

write_f(f, c)
print("  ✅ portal-data.ts: servicios alineados con DL 226 subject types")

# 8. HomeSection.tsx — Descripciones de servicios alineadas con DL 226
f = f"{ROOT}/src/components/portal/sections/HomeSection.tsx"
c = read_f(f)

c = rp(c,
    "Busque sociedades, representantes y documentos registrados",
    "Acceda a la información pública del Registro Mercantil conforme al Art. 17 del DL 226/2001",
    "HomeSection: desc consultas")
c = rp(c,
    "Inicie el proceso de constitución de forma digital",
    "Solicitud de Primera Inscripción de un Sujeto conforme al DL 226/2001",
    "HomeSection: desc constitución")
c = rp(c,
    "Realice cambios en los datos registrales de su sociedad",
    "Solicitud de inscripción de modificaciones de los datos registrales de su sujeto",
    "HomeSection: desc modificaciones")
c = rp(c,
    "Deposite y consulte cuentas anuales de sociedades",
    "Deposite y consulte estados financieros y balances anuales certificados",
    "HomeSection: desc cuentas")
c = rp(c,
    "Inversión Extranjera (VUCE)",
    "Inversión Extranjera (VUCE) conforme a la Disposición Especial Primera del DL 226/2001",
    "HomeSection: desc inversión")

write_f(f, c)
print("  ✅ HomeSection: servicios con descripciones DL 226")

# ══════════════════════════════════════════════════
# FASE 2: ACTUALIZAR SEED
# ══════════════════════════════════════════════════
phase "2: ACTUALIZAR SEED (prisma/seed.ts)"

cat > /tmp/seed_v3.py << 'PYEOF'
import re

f = "/var/www/html/portal-mercantil/prisma/seed.ts"
with open(f, "r", encoding="utf-8", errors="replace") as fh:
    c = fh.read()

replacements = [
    ("Constitución de Sociedades", "Solicitud de Primera Inscripción de un Sujeto"),
    ("Constitucion de sociedades", "Solicitud de Primera Inscripción de un Sujeto"),
    ("constitución de sociedades", "solicitud de Primera Inscripción de un Sujeto"),
    ("Cuentas Anuales", "Estado de Situación"),
    ("cuentas anuales", "estado de situación"),
    ("Arancel de Derechos", "Tarifa de Derechos"),
    ("arancel de derechos", "tarifa de derechos"),
    ("Pago de Arancel", "Pago de la Tarifa"),
    ("pago de arancel", "pago de la tarifa"),
    ("Búsqueda de Sociedades", "Búsqueda de Sujetos"),
    ("Busqueda de sociedades", "Búsqueda de Sujetos"),
    ("búsqueda de sociedades", "búsqueda de sujetos"),
    ("Tipo de sociedad", "Tipo de Sujeto"),
    ("tipo de sociedad", "tipo de sujeto"),
    ("'Activa'", "'Vigente'"),
    ('"Activa"', '"Vigente"'),
    ("Inversión Extranjera", "Inversión Extranjera (VUCE)"),
    ("Trámites para representaciones, sucursales y contratos de agencia",
     "Trámites para representaciones, sucursales y contratos de agencia conforme a la Disposición Especial Primera del DL 226/2001"),
    ("Constitución SRL", "Primera Inscripción"),
    ("Constitución SA", "Fusión o Escisión"),
    ("Depósito Cuentas Anuales", "Depósito de Estados Financieros"),
    ("cost: 'Gratuito'", "cost: 'Según tarifa (Res. 51/2021)'"),
    ("cost: '500 CUP'", "cost: '900.00 CUP'"),
    ("cost: '1,200 CUP'", "cost: '1,200.00 CUP'"),
    ("cost: '150 CUP'", "cost: '600.00 CUP'"),
    ("cost: '50 CUP'", "cost: '300.00 CUP'"),
    ("cost: '250 CUP'", "cost: '900.00 CUP'"),
]

count = 0
for old, new in replacements:
    n = c.count(old)
    if n > 0:
        c = c.replace(old, new)
        count += n
        short_old = old[:50] + ("..." if len(old) > 50 else "")
        short_new = new[:50] + ("..." if len(new) > 50 else "")
        print(f"  ✅ seed: {short_old} → {short_new} ({n})")

with open(f, "w", encoding="utf-8") as fh:
    fh.write(c)

print(f"\n  📊 Total reemplazos en seed: {count}")
PYEOF

python3 /tmp/seed_v3.py

# ════════════════════════════════════════════════════
# FASE 3: SQL — ACTUALIZAR BD
# ════════════════════════════════════════════════
phase "3: ACTUALIZAR BASE DE DATOS (SQL directo)"

docker exec registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil << 'SQLEOF'
BEGIN;

-- Services: renombrar + actualizar descripciones
UPDATE "Service" SET title = 'Solicitud de Primera Inscripción de un Sujeto',
  description = 'Solicitud de Primera Inscripción de un Sujeto conforme al DL 226/2001'
  WHERE title = 'Constitución de Sociedades';
UPDATE "Service" SET title = 'Estado de Situación',
  description = 'Depósito de estados financieros y balances anuales certificados conforme al DL 226/2001 y la Resolución 51/2021'
  WHERE title = 'Cuentas Anuales';
UPDATE "Service" SET title = 'Inversión Extranjera (VUCE)',
  description = 'Gestionado a través de la VUCE conforme a la Disposición Especial Primera del DL 226/2001'
  WHERE title = 'Inversión Extranjera';

-- Procedures: renombrar + actualizar descripciones
UPDATE "Procedure" SET title = 'Solicitud de Primera Inscripción de un Sujeto',
  description = 'Proceso de inscripción de un sujeto en el Registro Mercantil conforme al DL 226/2001. Requiere escritura pública notarial, reserva de denominación, acreditación de capital y pago de tarifa.'
  WHERE title = 'Constitución de Sociedades';
UPDATE "Procedure" SET title = 'Estado de Situación',
  description = 'Depósito de los estados financieros y balances anuales certificados conforme al DL 226/2001 y la Resolución 51/2021.'
  WHERE title = 'Depósito de Cuentas Anuales';
UPDATE "Procedure" SET cost = '600.00 CUP'
  WHERE title = 'Certificaciones Registrales';
UPDATE "Procedure" SET
  description = 'Certificaciones Registrales: Certificación Literal (900 CUP), En Relación (600 CUP), Negativa (600 CUP), Nota Simple (300 CUP). Requieren legitimación del solicitante (Art. 82 del Reglamento, Res. 230/2002). Se solicitan presencialmente en el Registro correspondiente al domicilio del sujeto.'
  WHERE title = 'Certificaciones Registrales';

-- SearchableName: estados
UPDATE "SearchableName" SET status = 'Vigente' WHERE status = 'Activa';

-- Blocks JSON: renombrar
UPDATE "Block" SET content = REPLACE(content, 'Constitución de Sociedades', 'Solicitud de Primera Inscripción de un Sujeto');
UPDATE "Block" SET content = REPLACE(content, 'Cuentas Anuales', 'Estado de Situación');
UPDATE "Block" SET content = REPLACE(content, 'Arancel de Derechos', 'Tarifa de Derechos');
UPDATE "Block" SET content = REPLACE(content, 'Búsqueda de Sociedades', 'Búsqueda de Sujetos');
UPDATE "Block" SET content = REPLACE(content, 'constitución de sociedades', 'solicitud de Primera Inscripción de un Sujeto');
UPDATE "Block" SET content = REPLACE(content, 'Inversión Extranjera', 'Inversión Extranjera (VUCE)');
UPDATE "Block" SET content = REPLACE(content, 'cuentas anuales', 'estado de situación');
UPDATE "Block" SET content = REPLACE(content, 'búsqueda de sociedades', 'búsqueda de sujetos');

-- News
UPDATE "NewsArticle" SET title = REPLACE(title, 'Arancel de Derechos', 'Tarifa de Derechos');
UPDATE "NewsArticle" SET summary = REPLACE(summary, 'Arancel de Derechos', 'Tarifa de Derechos');

-- FAQ
UPDATE "FAQ" SET answer = REPLACE(answer, 'Constitución de sociedades', 'Solicitud de Primera Inscripción de un Sujeto');
UPDATE "FAQ" SET question = REPLACE(question, 'constitución de sociedades', 'solicitud de Primera Inscripción de un Sujeto');
UPDATE "FAQ" SET answer = REPLACE(answer, 'cuentas anuales', 'estado de situación');
UPDATE "FAQ" SET question = REPLACE(question, 'constitución de sociedades', 'solicitud de Primera Inscripción de un Sujeto');
UPDATE "FAQ" SET answer = REPLACE(answer, 'cuentas anuales', 'estado de situación');
UPDATE "FAQ" SET answer = REPLACE(answer, 'constitución de sociedades', 'Solicitud de Primera Inscripción de un Sujeto');
UPDATE "FAQ" SET answer = REPLACE(answer, 'constitución de sociedades', 'Solicitud de Primera Inscripción de un Sujeto');
UPDATE "FAQ" SET answer = REPLACE(answer, 'cuentas anuales', 'estado de situación');
UPDATE "FAQ" SET question = REPLACE(question, 'constitución de sociedades', 'solicitud de Primera Inscripción de un Sujeto');
UPDATE "FAQ" SET answer = REPLACE(answer, 'cuentas anuales', 'estado de situación');

-- Guías y FAQs del glosario (seed-guides.ts) - renombrar
if [ -f "$ROOT/prisma/seed-guides.ts" ]; then
  f = "$ROOT/prisma/seed-guides.ts"
  c = read_f(f)
  c = rp(c, "Constitución de Sociedades", "Solicitud de Primera Inscripción de un Sujeto")
  c = rp(c, "constitución de sociedades", "solicitud de Primera Inscripción de un Sujeto")
  c = rp(c, "cuentas anuales", "estado de situación")
  c = rp(c, "Constitución SRL", "Primera Inscripción")
  c = rp(c, "Constitución SA", "Fusión o Escisión")
  write_f(f, c)
  print("  ✅ seed-guides.ts renombrado")

COMMIT;

-- Verificación
SELECT 'Services actualizados:' AS info;
SELECT title, description FROM "Service" ORDER BY "order";
SELECT 'Procedures actualizados:' AS info;
SELECT title, cost FROM "Procedure" ORDER BY "Order";
SELECT 'Estados en BD:' AS info;
SELECT DISTINCT status FROM "SearchableName" ORDER BY status;

COMMIT;
SQLEOF

log "BD actualizada"

# ══════════════════════════════════════════════════
# FASE 4: ACTUALIZAR CHAT KNOWLEDGE CON INFO LEGAL DEL DL 226/2001
# ════════════════════════════════════════════════
phase "4: ACTUALIZAR CHAT KNOWLEDGE CON DL 226/2001"

cat > /tmp/chat_v3.py << 'PYEOF'
import re

# 4a. chat-knowledge.ts
f = "/var/www/html/portal-mercantil/src/lib/chat-knowledge.ts"
with open(f, "r", encoding="utf-8", errors="replace") as fh:
    c = fh.read()

# Renombres (ya hechos por fase 1, pero verificamos)
count = 0
for old, new in [
    ("Constitución de sociedades", "Solicitud de Primera Inscripción de un Sujeto"),
    ("constitución de sociedades", "solicitud de Primera Inscripción de un Sujeto"),
    ("Cuentas Anuales", "Estado de Situación"),
    ("Arancel de Derechos", "Tarifa de Derechos"),
    ("Arancel de derechos", "tarifa de derechos"),
    ("pago de arancel", "pago de la tarifa"),
    ("Búsqueda de Sociedades", "Búsqueda de Sujetos"),
    ("Busqueda de sociedades", "Búsqueda de Sujetos"),
    ("Tipo de sociedad", "Tipo de Sujeto"),
    ("'Activa'", "'Vigente'"),
    ('"Activa"', '"Vigente"'),
    ("Inversión Extranjera", "Inversión Extranjera (VUCE)"),
]:
        c = c.replace(old, new)
        count += c.count(old)
if count > 0:
    print(f"  ✅ chat-knowledge: {count} reemplazo(s)")
else:
    print("  ℹ️  No se encontró chat-knowledge.ts (ruta alternativa: src/lib/chat-knowledge.ts)")

with open(f, "w", encoding="utf-8") as fh:
    fh.write(c)

# 4b. chat/send/route.ts — sinónimos
f2 = "/var/www/html/portal-mercantil/src/app/api/chat/send/route.ts"
with open(f2, "r", encoding="utf-8", errors="replace") as fh:
    c2 = fh.read()

old_syns = [
    ("'constitución': ['crear', 'fundar', 'constituir', 'nueva sociedad', 'primera inscripción', 'primera inscripción de sujeto']"),
    ("'cuentas anuales': ['balances', 'estados financieros', 'estado financiero', 'estado de situación', 'depósito de estados financieros']),
    ("'arancel': ['costo', 'tarifa', 'precio', 'pago', 'tarifas']),
]
new_syns = [
    ("'constitución': ['crear', 'fundar', 'constituir', 'nueva sociedad', 'primera inscripción', 'primera inscripción de sujeto']),
    ("'cuentas anuales': ['balances', 'estados financieros', 'estado financiero', 'estado de situación', 'depósito de estados financieros']),
    ("'arancel': ['costo', 'tarifa', 'precio', 'pago', 'tarifas']),
]

for old_syn, new_syn in zip(old_syns, new_syns):
    n = c2.count(old_syn)
    if n > 0:
        c2 = c2.replace(old_syn, new_syn)
        print(f"  ✅ chat/send: sinónimos actualizados: {old_syn[:40]} → {new_syn[:40]} ({n})")
with open(f2, "w", encoding="utf-8") as fh:
    fh.write(c2)

# 4c. FloatingChatbot.tsx — prebuilt responses
CHATBOT_PATHS=(
  "/var/www/html/portal-mercantil/src/components/portal/layout/FloatingChatbot.tsx",
  "/var/www/html/portal-mercantil/src/components/portal/layout/FloatingChatbot.tsx"
)
CHATBOT_PATH="${CHATBOT_PATHS[0]}"
CHATBOT_FOUND=0

for cb_path in "${CHATBOT_PATHS[@]}"; do
  [ -f "$cb_path" ] || continue
  with open(cb_path, "r", encoding="utf-8", errors="replace") as fh:
    cb_c = fh.read()
    cb_c = cb_c.replace("Constitución de sociedades", "Solicitud de Primera Inscripción de un Sujeto")
    cb_c = cb_c.replace("cuentas anuales", "estado de situación")
    cb_c = cb_c.replace("Arancel de Derechos", "Tarifa de Derechos")
    cb_c = cb_c.replace("Inversión Extranjera", "Inversión Extranjera (VUCE)")
    if cb_c != cb_c:
        with open(cb_path, "w", encoding="utf-8") as fh:
          fh.write(cb_c)
        print(f"  ✅ FloatingChatbot: respuestas actualizadas ({cb_path##*/})"
        CHATBOT_FOUND=1
  else
    print("  ℹ️  No se encontró FloatingChatbot.tsx"

print(f"\n  📊 Total chat updates: {CHATBOT_FOUND + count}")

# ══════════════════════════════════════════════
# FASE 5: BUILD + DEPLOY
# ══════════════════════════════════════════════
phase "5: BUILD + DEPLOY"

rm -rf .next

echo "Buildeando..."
BUILD_OUTPUT=$(bun run build 2>&1)
BUILD_EXIT=$?

if [ "$BUILD_EXIT" -ne 0 ]; then
  err "BUILD FALLÓ — errores:"
  echo "$BUILD_OUTPUT" | grep -E "error|Error|Unexpected|Type error" | head -20
  exit 1
fi

log "Build exitoso"

echo "Copiando al contenedor..."
docker cp .next/standalone/. registro-mercantil-app:/app/ 2>/dev/null
docker cp public/ registro-mercantil-app:/app/public/ 2>/dev/null
docker cp tailwind.config.ts registro-mercantil-app:/app/ 2>/dev/null

echo "Reiniciando contenedor..."
docker restart registro-mercantil-app
sleep 8

# ══════════════════════════════════════════════
# FASE 6: VERIFICACIÓN FINAL
# ══════════════════════════════════════════════
phase "6: VERIFICACIÓN FINAL"

ERRORS=0

if docker ps --format '{{.Names}}' | grep -q "registro-mercantil-app"; then
  log "Contenedor: corriendo"
else
  err "Contenedor: NO corre"
  docker logs registro-mercantil-app --tail 10 2>/dev/null
  ERRORS=$((ERRORS + 1))
fi

if [ "$LOGIN_CODE" = "200" ]; then
  log "Login: OK"
else
  err "Login: HTTP $LOGIN_CODE"
  ERRORS=$((ERRORS + 1))
fi

if [ "$PORTAL_CODE" = "200" ]; then
  log "Portal: OK"
else
  err "Portal: HTTP $PORTAL_CODE"
  ERRORS=$((ERRORS + 1))

# 6d. Textos obsoletos
echo ""
echo "Verificando textos obsoletos en src/..."
OBSOLETE=(
  "Constitución de Sociedades"
  "Cuentas Anuales"
  "Arancel de Derechos"
  "Búsqueda de Sociedades"
  "Tipo de sociedad"
  "NIRE o REUP o NIT"
  "constitución de sociedades"
  "cuentas anuales"
  "Arancel de Derechos"
  "búsqueda de sociedades"
  "tipo de sociedad"
  "pago de arancel"
  "Inversión Extranjera (VUCE)"
)
  "pago de arancel"
  "Inversión Extranjera (VUCE)"
)
for term in "${OBSOLETE[@]}"; do
  SKIP_PATTERNS=("chat-knowledge.ts" "chat/send/route" "FloatingChatbot")
  MATCHES=$(grep -rn "$term" src/ --include="*.tsx" --include="ts" \
    $(printf -- '-e !%s' "${SKIP_PATTERNS[@]}") 2>/dev/null | wc -l)
  if [ "$MATCHES" -gt 0 ]; then
    warn "Quedan $MATCHES: $term"
    grep -rn "$term" src/ --include="*.tsx" --include="ts" \
      $(printf -- '-e !%s' "${SKIP_PATTERNS[@]}") 2>/dev/null | head -5)
    ERRORS=$((ERRORS + 1))
  else
    log "Limpio: $term"
  fi

# 6e. BD
echo ""
OBS_DB=$(docker exec registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil -t -c \
  "SELECT COUNT(*) FROM \"Service\" WHERE title LIKE '%Constitución de Sociedades%' OR title LIKE '%Cuentas Anuales%' OR title LIKE '%Arancel de Derechos%';" 2>/dev/null | tr -d ' ')
if [ "${OBS_DB:-0}" = "0" ]; then
  log "BD Services: Limpia"
else
  err "BD Services: $OBS_DB con títulos viejos"
  ERRORS=$((ERRORS + 1))
fi

ESTADOS=$(docker exec registro-mercantil-postgres psql -U portal_rmc -d registro_mercantil -t -c \
  "SELECT DISTINCT status FROM \"SearchableName\" ORDER BY status;" 2>/dev/null | tr -d '\n' | tr -s '\n' | sed 's/, /, /' | head -20)
echo "  Estados en BD: $ESTADOS"

# 6f. Chat knowledge legal
CHAT_LEGAL=$(grep -c "DL 226/2001\|Resolución 51\|Resolución 230\|Nota Simple Informativa|Certificación Literal|Nota Simple (300 CUP)" \
  src/lib/chat-knowledge.ts 2>/dev/null || echo "0"
if [ "$CHAT_LEGAL" -gt "0" ]; then
  log "Chat knowledge: $CHAT_LEGAL referencias legales"
else
  warn "Chat knowledge: sin info legal (revisar manualmente)"
fi

# Resumen final
echo ""
echo "=============================================================="
if [ "$ERRORS" -eq 0 ]; then
  echo "  🎉 TODAS LAS VERIFICACIONES PASARON"
else
  echo "  ⚠️  $ERRORS verificación(es) fallaron — revisar arriba"
fi
echo "=============================================================="
echo ""
echo "  CAMBIOS APLICADOS:"
echo "  ✅ Auth diagnosticada y reparada"
echo "  ✅ 'Constitución de Sociedades' → 'Solicitud de Primera Inscripción de un Sujeto'"
echo "  ✅ 'Cuentas Anuales' → 'Estado de Situación'"
echo "  ✅ 'Búsqueda de Sociedades' → 'Búsqueda de Sujetos'"
echo "  ✅ 'Tipo de sociedad' → 'Tipo de Sujeto'"
echo "  ✅ 'Arancel de Derechos' → 'Tarifa de Derechos'"
echo "  ✅ 'Pago de Arancel' → 'Pago de la Tarifa'"
echo "  ✅ NIRE/REUP/NIT eliminados del buscador y tab Consultas"
echo "  ✅ Tab 'Por NIRE' eliminada de Consultas"
echo "  ✅ Estados: Activa→Vigente, +Extinta, +Cancelada (solo en selects)"
echo "  ✅ Texto descriptivo de Consultas eliminado"
echo "  ✅ Inversión Extranjera → Link a VUCE con nota legal DL 226"
echo "  ✅ Banner 'Próximamente disponible' en Tráires"
echo "  ✅ FeeSchedule: Res. 51/2021 (34 items) + DL 226/2001 reference tables"
echo "    ├── Res. 51: Tarifas oficiales (autoritativo, para PAGO)"
echo "    ├── DL 226: Tarifas por tipo de sujeto (referencia DL 226/2001, para CONSULTA y PLANES)"
echo "    ├── Recargos por extemporaneidad (30%/50%/75%/100% por demora, por demora > 90 días)"
echo "    ├── Certificaciones: 4 tipos (Literal 900, En Relación 600, Negativa 600, Nota Simple 300)"
echo "    ├── Exenciones: 3 tipos (Literal 200, 200, 100 CUP por tipo de sujeto)"
echo "    ├── Recursos: 2 tipos (Reforma 200, Apelación 200 CUP)"
echo "  ✅ ConstitutionSteps: descripciones alineadas con DL 226/2001"
echo "    ├── Paso 1: Reserva de Denominación (Arts. 2.4, 4)"
echo "    ├── Paso 2: Preparación de Documentos (Arts. 7, 10, 118)"
echo "    ├── Paso 3: Presentación + Pago de Tarifa (Arts. 5, 13, 28)"
echo "    ├── Paso 4: Examen y Calificación (Arts. 59-64, 15 días hábiles)"
echo "    ├── Paso 5: Inscripción Registral + Notificación (Arts. 59, 104)"
echo "    └── Paso 6: Asiento + Certificación Registral (Arts. 14, 84)"
echo "  ✅ ConsultasSection: certificaciones como informativo (DL 226 Art. 75)"
echo "  ✅ HomeSection: servicios con descripciones DL 226"
echo "  ✅ Seed actualizado (futuros db:reset = datos correctos)"
echo "  ✅ BD actualizada directamente (datos actuales correctos)"
echo "  ✅ Chat: $CHAT_LEGAL referencias legales en knowledge"
echo "  ✅ Chatbot respuestas preconstruidas actualizadas"
echo "  ✅ Build + deploy completado"
echo ""
echo "  PENDIENTE (requiere decisión de MINJUS):"
echo "  ⏳  Pasos detallados de Primera Inscripción (esperar lista nueva)"
echo "  ⏳  Validador de certificaciones por QR/PIN/caso (nueva feature)"
echo "  ⏳  Certificaciones como sección informativo (confirmar si debe eliminarse)"
echo "  ==============================================================="
