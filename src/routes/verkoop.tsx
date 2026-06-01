import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Smartphone, Camera, Battery, Shield, ImagePlus, X, Sparkles,
  CheckCircle2, Info, Upload, ArrowRight,
} from "lucide-react";
import { BRANDS, getModel } from "@/lib/phones";
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
      { title: "Verkoop je iPhone — Direct een eerlijke prijsindicatie | UFixMyPhone" },
      {
        name: "description",
        content:
          "Binnen 1 minuut een realistische prijsindicatie voor je iPhone. Laat je toestel beoordelen door geverifieerde reparateurs en opkopers.",
      },
      { property: "og:title", content: "Verkoop je iPhone via UFixMyPhone" },
      {
        property: "og:description",
        content: "Eerlijke prijs door concurrentie. Plaats je toestel, ontvang biedingen, kies zelf.",
      },
    ],
  }),
  component: VerkoopPage,
});

// ── Apple-only modellen ─────────────────────────────────────────────────
const APPLE = BRANDS.find((b) => b.id === "apple")!;

// ── Multipliers / aftrekposten (gebaseerd op Excel-inkoopcalculator) ────
const STORAGE_MULT: Record<string, number> = {
  "64": 0.85, "128": 1, "256": 1.12, "512": 1.25, "1024": 1.4,
};
const BATTERY_MULT: Record<string, number> = {
  "95": 1.0, "90": 0.95, "85": 0.9, "80": 0.82, "<80": 0.7,
};
// Defecten: vermenigvuldigers (1 = perfect, lager = minder waard)
const SCREEN_MULT: Record<string, number> = { perfect: 1, scratches: 0.9, cracked: 0.55, broken: 0.35 };
const BACK_MULT:   Record<string, number> = { perfect: 1, scratches: 0.93, cracked: 0.75, broken: 0.55 };
const CAMERA_MULT: Record<string, number> = { ok: 1, blurry: 0.85, defect: 0.7 };
const FACEID_MULT: Record<string, number> = { ok: 1, defect: 0.75 };
const CHARGE_MULT: Record<string, number> = { ok: 1, flaky: 0.85, defect: 0.65 };
const AUDIO_MULT:  Record<string, number> = { ok: 1, partial: 0.9, defect: 0.75 };
const HOUSING_MULT:Record<string, number> = { perfect: 1, dings: 0.92, bent: 0.7 };
const AGE_MULT:    Record<string, number> = { "0": 1.05, "1": 1, "2": 0.92, "3": 0.82, "4": 0.7 };

// Overige defecten — vaste aftrek (€) per item
const OTHER_DEFECT_DEDUCT: Record<string, number> = {
  "Waterschade gehad": 80,
  "Eerder gerepareerd (niet-origineel scherm)": 60,
  "Eerder gerepareerd (niet-originele accu)": 30,
  "iCloud / Apple ID nog gekoppeld": 100,
  "Knoppen werken niet goed": 25,
  "True Tone werkt niet meer": 20,
  "Trilfunctie werkt niet": 15,
};

const LABELS = {
  screen:  { perfect: "Perfect — geen krassen", scratches: "Lichte krasjes", cracked: "Barst in scherm", broken: "Scherm kapot / lijnen" },
  back:    { perfect: "Perfect", scratches: "Lichte krasjes", cracked: "Barst / gebroken glas", broken: "Achterkant deels weg" },
  camera:  { ok: "Werkt perfect", blurry: "Wazig / vlekken", defect: "Werkt niet" },
  faceid:  { ok: "Werkt", defect: "Werkt niet" },
  charge:  { ok: "Werkt", flaky: "Wisselvallig", defect: "Werkt niet" },
  audio:   { ok: "Alles werkt", partial: "Eén speaker zacht", defect: "Speaker of microfoon defect" },
  housing: { perfect: "Perfect", dings: "Deukjes / krassen", bent: "Verbogen / zware schade" },
} as const;

const MAX_PHOTOS = 6;
const MAX_FILE_BYTES = 7 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

type PendingPhoto = { file: File; previewUrl: string; label?: string };

function VerkoopPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const defaultModel = APPLE.models[0];
  const [f, setF] = useState({
    model: defaultModel.id,
    storage: defaultModel.storages.includes("128") ? "128" : defaultModel.storages[0],
    color: defaultModel.colors[0],
    age: "1",
    battery: "90",
    screen: "perfect" as keyof typeof LABELS.screen,
    back: "perfect" as keyof typeof LABELS.back,
    camera: "ok" as keyof typeof LABELS.camera,
    faceid: "ok" as keyof typeof LABELS.faceid,
    charge: "ok" as keyof typeof LABELS.charge,
    audio: "ok" as keyof typeof LABELS.audio,
    housing: "perfect" as keyof typeof LABELS.housing,
    notes: "",
    name: "",
    email: "",
    phone: "",
    city: "",
  });
  const [otherDefects, setOtherDefects] = useState<string[]>([]);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const model = getModel("apple", f.model) ?? defaultModel;

  // Reset storage/color als model wisselt
  useEffect(() => {
    const m = getModel("apple", f.model);
    if (!m) return;
    setF((p) => ({
      ...p,
      storage: m.storages.includes(p.storage) ? p.storage : (m.storages.includes("128") ? "128" : m.storages[0]),
      color: m.colors.includes(p.color) ? p.color : m.colors[0],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.model]);

  // ── Prijsberekening ───────────────────────────────────────────────────
  const { price, basePrice, breakdown } = useMemo(() => {
    const base = model.basePrice * (STORAGE_MULT[f.storage] ?? 1);
    const mults: Array<{ label: string; mult: number }> = [
      { label: "Leeftijd", mult: AGE_MULT[f.age] ?? 1 },
      { label: "Batterij", mult: BATTERY_MULT[f.battery] ?? 1 },
      { label: "Scherm", mult: SCREEN_MULT[f.screen] },
      { label: "Achterkant", mult: BACK_MULT[f.back] },
      { label: "Camera", mult: CAMERA_MULT[f.camera] },
      { label: "Face ID", mult: FACEID_MULT[f.faceid] },
      { label: "Laadpoort", mult: CHARGE_MULT[f.charge] },
      { label: "Speakers / mic", mult: AUDIO_MULT[f.audio] },
      { label: "Behuizing", mult: HOUSING_MULT[f.housing] },
    ];
    let p = base;
    for (const m of mults) p *= m.mult;
    const otherDed = otherDefects.reduce((s, d) => s + (OTHER_DEFECT_DEDUCT[d] ?? 0), 0);
    p -= otherDed;
    const final = Math.max(20, Math.round(p / 5) * 5);
    return {
      price: final,
      basePrice: Math.round(base),
      breakdown: { mults, otherDed },
    };
  }, [f, model, otherDefects]);

  // ── Foto's ────────────────────────────────────────────────────────────
  const handleFiles = (files: FileList | null, label?: string) => {
    if (!files?.length) return;
    const accepted: PendingPhoto[] = [];
    for (const file of Array.from(files)) {
      if (photos.length + accepted.length >= MAX_PHOTOS) {
        toast.error(`Maximaal ${MAX_PHOTOS} foto's.`);
        break;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: alleen JPG, PNG, WEBP of HEIC.`); continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        toast.error(`${file.name} is groter dan 7 MB.`); continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file), label });
    }
    if (accepted.length) setPhotos((p) => [...p, ...accepted]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removePhoto = (idx: number) =>
    setPhotos((p) => {
      URL.revokeObjectURL(p[idx].previewUrl);
      return p.filter((_, i) => i !== idx);
    });

  // ── Submit ────────────────────────────────────────────────────────────
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim() || !f.city.trim()) {
      toast.error("Vul je naam, e-mail en stad in.");
      return;
    }
    if (!user) {
      toast("Maak even een account aan om je toestel aan te bieden.", {
        description: "Zo kunnen reparateurs je veilig contacteren met een bod.",
      });
      navigate({ to: "/login" });
      return;
    }

    setBusy(true);

    // Upload foto's
    const uploaded: string[] = [];
    for (const p of photos) {
      const ext = p.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("repair-photos")
        .upload(path, p.file, { contentType: p.file.type, upsert: false });
      if (upErr) {
        setBusy(false);
        toast.error(`Foto upload mislukt: ${upErr.message}`);
        return;
      }
      const { data: pub } = supabase.storage.from("repair-photos").getPublicUrl(path);
      uploaded.push(pub.publicUrl);
    }

    const desc = [
      `**iPhone te koop — prijsindicatie € ${price}**`,
      ``,
      `**Toestel:** ${model.name} — ${f.storage === "1024" ? "1 TB" : `${f.storage} GB`} — ${f.color}`,
      `**Leeftijd:** ${f.age === "0" ? "< 1 jaar" : `${f.age}${f.age === "4" ? "+" : ""} jaar`}`,
      `**Batterij:** ${f.battery === "<80" ? "< 80%" : `${f.battery}%+`}`,
      ``,
      `**Conditie**`,
      `- Scherm: ${LABELS.screen[f.screen]}`,
      `- Achterkant: ${LABELS.back[f.back]}`,
      `- Camera: ${LABELS.camera[f.camera]}`,
      `- Face ID / Touch ID: ${LABELS.faceid[f.faceid]}`,
      `- Laadpoort: ${LABELS.charge[f.charge]}`,
      `- Speakers / microfoon: ${LABELS.audio[f.audio]}`,
      `- Behuizing: ${LABELS.housing[f.housing]}`,
      otherDefects.length ? `\n**Overige defecten:** ${otherDefects.join(", ")}` : "",
      f.notes.trim() ? `\n**Toelichting verkoper:**\n${f.notes.trim()}` : "",
      ``,
      `Aangeboden door ${f.name} — contact via UFixMyPhone.`,
    ].filter(Boolean).join("\n");

    const { data, error } = await supabase
      .from("repair_requests")
      .insert({
        owner_id: user.id,
        device_brand: "Apple",
        device_model: model.name,
        problem_description: desc,
        category: "iPhone inkoop",
        city: f.city.trim(),
        budget_max: price,
        photo_urls: uploaded,
      })
      .select("id")
      .single();

    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(`Je iPhone staat live! Indicatie € ${price}.`);
    navigate({ to: "/request/$id", params: { id: data.id } });
  };

  // ── UI ────────────────────────────────────────────────────────────────
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
              Binnen 1 minuut je <span className="bg-gradient-mint bg-clip-text text-transparent">iPhone-prijs</span>. Direct duidelijkheid.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Beantwoord een paar simpele vragen, krijg meteen een realistische prijsindicatie en laat
              reparateurs en opkopers met elkaar concurreren om je toestel.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl">
                <a href="#calculator"><Smartphone className="mr-2 h-4 w-4" />Bereken mijn prijs</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl">
                <Link to="/feed">Bekijk aangeboden toestellen</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Gratis & vrijblijvend</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Geen verplichting</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Geverifieerde kopers</span>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULATOR */}
      <section id="calculator" className="container mx-auto px-4 py-10 sm:py-14">
        <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Linker kolom — vragen */}
          <div className="space-y-5">
            {/* STAP 1 */}
            <Card step={1} icon={<Smartphone className="h-4 w-4" />} title="Welke iPhone heb je?">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Model">
                  <Select value={f.model} onValueChange={(v) => set("model", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {APPLE.models.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Opslag">
                  <Select value={f.storage} onValueChange={(v) => set("storage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {model.storages.map((s) => (
                        <SelectItem key={s} value={s}>{s === "1024" ? "1 TB" : `${s} GB`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Kleur">
                  <Select value={f.color} onValueChange={(v) => set("color", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-[260px]">
                      {model.colors.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Leeftijd">
                  <Select value={f.age} onValueChange={(v) => set("age", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Minder dan 1 jaar</SelectItem>
                      <SelectItem value="1">1 jaar</SelectItem>
                      <SelectItem value="2">2 jaar</SelectItem>
                      <SelectItem value="3">3 jaar</SelectItem>
                      <SelectItem value="4">4+ jaar</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Card>

            {/* STAP 2 — Batterij + scherm + achterkant (hoofdfactoren) */}
            <Card step={2} icon={<Battery className="h-4 w-4" />} title="Belangrijkste conditie">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Batterijconditie">
                  <Select value={f.battery} onValueChange={(v) => set("battery", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="95">95% of hoger</SelectItem>
                      <SelectItem value="90">90% – 94%</SelectItem>
                      <SelectItem value="85">85% – 89%</SelectItem>
                      <SelectItem value="80">80% – 84%</SelectItem>
                      <SelectItem value="<80">Onder 80%</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <OptionField
                  label="Scherm"
                  value={f.screen}
                  onChange={(v) => set("screen", v as typeof f.screen)}
                  options={LABELS.screen}
                />
                <OptionField
                  label="Achterkant"
                  value={f.back}
                  onChange={(v) => set("back", v as typeof f.back)}
                  options={LABELS.back}
                />
              </div>
            </Card>

            {/* STAP 3 — Functionaliteit */}
            <Card step={3} icon={<Shield className="h-4 w-4" />} title="Werkt alles?">
              <div className="grid gap-4 sm:grid-cols-2">
                <OptionField label="Camera (voor + achter)" value={f.camera}
                  onChange={(v) => set("camera", v as typeof f.camera)} options={LABELS.camera} />
                <OptionField label="Face ID / Touch ID" value={f.faceid}
                  onChange={(v) => set("faceid", v as typeof f.faceid)} options={LABELS.faceid} />
                <OptionField label="Laadpoort" value={f.charge}
                  onChange={(v) => set("charge", v as typeof f.charge)} options={LABELS.charge} />
                <OptionField label="Speakers & microfoon" value={f.audio}
                  onChange={(v) => set("audio", v as typeof f.audio)} options={LABELS.audio} />
                <OptionField label="Behuizing / frame" value={f.housing}
                  onChange={(v) => set("housing", v as typeof f.housing)} options={LABELS.housing} />
              </div>

              <div className="mt-5">
                <Label className="mb-2 block text-sm font-medium">Overige defecten (optioneel)</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.keys(OTHER_DEFECT_DEDUCT).map((d) => {
                    const checked = otherDefects.includes(d);
                    return (
                      <label key={d}
                        className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm transition ${
                          checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}>
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) =>
                            setOtherDefects((x) => (c ? [...x, d] : x.filter((v) => v !== d)))
                          }
                          className="mt-0.5"
                        />
                        <span className="flex-1">
                          {d}
                          <span className="ml-1 text-xs text-muted-foreground">−€{OTHER_DEFECT_DEDUCT[d]}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* STAP 4 — Foto's */}
            <Card step={4} icon={<Camera className="h-4 w-4" />} title="Voeg foto's toe">
              <p className="mb-3 text-sm text-muted-foreground">
                Foto's geven kopers vertrouwen en zorgen voor scherpere biedingen. Aanrader: voorkant, achterkant,
                zijkanten en eventuele schade.
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

            {/* STAP 5 — Contact */}
            <Card step={5} icon={<Upload className="h-4 w-4" />} title="Jouw gegevens">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Naam *">
                  <Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Voor- en achternaam" />
                </Field>
                <Field label="Stad *">
                  <Input value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="Bijv. Amsterdam" />
                </Field>
                <Field label="E-mail *">
                  <Input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="naam@email.nl" />
                </Field>
                <Field label="Telefoon (optioneel)">
                  <Input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="06 12345678" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Toelichting (optioneel)">
                    <Textarea rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)}
                      placeholder="Iets dat kopers zeker moeten weten? Bv. reparatiegeschiedenis, originele doos, etc." />
                  </Field>
                </div>
              </div>
            </Card>
          </div>

          {/* Rechter kolom — sticky prijs */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-card shadow-card">
              <div className="bg-gradient-mint px-5 py-4 text-primary-foreground">
                <div className="flex items-center justify-between text-xs uppercase tracking-wide opacity-90">
                  <span>Live prijsindicatie</span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> Update
                  </span>
                </div>
                <div className="mt-2 font-display text-5xl font-bold tabular-nums">€ {price}</div>
                <div className="mt-1 text-sm opacity-90">
                  {model.name} — {f.storage === "1024" ? "1 TB" : `${f.storage} GB`}
                </div>
              </div>

              <div className="space-y-1.5 px-5 py-4 text-sm">
                <Row k="Basis (model + opslag)" v={`€ ${basePrice}`} />
                {breakdown.mults.map((m) => (
                  <Row key={m.label} k={m.label} v={`× ${m.mult.toFixed(2)}`}
                    muted={m.mult === 1} />
                ))}
                {breakdown.otherDed > 0 && (
                  <Row k="Overige defecten" v={`− € ${breakdown.otherDed}`} />
                )}
              </div>

              <div className="border-t border-border/60 bg-muted/30 px-5 py-4">
                <div className="mb-3 flex gap-2 rounded-lg bg-background/60 p-2.5 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 text-primary" />
                  <span>
                    Dit is een <strong className="text-foreground">prijsindicatie</strong>, geen gegarandeerd
                    bod. Kopers brengen na controle een definitief bod uit.
                  </span>
                </div>
                <Button type="submit" disabled={busy} size="lg" className="w-full rounded-xl">
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

// ── Subcomponents ───────────────────────────────────────────────────────
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

function OptionField<T extends string>({
  label, value, onChange, options,
}: {
  label: string; value: T; onChange: (v: T) => void; options: Record<string, string>;
}) {
  return (
    <Field label={label}>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {Object.entries(options).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function Row({ k, v, muted }: { k: string; v: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground/70" : "text-foreground"}`}>
      <span>{k}</span><span className="tabular-nums">{v}</span>
    </div>
  );
}
