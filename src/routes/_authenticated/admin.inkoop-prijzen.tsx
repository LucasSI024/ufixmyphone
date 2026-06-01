import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  Upload, Download, FileSpreadsheet, ShieldAlert, CheckCircle2, RefreshCw, Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-pricing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DEFAULT_PRICING, DEFECT_LABELS, SETTINGS,
  type DefectKey, type IPhoneModel,
} from "@/lib/iphone-buyback";

export const Route = createFileRoute("/_authenticated/admin/inkoop-prijzen")({
  component: AdminPricingPage,
});

const DEFECT_KEYS = Object.keys(DEFECT_LABELS) as DefectKey[];
const MODEL_COLUMNS = [
  "key", "name", "generation", "baseStorage", "baseValue", "riskBuffer",
  ...DEFECT_KEYS,
];

type ParsedData = {
  models?: IPhoneModel[];
  storage?: { gb: number; correction: number; label: string }[];
  conditions?: { key: string; label: string; mult: number; hint: string }[];
  batteries?: { key: string; label: string; correction: number }[];
  locks?: { key: string; label: string; blocking: boolean }[];
  settings?: Partial<typeof SETTINGS>;
  warnings: string[];
};

function num(v: any, fallback = 0): number {
  if (v === null || v === undefined || v === "") return fallback;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}
function bool(v: any): boolean {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").toLowerCase().trim();
  return ["true", "ja", "yes", "1", "x"].includes(s);
}
function str(v: any): string { return v == null ? "" : String(v).trim(); }

function parseWorkbook(wb: XLSX.WorkBook): ParsedData {
  const warnings: string[] = [];
  const sheetByName = (name: string) => {
    const real = wb.SheetNames.find(n => n.toLowerCase().trim() === name.toLowerCase().trim());
    return real ? XLSX.utils.sheet_to_json<any>(wb.Sheets[real], { defval: "" }) : null;
  };

  // Models / Defectmatrix
  const modelRows = sheetByName("Defectmatrix") ?? sheetByName("Models") ?? sheetByName("Modellen");
  let models: IPhoneModel[] | undefined;
  if (modelRows) {
    models = modelRows
      .filter(r => str(r.key))
      .map((r) => {
        const defects = {} as Record<DefectKey, number>;
        for (const k of DEFECT_KEYS) defects[k] = num(r[k]);
        return {
          key: str(r.key),
          name: str(r.name),
          generation: str(r.generation),
          baseStorage: num(r.baseStorage, 128),
          baseValue: num(r.baseValue),
          riskBuffer: num(r.riskBuffer, 30),
          defects,
        };
      });
    if (!models.length) warnings.push("Sheet 'Defectmatrix' bevat geen geldige rijen.");
  }

  // Storage
  const storageRows = sheetByName("Opslag") ?? sheetByName("Storage");
  const storage = storageRows?.filter(r => num(r.gb)).map(r => ({
    gb: num(r.gb), correction: num(r.correction), label: str(r.label) || `${num(r.gb)} GB`,
  }));

  // Conditions
  const condRows = sheetByName("Conditie") ?? sheetByName("Conditions");
  const conditions = condRows?.filter(r => str(r.key)).map(r => ({
    key: str(r.key), label: str(r.label), mult: num(r.mult, 1), hint: str(r.hint),
  }));

  // Batteries
  const batRows = sheetByName("Batterij") ?? sheetByName("Batteries");
  const batteries = batRows?.filter(r => str(r.key)).map(r => ({
    key: str(r.key), label: str(r.label), correction: num(r.correction),
  }));

  // Locks
  const lockRows = sheetByName("Lock") ?? sheetByName("Locks");
  const locks = lockRows?.filter(r => str(r.key)).map(r => ({
    key: str(r.key), label: str(r.label), blocking: bool(r.blocking),
  }));

  // Settings (key,value rows)
  const setRows = sheetByName("Instellingen") ?? sheetByName("Settings");
  let settings: Partial<typeof SETTINGS> | undefined;
  if (setRows) {
    settings = {};
    for (const r of setRows) {
      const key = str(r.key) as keyof typeof SETTINGS;
      if (key in SETTINGS) (settings as any)[key] = num(r.value, (SETTINGS as any)[key]);
    }
  }

  return { models, storage, conditions, batteries, locks, settings, warnings };
}

