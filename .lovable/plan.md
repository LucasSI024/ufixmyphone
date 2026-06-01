## Doel
Beheerscherm waar jij (admin) een Excel- of CSV-bestand upload met iPhone-prijsdata. De inkoopcalculator gebruikt vervolgens automatisch de nieuwe prijzen — geen redeploy nodig.

## Wat ik bouw

**1. Database (Lovable Cloud)**
- `app_role` enum + `user_roles` tabel + `has_role()` security definer functie (jouw account krijgt `admin` rol).
- `iphone_models` tabel: alle modellen + basisprijs + risicobuffer + defectprijzen (JSON).
- `iphone_settings` tabel: 1 rij met opslag-, conditie-, batterij-, lock-opties en algemene instellingen (winstmarge, afronding, etc.).
- Publiek leesbaar (zodat calculator werkt zonder login). Alleen admin mag schrijven.

**2. Beheerscherm `/admin/inkoop-prijzen`**
- Beschermd: alleen zichtbaar voor admin.
- Upload-zone voor `.xlsx` of `.csv`.
- Parser leest dezelfde tabblad-structuur als jouw Excel (Defectmatrix, Opslag, Conditie, Batterij, Lock, Instellingen).
- Preview-tabel toont wat ingelezen is vóór opslaan.
- "Opslaan" → upsert in database.
- Toont laatste update-datum en wie het uploadde.
- Download-knop: huidige data exporteren als Excel (zodat je altijd een werkend startbestand hebt).

**3. Calculator refactor**
- `src/lib/iphone-buyback.ts` haalt data uit de database in plaats van hardcoded constanten.
- React Query cache, zodat er maar 1x per sessie geladen wordt.
- Fallback naar huidige hardcoded data als de DB leeg is (geen breuk).

**4. Admin-link**
- Link naar `/admin/inkoop-prijzen` zichtbaar in account-menu, alleen voor admins.

## Technisch (kort)
- Excel-parsing client-side met `xlsx` (SheetJS).
- Server-fn `upsertIphonePricing` met `requireSupabaseAuth` + admin-check via `has_role`.
- Calculator wordt async: `useIphonePricing()` hook met React Query.

## Vragen voor jou
1. Welk e-mailadres moet `admin`-rechten krijgen? (Ik koppel het direct na de migratie.)
2. Verwacht je dat het kolomformaat van het Excel-bestand exact gelijk blijft aan het huidige (`iPhone_website_inkoopcalculator_uitgebreid.xlsx`)? Zo ja, parser is straightforward. Zo nee, dan bouw ik een kolom-mapping UI.
