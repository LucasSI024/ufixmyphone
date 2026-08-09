import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Smartphone, Euro, Users, ArrowRight, CheckCircle2, Eye, Search, Camera, MapPin, FileText, MessageSquare, Scale, ShieldCheck, Star, Lock } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-hero relative overflow-hidden">
        <div className="bg-pattern-dots bg-pattern-mask pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="bg-grain pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay" aria-hidden="true" />
        <div className="container relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border-2 border-primary/40 bg-primary/15 px-5 py-2.5 text-sm font-semibold text-primary shadow-glow sm:text-base">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
              </span>
              Eerlijke & veilige reparatie
            </div>

            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Eerlijke en<br />
              <span className="text-gradient-mint">veilige reparatie.<br />Meerdere offertes, één keuze.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Op repaireally plaats je één aanvraag en ontvang je meerdere offertes van
              geverifieerde reparateurs. Jij vergelijkt in alle rust en kiest zelf —
              <strong className="text-foreground"> veilig, transparant en zonder gedoe</strong>.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full text-base shadow-glow sm:w-auto">
                <Link to="/login">Vergelijk gratis offertes <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full text-base sm:w-auto">
                <Link to="/feed">
                  <Eye className="h-4 w-4" /> Ik ben reparateur
                </Link>
              </Button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Gratis & vrijblijvend · Geen verplichting tot kiezen · Bekijken kan zonder account
            </p>

            {/* Waardepunten */}
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {[
                { big: "Concurrentie", small: "reparateurs bieden mee" },
                { big: "3-5", small: "offertes per aanvraag" },
                { big: "100%", small: "transparant" },
                { big: "Veilig", small: "geverifieerde reparateurs" },
              ].map((s) => (
                <div key={s.small} className="bg-gradient-card rounded-xl border border-primary/30 px-3 py-3 text-center shadow-glow">
                  <div className="font-display text-xl font-bold text-primary sm:text-2xl">{s.big}</div>
                  <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground sm:text-xs">{s.small}</div>
                </div>
              ))}
            </div>

            {/* 4-step visual — readable in 5s */}
            <ol className="mx-auto mt-6 grid max-w-2xl grid-cols-2 gap-2 text-left sm:grid-cols-4 sm:gap-3">
              {[
                { n: "1", icon: FileText, t: "Plaats aanvraag" },
                { n: "2", icon: MessageSquare, t: "Ontvang offertes" },
                { n: "3", icon: Scale, t: "Vergelijk offertes" },
                { n: "4", icon: CheckCircle2, t: "Kies de beste" },
              ].map((s) => (
                <li key={s.n} className="bg-gradient-card flex items-center gap-2.5 rounded-xl border border-border/60 px-3 py-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <s.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Stap {s.n}</div>
                    <div className="text-xs font-semibold leading-tight">{s.t}</div>
                  </div>
                </li>
              ))}
            </ol>


            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm">
              <div className="flex items-center gap-1.5"><Euro className="h-4 w-4 text-primary" /> Eerlijke concurrentie</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Veilig & geverifieerd</div>
              <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-primary" /> Reviews van klanten</div>
              <div className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-primary" /> Geen gedoe, jij kiest</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works — uitgebreid */}
      <section className="relative border-y border-border/60 bg-surface/30 py-24 sm:py-32">
        <div className="bg-pattern-grid bg-pattern-mask pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              Zo werkt de marktplaats
            </div>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Van kapot naar gerepareerd<br />
              <span className="text-gradient-mint">in 4 simpele stappen</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              repaireally repareert niet zelf — wij brengen jou in contact met meerdere reparateurs die met elkaar concurreren om jouw opdracht.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: FileText, num: "01", title: "Plaats je aanvraag", desc: "Kies je toestel, beschrijf het probleem en upload foto's. Klaar in 1 minuut." },
              { icon: MessageSquare, num: "02", title: "Ontvang offertes", desc: "Geverifieerde reparateurs brengen een offerte uit met prijs, locatie en levertijd." },
              { icon: Scale, num: "03", title: "Vergelijk transparant", desc: "Vergelijk alle offertes naast elkaar — prijs, afstand én klantbeoordelingen." },
              { icon: CheckCircle2, num: "04", title: "Kies zelf je reparateur", desc: "Jij beslist. Accepteer de offerte die het beste past en kom direct in contact." },
            ].map((step) => (
              <div key={step.num} className="bg-gradient-card shadow-card group relative overflow-hidden rounded-2xl border border-border/60 p-7 transition-all hover:border-primary/40 hover:shadow-glow">
                <div className="absolute -right-2 -top-3 font-display text-6xl font-bold text-primary/10 transition-colors group-hover:text-primary/20">{step.num}</div>
                <div className="relative mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <step.icon className="h-7 w-7" />
                </div>
                <h3 className="relative font-display text-xl font-semibold">{step.title}</h3>
                <p className="relative mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
            <strong className="text-foreground">Belangrijk:</strong> repaireally is een platform, geen reparatiebedrijf.
            De reparatie zelf wordt uitgevoerd door de reparateur die jij kiest.
          </p>
        </div>
      </section>

      {/* Why repaireally — eerlijk & veilig */}
      <section className="relative border-y border-border/60 bg-surface/30 py-24 sm:py-32">
        <div className="bg-pattern-dots bg-pattern-mask pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              Waarom repaireally
            </div>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Eerlijk, veilig en<br />
              <span className="text-gradient-mint">volledig transparant</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              Wij vinden dat je reparatie niet alleen voordelig, maar ook zorgeloos moet zijn. Daarom zetten we eerlijkheid en veiligheid centraal.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Scale, title: "Eerlijke prijs", desc: "Meerdere reparateurs concurreren om jouw opdracht. Zo betaal je nooit meer dan de marktprijs." },
              { icon: ShieldCheck, title: "Veilig & geverifieerd", desc: "Reparateurs worden gecontroleerd op KvK en kwaliteit. Jij kiest zelf wie je toestel mag repareren." },
              { icon: Eye, title: "Transparant", desc: "Alle offertes, reviews en voorwaarden overzichtelijk naast elkaar. Geen verborgen kosten of verrassingen." },
            ].map((item) => (
              <div key={item.title} className="bg-gradient-card shadow-card group relative overflow-hidden rounded-2xl border border-border/60 p-7 transition-all hover:border-primary/40 hover:shadow-glow">
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Two paths */}
      <section className="relative py-24 sm:py-32">
        <div className="container relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/15 px-4 py-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              Voor iedereen
            </div>
            <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Twee zijden,<br />
              <span className="text-gradient-mint">één marktplaats</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              repaireally brengt consumenten en reparateurs samen — wij voeren zelf geen reparaties uit.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {/* Owners */}
            <div className="bg-gradient-card shadow-card group relative overflow-hidden rounded-2xl border border-border/60 p-7 transition-all hover:border-primary/40 hover:shadow-glow">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Smartphone className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold">Heb je iets kapot?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Plaats een reparatieaanvraag en laat meerdere reparateurs een offerte uitbrengen — jij kiest zelf de beste.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li className="flex items-start gap-2"><Camera className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Foto's & duidelijke probleembeschrijving</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Meerdere offertes naast elkaar</li>
                <li className="flex items-start gap-2"><Euro className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Vergelijk prijs, locatie én beoordelingen</li>
              </ul>
              <Button asChild className="mt-6 w-full shadow-glow">
                <Link to="/new">Plaats je reparatie <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>

            {/* Repairers */}
            <div className="bg-gradient-card shadow-card group relative overflow-hidden rounded-2xl border border-border/60 p-7 transition-all hover:border-primary/40 hover:shadow-glow">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Wrench className="h-7 w-7" />
              </div>
              <h3 className="font-display text-xl font-semibold">Ben je reparateur?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Bekijk reparatieaanvragen van consumenten en breng direct een offerte uit. Kom in contact met nieuwe klanten.
              </p>
              <ul className="mt-5 space-y-2.5 text-sm">
                <li className="flex items-start gap-2"><Search className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Zoek op merk, model of onderdeel</li>
                <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Filter op stad — lokaal of landelijk</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Breng een offerte uit en krijg direct contact</li>
              </ul>
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link to="/feed">Bekijk open aanvragen <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>

          {/* Sell phone link */}
          <Link
            to="/verkoop"
            className="bg-gradient-card shadow-card group mt-6 flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-border/60 p-7 transition-all hover:border-primary/40 hover:shadow-glow sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Euro className="h-7 w-7" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">
                  Of wil je liever je telefoon verkopen?
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bereken binnen 1 minuut een eerlijke indicatieprijs voor je toestel.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform group-hover:translate-x-1">
              Verkoop je telefoon <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-border/60 bg-surface/30 py-24 sm:py-32">
        <div className="bg-pattern-dots bg-pattern-mask pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="container relative mx-auto max-w-3xl px-4 text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Wrench className="h-7 w-7" />
          </div>
          <h2 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Klaar voor een eerlijke<br />
            <span className="text-gradient-mint">en veilige reparatie?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Plaats binnen 1 minuut je aanvraag, ontvang offertes van geverifieerde reparateurs en kies met een gerust hart.
          </p>
          <Button asChild size="lg" className="mt-8 shadow-glow">
            <Link to="/login">Start nu — gratis <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} repaireally — De marktplaats voor telefoonreparaties
        </div>
      </footer>
    </div>
  );
}
