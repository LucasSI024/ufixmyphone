import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Smartphone, Euro, Users, ArrowRight, CheckCircle2, Eye, Search, Camera, MapPin } from "lucide-react";
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
        <div className="container mx-auto max-w-6xl px-4 pb-24 pt-20 sm:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              De marktplaats voor telefoonreparaties
            </div>

            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Plaats je reparatie.<br />
              <span className="text-gradient-mint">Reparateurs brengen<br />offertes uit.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              UFixMyPhone is een online marktplaats waar reparateurs concurreren om jouw telefoonreparatie.
              Vergelijk prijs, locatie en beoordelingen — en kies zelf de beste reparateur.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full text-base shadow-glow sm:w-auto">
                <Link to="/login">Plaats je reparatie <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full text-base sm:w-auto">
                <Link to="/feed">
                  <Eye className="h-4 w-4" /> Ik ben reparateur
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Bekijken kan zonder account. Plaatsen of bieden alleen ingelogd.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Transparant & eerlijk</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Vergelijk offertes</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Direct contact met reparateur</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/60 bg-surface/30 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
            Zo werkt het
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Reparateurs concurreren om jouw opdracht — jij bepaalt.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: Smartphone, num: "01", title: "Plaats je aanvraag", desc: "Kies je toestel, beschrijf het probleem en upload eventueel foto's. Klaar in 1 minuut." },
              { icon: Users, num: "02", title: "Ontvang offertes", desc: "Reparateurs uit heel Nederland brengen een offerte uit met prijs, locatie en levertijd." },
              { icon: Euro, num: "03", title: "Vergelijk & kies", desc: "Vergelijk prijs, locatie en beoordelingen. Jij kiest zelf welke reparateur de opdracht krijgt." },
            ].map((step) => (
              <div key={step.num} className="bg-gradient-card shadow-card relative overflow-hidden rounded-2xl border border-border/60 p-6">
                <div className="absolute right-4 top-4 font-mono text-xs text-muted-foreground/50">{step.num}</div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-center font-display text-3xl font-bold sm:text-4xl">
            Twee zijden, één marktplaats
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            UFixMyPhone brengt consumenten en reparateurs samen — wij voeren zelf geen reparaties uit.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Owners */}
            <div className="bg-gradient-card shadow-card relative overflow-hidden rounded-2xl border border-border/60 p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold">Heb je iets kapot?</h3>
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
            <div className="bg-gradient-card shadow-card relative overflow-hidden rounded-2xl border border-border/60 p-8">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Wrench className="h-6 w-6" />
              </div>
              <h3 className="font-display text-2xl font-semibold">Ben je reparateur?</h3>
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
            className="bg-gradient-card shadow-card group mt-6 flex flex-col items-start gap-4 overflow-hidden rounded-2xl border border-border/60 p-6 transition-all hover:shadow-glow sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Euro className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold sm:text-xl">
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
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <Wrench className="mx-auto mb-6 h-10 w-10 text-primary" />
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Klaar om te besparen op je reparatie?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Plaats binnen 1 minuut je aanvraag en laat reparateurs voor je concurreren.
          </p>
          <Button asChild size="lg" className="mt-8 shadow-glow">
            <Link to="/login">Start nu — gratis <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} UFixMyPhone — De marktplaats voor telefoonreparaties
        </div>
      </footer>
    </div>
  );
}
