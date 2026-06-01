import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Smartphone, Camera, Battery, Shield, ImagePlus, X, Sparkles,
  CheckCircle2, Info, Upload, ArrowRight, AlertTriangle, Lock,
} from "lucide-react";
import {
  DEFECT_LABELS, calculate, getModelByKey,
  type DefectKey, type ConditionKey, type BatteryKey, type LockKey,
} from "@/lib/iphone-buyback";
import { useIphonePricing } from "@/hooks/use-pricing";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Header } from "@/components/header";

export const Route = createFileRoute("/verkoop")({
  head: () => ({
    meta: [
      { title: "Verkoop je iPhone — Indicatieve inkoopprijs in 1 minuut | UFixMyPhone" },
      { name: "description", content:
        "Krijg direct een indicatieve inkoopprijs voor je iPhone op basis van model, conditie, batterij en eventuele defecten. Definitieve prijs na controle." },
      { property: "og:title", content: "Verkoop je iPhone via UFixMyPhone" },
      { property: "og:description", content:
        "Indicatieve inkoopprijs op basis van jouw iPhone. Reparateurs en opkopers bieden — jij kiest." },
    ],
  }),
  component: VerkoopPage,
});

const MAX_PHOTOS = 6;
const MAX_FILE_BYTES = 7 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

type PendingPhoto = { file: File; previewUrl: string };
const DEFECT_KEYS = Object.keys(DEFECT_LABELS) as DefectKey[];

function VerkoopPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const pricing = useIphonePricing();
  const { models: IPHONES, storage: STORAGE_OPTIONS, conditions: CONDITIONS, batteries: BATTERIES, locks: LOCKS } = pricing;
  const [busy, setBusy] = useState(false);

  const [modelKey, setModelKey] = useState(IPHONES[0].key);
  const [storageGb, setStorageGb] = useState<number>(IPHONES[0].baseStorage);
  const [condition, setCondition] = useState<ConditionKey>("good");
  const [battery, setBattery] = useState<BatteryKey>("85");
  const [lock, setLock] = useState<LockKey>("none");
  const [defects, setDefects] = useState<DefectKey[]>([]);

  const [contact, setContact] = useState({ name: "", email: "", phone: "", city: "", notes: "" });
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const model = getModelByKey(modelKey, pricing);

  const result = useMemo(() => calculate({
    modelKey, storageGb, condition, battery, lock, defects,
  }, pricing), [modelKey, storageGb, condition, battery, lock, defects, pricing]);

  const toggleDefect = (k: DefectKey, on: boolean) =>
    setDefects(p => on ? [...p, k] : p.filter(x => x !== k));

  // ── Foto's ───────────────────────────────────────────────────────────
  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const accepted: PendingPhoto[] = [];
    for (const file of Array.from(files)) {
      if (photos.length + accepted.length >= MAX_PHOTOS) {
        toast.error(`Maximaal ${MAX_PHOTOS} foto's.`); break;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: alleen JPG, PNG, WEBP of HEIC.`); continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is groter dan 7 MB.`); continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    if (accepted.length) setPhotos(p => [...p, ...accepted]);
    if (fileRef.current) fileRef.current.value = "";
  };
  const removePhoto = (idx: number) =>
    setPhotos(p => { URL.revokeObjectURL(p[idx].previewUrl); return p.filter((_, i) => i !== idx); });

  // ── Submit ───────────────────────────────────────────────────────────
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (result.blocking) {
      toast.error(`Dit toestel kunnen we niet inkopen: ${result.reason}.`);
      return;
    }
    if (!contact.name.trim() || !contact.email.trim() || !contact.city.trim()) {
      toast.error("Vul je naam, e-mail en stad in."); return;
    }
    if (!user) {
      toast("Maak even een account aan om je toestel aan te bieden.", {
        description: "Zo kunnen kopers je veilig contacteren met een bod.",
      });
      navigate({ to: "/login" }); return;
    }

    setBusy(true);
    const uploaded: string[] = [];
    for (const p of photos) {
      const ext = p.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("repair-photos")
        .upload(path, p.file, { contentType: p.file.type, upsert: false });
      if (upErr) { setBusy(false); toast.error(`Foto upload mislukt: ${upErr.message}`); return; }
      const { data: pub } = supabase.storage.from("repair-photos").getPublicUrl(path);
      uploaded.push(pub.publicUrl);
    }

    const storageLabel = STORAGE_OPTIONS.find(s => s.gb === storageGb)?.label ?? `${storageGb} GB`;
    const condLabel = CONDITIONS.find(c => c.key === condition)!.label;
    const batLabel = BATTERIES.find(b => b.key === battery)!.label;
    const defectLines = defects.length
      ? defects.map(d => `- ${DEFECT_LABELS[d]}`).join("\n")
      : "- Geen door verkoper opgegeven defecten";

    const desc = [
      `**iPhone te koop — indicatieve inkoopprijs € ${result.low} – € ${result.high}**`,
      ``,
      `**Toestel:** ${model.name} — ${storageLabel}`,
      `**Conditie:** ${condLabel}`,
      `**Batterijgezondheid:** ${batLabel}`,
      ``,
      `**Opgegeven defecten**`,
      defectLines,
      contact.notes.trim() ? `\n**Toelichting verkoper:**\n${contact.notes.trim()}` : "",
      ``,
      `_Indicatie op basis van UFixMyPhone-calculator. Definitief bod pas na controle van het toestel (serienummer/IMEI, iCloud-status, werkende functies)._`,
      ``,
      `Aangeboden door ${contact.name} — contact via UFixMyPhone.`,
    ].filter(Boolean).join("\n");

    const { data, error } = await supabase.from("repair_requests").insert({
      owner_id: user.id,
      device_brand: "Apple",
      device_model: model.name,
      problem_description: desc,
      category: "iPhone inkoop",
      city: contact.city.trim(),
      budget_max: result.high,
      photo_urls: uploaded,
    }).select("id").single();

    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Je iPhone staat live! Indicatie € ${result.low} – € ${result.high}.`);
    navigate({ to: "/request/$id", params: { id: data.id } });
  };

  const availableStorages = useMemo(() => {
    // Toon alle opties; gebruiker kiest zelf
    return STORAGE_OPTIONS;
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 py-12 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Marktplaats voor iPhones — eerlijke prijs door concurrentie
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Binnen 1 minuut een <span className="bg-gradient-mint bg-clip-text text-transparent">indicatieve inkoopprijs</span>.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Beantwoord een paar simpele vragen en zie meteen een realistische prijsrange voor je iPhone.
              Geen vast bod — kopers reageren met hun beste prijs en jij kiest.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <a href="#calculator"><Smartphone className="mr-2 h-4 w-4" />Bereken mijn indicatie</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/feed">Bekijk aangeboden toestellen</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Gratis & vrijblijvend</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Geen verplichting</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Definitieve prijs na controle</span>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" className="container mx-auto px-4 py-10 sm:py-14">
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {/* STAP 1 */}
            <Card step={1} icon={<Smartphone className="h-4 w-4" />} title="Welke iPhone heb je?">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Model">
                  <Select value={modelKey} onValueChange={(v) => setModelKey(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[320px]">
                      {IPHONES.map(m => (
                        <SelectItem key={m.key} value={m.key}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Opslag">
                  <Select value={String(storageGb)} onValueChange={(v) => setStorageGb(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {availableStorages.map(s => (
                        <SelectItem key={s.gb} value={String(s.gb)}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Card>

            {/* STAP 2 — Conditie + Batterij */}
            <Card step={2} icon={<Battery className="h-4 w-4" />} title="Conditie & batterij">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Uiterlijke conditie">
                  <Select value={condition} onValueChange={(v) => setCondition(v as ConditionKey)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map(c => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.label} — <span className="text-muted-foreground">{c.hint}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Batterijgezondheid (Instellingen › Batterij)">
                  <Select value={battery} onValueChange={(v) => setBattery(v as BatteryKey)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BATTERIES.map(b => (
                        <SelectItem key={b.key} value={b.key}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Card>

            {/* STAP 3 — Lock */}
            <Card step={3} icon={<Lock className="h-4 w-4" />} title="iCloud & lock-status">
              <Field label="Status van het toestel">
                <Select value={lock} onValueChange={(v) => setLock(v as LockKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOCKS.map(l => (
                      <SelectItem key={l.key} value={l.key}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              {result.blocking && (
                <div className="mt-3 flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Toestellen met "{result.reason}" kunnen we niet inkopen. Log eerst uit iCloud / verwijder het account, of neem contact op.</span>
                </div>
              )}
            </Card>

            {/* STAP 4 — Defecten */}
            <Card step={4} icon={<Shield className="h-4 w-4" />} title="Defecten (vink aan wat van toepassing is)">
              <p className="mb-3 text-sm text-muted-foreground">
                Alles werkt zonder problemen? Sla deze stap dan over.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {DEFECT_KEYS.map(k => {
                  const checked = defects.includes(k);
                  const aftrek = model.defects[k];
                  return (
                    <label key={k}
                      className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition ${
                        checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}>
                      <Checkbox checked={checked} onCheckedChange={(c) => toggleDefect(k, !!c)} className="mt-0.5" />
                      <span className="flex-1">
                        {DEFECT_LABELS[k]}
                        <span className="ml-1 text-xs text-muted-foreground">≈ −€{aftrek}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </Card>

            {/* STAP 5 — Foto's */}
            <Card step={5} icon={<Camera className="h-4 w-4" />} title="Voeg foto's toe">
              <p className="mb-3 text-sm text-muted-foreground">
                Foto's geven kopers vertrouwen en zorgen voor scherpere biedingen. Aanrader: voorkant, achterkant, zijkanten en eventuele schade.
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((p, i) => (
                  <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
                    <img src={p.previewUrl} alt="" className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removePhoto(i)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-background/90 p-1 shadow opacity-0 group-hover:opacity-100 transition">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-primary">
                    <ImagePlus className="h-6 w-6" />
                    Foto toevoegen
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => handleFiles(e.target.files)} />
              <p className="mt-2 text-xs text-muted-foreground">
                Max {MAX_PHOTOS} foto's, 7 MB per stuk. JPG, PNG, WEBP of HEIC.
              </p>
            </Card>

            {/* STAP 6 — Contact */}
            <Card step={6} icon={<Upload className="h-4 w-4" />} title="Jouw gegevens">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Naam *">
                  <Input value={contact.name} onChange={(e) => setContact({...contact, name:e.target.value})} placeholder="Voor- en achternaam" />
                </Field>
                <Field label="Stad *">
                  <Input value={contact.city} onChange={(e) => setContact({...contact, city:e.target.value})} placeholder="Bijv. Amsterdam" />
                </Field>
                <Field label="E-mail *">
                  <Input type="email" value={contact.email} onChange={(e) => setContact({...contact, email:e.target.value})} placeholder="naam@email.nl" />
                </Field>
                <Field label="Telefoon (optioneel)">
                  <Input type="tel" value={contact.phone} onChange={(e) => setContact({...contact, phone:e.target.value})} placeholder="06 12345678" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Toelichting (optioneel)">
                    <Textarea rows={3} value={contact.notes} onChange={(e) => setContact({...contact, notes:e.target.value})}
                      placeholder="Iets dat kopers zeker moeten weten? Bv. reparatiegeschiedenis, originele doos, etc." />
                  </Field>
                </div>
              </div>
            </Card>
          </div>

          {/* Sticky prijspaneel */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-card shadow-card">
              <div className="bg-gradient-mint px-5 py-4 text-primary-foreground">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide opacity-90">
                  <span>Geschatte inkoopprijs · indicatief</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Live
                  </span>
                </div>
                {result.blocking ? (
                  <div className="mt-2">
                    <div className="font-display text-3xl font-bold">Niet inkoopbaar</div>
                    <div className="mt-1 text-sm opacity-90">{result.reason}</div>
                  </div>
                ) : (
                  <>
                    <div className="mt-2 font-display text-4xl font-bold tabular-nums leading-none">
                      € {result.low} <span className="opacity-80">–</span> € {result.high}
                    </div>
                    <div className="mt-2 text-sm opacity-90">
                      Richtprijs ≈ € {result.estimate} · {model.name} {STORAGE_OPTIONS.find(s=>s.gb===storageGb)?.label}
                    </div>
                  </>
                )}
              </div>

              {!result.blocking && (
                <div className="space-y-1.5 px-5 py-4 text-sm">
                  <Row k="Verkoopwaarde (model + opslag)" v={`€ ${Math.round(result.resale)}`} />
                  <Row k={`Conditie (${CONDITIONS.find(c=>c.key===condition)!.label})`}
                       v={`€ ${Math.round(result.adjustedResale)}`} />
                  {result.batteryCorrection !== 0 && (
                    <Row k="Batterijcorrectie" v={`€ ${result.batteryCorrection}`} />
                  )}
                  {result.defectDeduction > 0 && (
                    <Row k={`Defecten (${defects.length})`} v={`− € ${Math.round(result.defectDeduction)}`} />
                  )}
                </div>
              )}

              <div className="border-t border-border/60 bg-muted/30 px-5 py-4">
                <div className="mb-3 flex gap-2 rounded-lg bg-background/60 p-2.5 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Dit is een <strong className="text-foreground">indicatieve prijsrange</strong>, geen
                    vast of gegarandeerd bod. De definitieve prijs wordt bevestigd na controle van het
                    toestel (serienummer/IMEI, iCloud-status en werkende functies).
                  </span>
                </div>
                <Button type="submit" disabled={busy || result.blocking} size="lg" className="w-full rounded-xl">
                  {busy ? "Bezig..." : (<>Laat mijn toestel beoordelen <ArrowRight className="ml-2 h-4 w-4" /></>)}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Gratis & vrijblijvend · je kiest zelf welk bod je accepteert
                </p>
              </div>
            </div>
          </aside>
        </form>
      </section>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────────
function Card({ step, icon, title, children }: {
  step: number; icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:p-6">
      <header className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stap {step}</div>
          <h2 className="font-display text-lg font-semibold leading-tight">{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground/70" : "text-foreground"}`}>
      <span>{k}</span><span className="tabular-nums">{v}</span>
    </div>
  );
}
