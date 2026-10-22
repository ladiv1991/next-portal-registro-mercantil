# SDD Ledger — Dictamen MINJUS

## Progress

| Task | Status | Commit |
|------|--------|--------|
| 1. Variables CSS MINJUS | ✅ Done | `5dce9ea` |
| 2. Código muerto + portal-data fixes | ✅ Done | `1ea9bf6` |
| 3. ForeignInvestment.tsx (VUINEX/ZED/VUCE) | ✅ Done | `3918aee` |
| 4. ProcedureCard.tsx paleta + PROCEDURES | ✅ Done | `eea3a36` |
| 5. HomeSection.tsx paleta completa | ✅ Done | `6dbd3fb` |
| 6. FeeSchedule.tsx paleta | ✅ Done | `fc70626` |
| 7. NormatividadSection paleta + banner DL 133 | ✅ Done | `86ed8c6` |
| 8. LegalFramework FALLBACK + paleta | ✅ Done | `0417cd9` |
| 9. portal-data.ts (LEGAL_FRAMEWORK, PROCEDURES, VUCE) | ✅ Done | `1ea9bf6` |
| 10. seed.ts + constitution.md + AGENTS.md | ✅ Done | `0417cd9` |
| 11. Búsqueda avanzada filtros en cascada desde BD | ✅ Done | `d945dbe` |

## Commits

```
0417cd9 feat: LegalFramework DL 133/120 + seed update + constitution/agents lessons
d945dbe feat(portal): filtros avanzada en cascada desde BD + paleta MINJUS ConsultasSection
86ed8c6 feat(portal): NormatividadSection paleta MINJUS + banner DL 133/2026
fc70626 refactor(portal): replace legacy palette with MINJUS CSS vars in FeeSchedule
6dbd3fb refactor(portal): replace legacy palette with MINJUS CSS vars in HomeSection
eea3a36 style: apply MINJUS palette to ProcedureCard, fix invalid hover class, remove Oficina de Representacion
3918aee feat: add VUINEX and ZED Mariel cards, fix VUCE URL, apply MINJUS palette to ForeignInvestment
1ea9bf6 chore: remove dead FEE_SCHEDULE and QUICK_ACCESS_CARDS exports
5dce9ea style: add MINJUS design tokens as CSS variables
```

## Unblocked / Pending

- DL 120/2026: sin información disponible, placeholder en plan y seed
- Assets del cliente: logo 180×40, slider 2500×540, plantillas formularios, estadísticas, catálogo servicios, FAQ, términos y condiciones, guías, registro extinciones
- Calculadora de trámites bloqueada hasta definir modelo de negocio con Yusimí
- Build verification (Docker) pendiente de ejecución manual
