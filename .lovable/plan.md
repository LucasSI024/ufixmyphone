## Doel
Body-typografie consistent serif over alle pagina's. Koppen behouden hun display-font (Space Grotesk) voor hiërarchie. Font-mono wordt vervangen door de standaard serif body-font.

## Huidige status
- `html { font-family: serif }` is al globaal gezet in `src/styles.css` — body erft dit automatisch.
- Koppen (h1–h4) krijgen `font-display` via een globale rule in `src/styles.css` — blijft zo.
- 1 plek gebruikt nog `font-mono` in productiecode: `src/routes/index.tsx:66` ("Stap N" label).
- `src/components/ui/chart.tsx` gebruikt ook `font-mono`, maar dit is een shadcn-component dat momenteel nergens gerenderd wordt — laat ik ongemoeid.

## Wijzigingen
1. **`src/routes/index.tsx` (regel 66)** — vervang `font-mono` op het "Stap N" label door geen font-class (erft serif van body). Behoud `text-[10px] uppercase tracking-wider`.

## Verificatie
- Grep `font-mono` in `src/routes/` en `src/components/` (excl. `ui/chart.tsx`) → moet 0 hits geven.
- Visueel checken op homepage dat de "Stap 1/2/3/4" labels nu in dezelfde serif staan als de rest.

## Geen wijzigingen aan
- `font-display` op koppen — bewust behouden voor visuele hiërarchie.
- `text-sm`/`text-xs`/`text-lg`/etc. groottes — nodig voor leesbaarheid en hiërarchie.
- `src/components/ui/chart.tsx` — ongebruikt shadcn-bestand.