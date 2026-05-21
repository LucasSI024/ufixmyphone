import { createFileRoute, Link } from "@tanstack/react-router";
import { Wrench, Smartphone, Euro, Users, ArrowRight, CheckCircle2, Eye } from "lucide-react";
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
              Nu live in heel Nederland
            </div>

            <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
              Je telefoon kapot?<br />
              <span className="text-gradient-mint">Reparateurs bieden,<br />jij kiest.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Plaats je kapotte toestel op Fixbod en ontvang biedingen van reparateurs door heel Nederland.
              Geen overprijsde winkels meer — kies zelf de beste prijs en datum.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full text-base shadow-glow sm:w-auto">
                <Link to="/feed">
                  <Eye className="h-4 w-4" /> Bekijk reparaties
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full text-base sm:w-auto">
                <Link to="/login">Plaats je reparatie <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Bekijken kan zonder account. Plaatsen of bieden alleen ingelogd.
            </p>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Gratis plaatsen</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Vergelijk biedingen</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Lokaal of verzenden</div>
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
            Drie simpele stappen tot je telefoon weer als nieuw is.
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: Smartphone, num: "01", title: "Plaats je toestel", desc: "Foto, merk, model en wat er kapot is. Klaar in 1 minuut." },
              { icon: Users, num: "02", title: "Ontvang biedingen", desc: "Reparateurs uit jouw regio bieden op je reparatie met prijs en levertijd." },
              { icon: Euro, num: "03", title: "Kies & laat fixen", desc: "Accepteer het bod dat bij je past. Brengen of verzenden — jij kiest." },
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

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <Wrench className="mx-auto mb-6 h-10 w-10 text-primary" />
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Klaar om te besparen op je reparatie?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Maak gratis een account en plaats binnen 1 minuut je eerste reparatie.
          </p>
          <Button asChild size="lg" className="mt-8 shadow-glow">
            <Link to="/login">Start nu — gratis <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-8">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Fixbod — De marktplaats voor telefoonreparaties
        </div>
      </footer>
    </div>
  );
}