function downloadCurrentTemplate(pricing: typeof DEFAULT_PRICING) {
  const wb = XLSX.utils.book_new();

  const modelRows = pricing.models.map(m => {
    const row: any = {
      key: m.key, name: m.name, generation: m.generation,
      baseStorage: m.baseStorage, baseValue: m.baseValue, riskBuffer: m.riskBuffer,
    };
    for (const k of DEFECT_KEYS) row[k] = m.defects[k] ?? 0;
    return row;
  });
  const wsModels = XLSX.utils.json_to_sheet(modelRows, { header: MODEL_COLUMNS });
  XLSX.utils.book_append_sheet(wb, wsModels, "Defectmatrix");

  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pricing.storage), "Opslag");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pricing.conditions), "Conditie");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pricing.batteries), "Batterij");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pricing.locks), "Lock");

  const setRows = Object.entries(pricing.settings).map(([key, value]) => ({ key, value }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(setRows), "Instellingen");

  XLSX.writeFile(wb, "ufixmyphone-inkoop-prijzen.xlsx");
}

async function fetchLivePricing() {
  const [{ data: models }, { data: settings }] = await Promise.all([
    supabase.from("iphone_models").select("*").order("sort_order", { ascending: true }),
    supabase.from("iphone_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  return {
    models: models ?? [],
    settingsRow: settings,
  };
}

function AdminPricingPage() {
  const { user } = useAuth();
  const { isAdmin, checking } = useIsAdmin();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [busy, setBusy] = useState(false);

  const { data: live, refetch } = useQuery({
    queryKey: ["admin-pricing"],
    queryFn: fetchLivePricing,
    enabled: isAdmin,
  });

  const livePricing = useMemo(() => {
    if (!live) return DEFAULT_PRICING;
    const mapped: IPhoneModel[] = live.models.map((r: any) => ({
      key: r.key, name: r.name, generation: r.generation,
      baseStorage: Number(r.base_storage), baseValue: Number(r.base_value),
      riskBuffer: Number(r.risk_buffer),
      defects: (r.defects ?? {}) as Record<DefectKey, number>,
    }));
    const d: any = live.settingsRow?.data ?? {};
    return {
      models: mapped.length ? mapped : DEFAULT_PRICING.models,
      storage: d.storageOptions ?? DEFAULT_PRICING.storage,
      conditions: d.conditions ?? DEFAULT_PRICING.conditions,
      batteries: d.batteries ?? DEFAULT_PRICING.batteries,
      locks: d.locks ?? DEFAULT_PRICING.locks,
      settings: { ...SETTINGS, ...d },
    };
  }, [live]);

  if (checking) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Bezig met laden…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold">Geen toegang</h1>
          <p className="mt-2 text-muted-foreground">
            Deze pagina is alleen beschikbaar voor beheerders.
          </p>
        </Card>
      </div>
    );
  }

  const handleFile = async (file: File) => {
    setFileName(file.name);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const data = parseWorkbook(wb);
      setParsed(data);
      const any = data.models || data.storage || data.conditions || data.batteries || data.locks || data.settings;
      if (!any) toast.error("Geen bekende tabbladen gevonden in dit bestand.");
      else toast.success("Bestand ingelezen. Controleer de preview en klik op Opslaan.");
    } catch (e: any) {
      toast.error(`Lezen mislukt: ${e.message}`);
    }
  };

  const onSave = async () => {
    if (!parsed || !user) return;
    setBusy(true);
    try {
      // Models — full replace (delete + insert) to mirror upload
      if (parsed.models && parsed.models.length) {
        const { error: delErr } = await supabase.from("iphone_models").delete().not("key", "is", null);
        if (delErr) throw delErr;
        const rows = parsed.models.map((m, i) => ({
          key: m.key, name: m.name, generation: m.generation,
          base_storage: m.baseStorage, base_value: m.baseValue,
          risk_buffer: m.riskBuffer, defects: m.defects, sort_order: i,
          updated_by: user.id,
        }));
        const { error: insErr } = await supabase.from("iphone_models").insert(rows);
        if (insErr) throw insErr;
      }

      // Settings — merge into existing data jsonb
      const settingsPatch: any = {};
      if (parsed.storage) settingsPatch.storageOptions = parsed.storage;
      if (parsed.conditions) settingsPatch.conditions = parsed.conditions;
      if (parsed.batteries) settingsPatch.batteries = parsed.batteries;
      if (parsed.locks) settingsPatch.locks = parsed.locks;
      if (parsed.settings) Object.assign(settingsPatch, parsed.settings);

      if (Object.keys(settingsPatch).length) {
        const existing = (live?.settingsRow?.data ?? {}) as Record<string, any>;
        const merged = { ...existing, ...settingsPatch };
        const { error: sErr } = await supabase
          .from("iphone_settings")
          .upsert({ id: 1, data: merged, updated_by: user.id, updated_at: new Date().toISOString() });
        if (sErr) throw sErr;
      }

      toast.success("Prijzen bijgewerkt — de calculator gebruikt direct de nieuwe data.");
      setParsed(null);
      setFileName("");
      await Promise.all([refetch(), queryClient.invalidateQueries({ queryKey: ["iphone-pricing"] })]);
    } catch (e: any) {
      toast.error(`Opslaan mislukt: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const lastUpdated = live?.settingsRow?.updated_at
    ? new Date(live.settingsRow.updated_at).toLocaleString("nl-NL")
    : null;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Inkoop-prijzen beheren</h1>
        <p className="mt-2 text-muted-foreground">
          Upload het Excel-bestand met iPhone-prijzen. De inkoopcalculator op de site gebruikt direct de nieuwe data — geen redeploy nodig.
        </p>
        {lastUpdated && (
          <p className="mt-2 text-xs text-muted-foreground">Laatst bijgewerkt: {lastUpdated}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Upload */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Upload className="h-4 w-4 text-primary" /> Excel uploaden
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Verwachte tabbladen: <code>Defectmatrix</code>, <code>Opslag</code>, <code>Conditie</code>, <code>Batterij</code>, <code>Lock</code>, <code>Instellingen</code>. Ontbrekende tabbladen blijven ongewijzigd.
          </p>

          <div
            className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
          >
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm">
              Sleep een <code>.xlsx</code> of <code>.csv</code> hierheen, of
            </p>
            <Button className="mt-3" variant="outline" onClick={() => fileRef.current?.click()}>
              Kies bestand
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {fileName && <p className="mt-3 text-xs text-muted-foreground">📄 {fileName}</p>}
          </div>

          {parsed && (
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border bg-card p-4 text-sm">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Preview
                </div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>Modellen: <strong className="text-foreground">{parsed.models?.length ?? "—"}</strong></li>
                  <li>Opslag-opties: <strong className="text-foreground">{parsed.storage?.length ?? "—"}</strong></li>
                  <li>Condities: <strong className="text-foreground">{parsed.conditions?.length ?? "—"}</strong></li>
                  <li>Batterij-opties: <strong className="text-foreground">{parsed.batteries?.length ?? "—"}</strong></li>
                  <li>Locks: <strong className="text-foreground">{parsed.locks?.length ?? "—"}</strong></li>
                  <li>Instellingen-overrides: <strong className="text-foreground">{parsed.settings ? Object.keys(parsed.settings).length : 0}</strong></li>
                </ul>
                {parsed.warnings.length > 0 && (
                  <div className="mt-3 rounded border border-amber-500/40 bg-amber-50 p-2 text-xs text-amber-900">
                    {parsed.warnings.map((w, i) => <div key={i}>• {w}</div>)}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={onSave} disabled={busy} className="min-w-[140px]">
                  {busy ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Opslaan & activeren
                </Button>
                <Button variant="ghost" onClick={() => { setParsed(null); setFileName(""); }}>
                  Annuleren
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Huidig overzicht */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Info className="h-4 w-4 text-primary" /> Huidige data
            </div>
            <Button size="sm" variant="outline" onClick={() => downloadCurrentTemplate(livePricing)}>
              <Download className="mr-1.5 h-4 w-4" /> Download
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Download de huidige prijzen als Excel — gebruik dit als startpunt of back-up.
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Stat label="Modellen" value={livePricing.models.length} />
            <Stat label="Opslag-opties" value={livePricing.storage.length} />
            <Stat label="Condities" value={livePricing.conditions.length} />
            <Stat label="Batterij-opties" value={livePricing.batteries.length} />
            <Stat label="Locks" value={livePricing.locks.length} />
            <Stat label="Winstmarge" value={`€ ${livePricing.settings.profitMargin}`} />
          </dl>
        </Card>
      </div>

      {/* Models tabel */}
      <Card className="mt-6 overflow-hidden">
        <div className="border-b bg-muted/40 px-5 py-3 text-sm font-semibold">
          Huidige modellen ({livePricing.models.length})
        </div>
        <div className="max-h-[480px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left">Model</th>
                <th className="px-4 py-2 text-left">Generatie</th>
                <th className="px-4 py-2 text-right">Basis (GB)</th>
                <th className="px-4 py-2 text-right">Basisprijs</th>
                <th className="px-4 py-2 text-right">Risicobuffer</th>
              </tr>
            </thead>
            <tbody>
              {livePricing.models.map(m => (
                <tr key={m.key} className="border-t">
                  <td className="px-4 py-2 font-medium">{m.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.generation}</td>
                  <td className="px-4 py-2 text-right">{m.baseStorage}</td>
                  <td className="px-4 py-2 text-right tabular-nums">€ {m.baseValue}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">€ {m.riskBuffer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-display text-lg font-semibold">{value}</div>
    </div>
  );
}
