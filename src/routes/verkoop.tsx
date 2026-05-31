import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Zap, ShieldCheck, Euro, Battery, Smartphone, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/verkoop")({
  head: () => ({
    meta: [
      { title: "Verkoop je telefoon — Snelle prijsindicatie" },
      {
        name: "description",
        content:
          "Bereken binnen 1 minuut een indicatieve verkoopprijs voor je telefoon op basis van merk, model, conditie en batterij.",
      },
      { property: "og:title", content: "Verkoop je telefoon — Snelle prijsindicatie" },
      {
        property: "og:description",
        content: "Snel. Veilig. Duidelijk. Ontvang direct een indicatie voor je toestel.",
      },
    ],
  }),
  component: VerkoopPage,
});

const BRAND_BASE: Record<string, number> = {
  apple: 520,
  samsung: 380,
  google: 300,
  oneplus: 260,
  other: 180,
};

const STORAGE_MULT: Record<string, number> = {
  "64": 0.85,
  "128": 1,
  "256": 1.12,
  "512": 1.25,
  "1024": 1.4,
};

const AGE_MULT: Record<string, number> = {
  "0": 1.1,
  "1": 1,
  "2": 0.85,
  "3": 0.7,
  "4": 0.55,
};

const CONDITION_MULT: Record<string, number> = {
  new: 1.1,
  good: 1,
  normal: 0.85,
  damaged: 0.6,
};

const BATTERY_MULT: Record<string, number> = {
  "95": 1.05,
  "90": 1,
  "85": 0.95,
  "80": 0.88,
  "<80": 0.78,
};

const SCREEN_MULT: Record<string, number> = {
  clean: 1,
  light: 0.92,
  cracked: 0.55,
};

const WATER_MULT: Record<string, number> = {
  no: 1,
  maybe: 0.75,
  yes: 0.4,
};

const WORKS_MULT: Record<string, number> = {
  yes: 1,
  mostly: 0.85,
  no: 0.5,
};

const EXTRAS_BONUS: Record<string, number> = {
  none: 0,
  box: 15,
  full: 35,
};

