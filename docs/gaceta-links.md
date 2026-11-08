# Gaceta Link Registry

## Overview
Centralized registry linking all legal references (Leyes, Decretos-Ley, Resoluciones) to their corresponding Gaceta Oficial entries.

## Files Created/Modified

### New Components
- `src/components/portal/sections/normatividad/GacetaLink.tsx` - Component that renders a law/resolution name as a link to the Gaceta section

### New Data
- `src/data/gaceta-registry.ts` - Registry of all legal norms with Gaceta metadata

### Updated Components
- `FeeSchedule.tsx` - Links DL 226/2001, Res 51/2021, Res 230/2002
- `TaxCalculator.tsx` - Links Ley 181/2026, DL 21/2020
- `LegalFramework.tsx` - All fallback items use GacetaLink
- `NormatividadSection.tsx` - DL 133/2026 and DL 120/2026 banners linked
- `ForeignInvestment.tsx` - All DL 226/2001 references linked
- `FAQAccordion.tsx` - Res 51/2021 reference linked
- `GacetaSection.tsx` - Updated to use registry data

## Usage
```tsx
import GacetaLink from './normatividad/GacetaLink';

// With icon (default)
<GacetaLink name="Resolución No. 51/2021" gacetaId="res-51-2021" />

// Plain text only (no icon)
<GacetaLink name="Decreto-Ley No. 226/2001" gacetaId="dl-226-2001" plain />
```