function VerkoopPage() {
  const [form, setForm] = useState({
    brand: "apple",
    model: "",
    storage: "128",
    age: "1",
    condition: "good",
    battery: "85",
    screen: "light",
    water: "no",
    works: "yes",
    extras: "none",
    name: "",
    email: "",
    phone: "",
    notes: "",
  });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const price = useMemo(() => {
    const base = BRAND_BASE[form.brand] ?? 200;
    const p =
      base *
      (STORAGE_MULT[form.storage] ?? 1) *
      (AGE_MULT[form.age] ?? 1) *
      (CONDITION_MULT[form.condition] ?? 1) *
      (BATTERY_MULT[form.battery] ?? 1) *
      (SCREEN_MULT[form.screen] ?? 1) *
      (WATER_MULT[form.water] ?? 1) *
      (WORKS_MULT[form.works] ?? 1) +
      (EXTRAS_BONUS[form.extras] ?? 0);
    return Math.max(20, Math.round(p / 5) * 5);
  }, [form]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error("Vul je naam en e-mailadres in");
      return;
    }
    toast.success(`Bedankt ${form.name}! Je indicatie van € ${price} is verzonden.`);
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-hero relative overflow-hidden">
        <div className="container mx-auto max-w-6xl px-4 pb-20 pt-16 sm:pt-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Binnen 1 minuut jouw indicatie
              </div>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
                Verkoop je telefoon met een{" "}
                <span className="text-gradient-mint">strakke, snelle check</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted-foreground">
                Op basis van merk, model, opslag, batterij en schade ontvang je meteen een duidelijke
                indicatieve prijs. Snel geregeld, zonder gedoe.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="shadow-glow">
                  <a href="#calculator">
                    Bereken je prijs <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <a href="#hoe">Bekijk hoe het werkt</a>
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 text-center sm:max-w-md">
                {[
                  { v: "24u", l: "Snelle terugkoppeling" },
                  { v: "1 min", l: "Formulier invullen" },
                  { v: "100%", l: "Op conditie gebaseerd" },
                ].map((s) => (
                  <div key={s.v} className="bg-gradient-card shadow-card rounded-xl border border-border/60 p-3">
                    <div className="font-display text-2xl font-bold text-primary">{s.v}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live preview card */}
            <div className="bg-gradient-card shadow-card relative overflow-hidden rounded-3xl border border-border/60 p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Live prijscheck
                </div>
                <span className="text-xs text-muted-foreground">Indicatief</span>
              </div>

              <div className="mt-6">
                <div className="text-sm text-muted-foreground">Jouw huidige indicatie</div>
                <div className="font-display mt-1 text-5xl font-bold tracking-tight sm:text-6xl">
                  € {price}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Gebaseerd op de ingevulde conditie & batterijscore.
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-surface-2/60 p-3">
                  <span className="text-muted-foreground">Scherm</span>
                  <span className="font-medium">
                    {form.screen === "clean"
                      ? "Geen krassen"
                      : form.screen === "light"
                        ? "Lichte sporen"
                        : "Schade"}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border/60 bg-surface-2/60 p-3">
                  <span className="text-muted-foreground">Werking</span>
                  <span className="font-medium">
                    {form.works === "yes" ? "Werkend" : form.works === "mostly" ? "Grotendeels" : "Defect"}
                  </span>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Battery className="h-3.5 w-3.5" /> Batterij-score
                    </span>
                    <span className="font-medium text-foreground">{form.battery === "<80" ? "<80" : form.battery}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-gradient-mint transition-all"
                      style={{
                        width: `${form.battery === "<80" ? 65 : Math.min(100, Number(form.battery))}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
                <Pill icon="⚡" label="Snelle beoordeling" />
                <Pill icon="🔋" label="Batterij telt mee" />
                <Pill icon="📦" label="Meer details = beter bod" />
                <Pill icon="✅" label="Direct indicatie" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Vul de staat van de telefoon in</h2>
            <p className="mt-3 text-muted-foreground">
              Hoe completer de informatie, hoe scherper de indicatie. De definitieve prijs volgt na controle van het toestel.
            </p>
          </div>

          <form onSubmit={submit} className="mt-12 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="bg-gradient-card shadow-card rounded-2xl border border-border/60 p-6 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Merk">
                  <Select value={form.brand} onValueChange={(v) => set("brand", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="samsung">Samsung</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="oneplus">OnePlus</SelectItem>
                      <SelectItem value="other">Ander merk</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Model">
                  <Input
                    placeholder="bijv. iPhone 13 Pro"
                    value={form.model}
                    onChange={(e) => set("model", e.target.value)}
                  />
                </Field>
                <Field label="Opslag">
                  <Select value={form.storage} onValueChange={(v) => set("storage", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="64">64 GB</SelectItem>
                      <SelectItem value="128">128 GB</SelectItem>
                      <SelectItem value="256">256 GB</SelectItem>
                      <SelectItem value="512">512 GB</SelectItem>
                      <SelectItem value="1024">1 TB</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Leeftijd toestel">
                  <Select value={form.age} onValueChange={(v) => set("age", v)}>
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
                <Field label="Algemene staat">
                  <Select value={form.condition} onValueChange={(v) => set("condition", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Als nieuw</SelectItem>
                      <SelectItem value="good">Goede staat</SelectItem>
                      <SelectItem value="normal">Normale slijtage</SelectItem>
                      <SelectItem value="damaged">Zichtbare schade</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Batterijconditie">
                  <Select value={form.battery} onValueChange={(v) => set("battery", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="95">95% of hoger</SelectItem>
                      <SelectItem value="90">90% - 94%</SelectItem>
                      <SelectItem value="85">85% - 89%</SelectItem>
                      <SelectItem value="80">80% - 84%</SelectItem>
                      <SelectItem value="<80">Onder 80%</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Schermstatus">
                  <Select value={form.screen} onValueChange={(v) => set("screen", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clean">Geen krassen of barsten</SelectItem>
                      <SelectItem value="light">Lichte gebruikssporen</SelectItem>
                      <SelectItem value="cracked">Barst / zware schade</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Waterschade">
                  <Select value={form.water} onValueChange={(v) => set("water", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Nee</SelectItem>
                      <SelectItem value="maybe">Twijfelachtig</SelectItem>
                      <SelectItem value="yes">Ja</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Werkt alles naar behoren?">
                  <Select value={form.works} onValueChange={(v) => set("works", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Ja</SelectItem>
                      <SelectItem value="mostly">Grotendeels</SelectItem>
                      <SelectItem value="no">Nee</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Extra's">
                  <Select value={form.extras} onValueChange={(v) => set("extras", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Geen</SelectItem>
                      <SelectItem value="box">Originele doos aanwezig</SelectItem>
                      <SelectItem value="full">Doos + oplader</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="my-8 h-px bg-border/60" />

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Naam">
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
                </Field>
                <Field label="E-mailadres">
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="Telefoonnummer">
                  <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} />
                </Field>
                <Field label="Extra toelichting">
                  <Textarea
                    rows={1}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Optioneel"
                  />
                </Field>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Deze pagina geeft een indicatieve prijs. De definitieve prijs volgt na beoordeling van het toestel.
              </p>

              <Button type="submit" size="lg" className="mt-6 w-full shadow-glow">
                Ontvang indicatie <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Sticky live price */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-gradient-card shadow-card rounded-2xl border border-border/60 p-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                    <Zap className="h-3.5 w-3.5" /> Slimme prijsindicatie
                  </span>
                  <span className="text-muted-foreground">Live update</span>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">Jouw huidige indicatie</div>
                <div className="font-display text-5xl font-bold tracking-tight">€ {price}</div>

                <dl className="mt-6 space-y-2.5 text-sm">
                  <Row k="Model" v={form.model || "Nog niet ingevuld"} />
                  <Row k="Opslag" v={`${form.storage === "1024" ? "1 TB" : `${form.storage} GB`}`} />
                  <Row
                    k="Conditie"
                    v={
                      form.condition === "new"
                        ? "Als nieuw"
                        : form.condition === "good"
                          ? "Goede staat"
                          : form.condition === "normal"
                            ? "Normale slijtage"
                            : "Zichtbare schade"
                    }
                  />
                  <Row k="Batterij" v={form.battery === "<80" ? "Onder 80%" : `${form.battery}%+`} />
                  <Row k="Status" v="Indicatief bod" />
                </dl>

                <p className="mt-5 text-xs text-muted-foreground">
                  Definitieve inkoopprijs kan afwijken op basis van controle van werking, originaliteit en verborgen schade.
                </p>
              </div>
            </aside>
          </form>
        </div>
      </section>

      {/* Why */}
      <section className="border-y border-border/60 bg-surface-2/30 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Waarom dit prettig werkt</h2>
            <p className="mt-3 text-muted-foreground">
              Kleuren, beweging en overzicht zorgen voor een rustige maar overtuigende flow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Zap, title: "Snel gevoel", desc: "Frisse accenten en subtiele animaties geven het gevoel dat het proces direct en eenvoudig is." },
              { icon: ShieldCheck, title: "Vertrouwen", desc: "Premium uitstraling met heldere contrasten straalt waarde en controle uit." },
              { icon: Euro, title: "Focus op actie", desc: "De prijsindicatie beweegt mee met het formulier, zodat je sneller wilt afronden." },
            ].map((b) => (
              <div key={b.title} className="bg-gradient-card shadow-card rounded-2xl border border-border/60 p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="hoe" className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Hoe het werkt</h2>
            <p className="mt-3 text-muted-foreground">
              Een simpele flow die logisch aanvoelt en direct duidelijk maakt wat je moet doen.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", icon: Smartphone, title: "Vul toestelgegevens in", desc: "Kies merk, model, opslag en geef de staat van scherm, batterij en werking door." },
              { n: "02", icon: Euro, title: "Ontvang direct indicatie", desc: "De calculator laat meteen een indicatieve prijs zien op basis van de ingevulde conditie." },
              { n: "03", icon: CheckCircle2, title: "Laat het toestel beoordelen", desc: "Na controle van het toestel volgt de definitieve prijs. Duidelijk en professioneel." },
            ].map((s) => (
              <div key={s.n} className="bg-gradient-card shadow-card relative overflow-hidden rounded-2xl border border-border/60 p-6">
                <div className="absolute right-4 top-4 font-mono text-xs text-muted-foreground/50">{s.n}</div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <s.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Klaar om je telefoon te verkopen?</h2>
          <p className="mt-4 text-muted-foreground">
            Vul het formulier in en ontvang direct een indicatieve prijs voor je toestel.
          </p>
          <Button asChild size="lg" className="mt-8 shadow-glow">
            <a href="#calculator">Start nu <ArrowRight className="h-4 w-4" /></a>
          </Button>
          <div className="mt-10 text-xs text-muted-foreground">
            <Link to="/" className="underline-offset-4 hover:underline">← Terug naar I Will Make It</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} — Indicatieve prijsweergave • Definitieve prijs na controle
        </div>
      </footer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function Pill({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-surface-2/60 p-2.5">
      <span>{icon}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium">{v}</dd>
    </div>
  );
}
