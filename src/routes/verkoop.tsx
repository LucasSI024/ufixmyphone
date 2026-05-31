import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BRANDS, getBrand, getModel } from "@/lib/phones";
import { toast } from "sonner";

export const Route = createFileRoute("/verkoop")({
  head: () => ({
    meta: [
      { title: "Verkoop je telefoon snel | Direct een bod" },
      {
        name: "description",
        content:
          "Verkoop je telefoon snel en eenvoudig. Vul de staat van je toestel in en ontvang direct een indicatieve prijs.",
      },
      { property: "og:title", content: "Verkoop je telefoon snel | Direct een bod" },
      {
        property: "og:description",
        content: "Snel. Veilig. Duidelijk. Ontvang binnen 1 minuut een indicatie voor je toestel.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
      },
    ],
  }),
  component: VerkoopPage,
});

// ── Pricing multipliers ──────────────────────────────────────────────────────
const STORAGE_MULT: Record<string, number> = { "64": 0.85, "128": 1, "256": 1.12, "512": 1.25, "1024": 1.4 };
const AGE_MULT: Record<string, number> = { "0": 1.1, "1": 1, "2": 0.85, "3": 0.7, "4": 0.55 };
const CONDITION_MULT: Record<string, number> = { new: 1.1, good: 1, normal: 0.85, damaged: 0.6 };
const BATTERY_MULT: Record<string, number> = { "95": 1.05, "90": 1, "85": 0.95, "80": 0.88, "<80": 0.78 };
const SCREEN_MULT: Record<string, number> = { clean: 1, light: 0.92, cracked: 0.55 };
const WATER_MULT: Record<string, number> = { no: 1, maybe: 0.75, yes: 0.4 };
const WORKS_MULT: Record<string, number> = { yes: 1, mostly: 0.85, no: 0.5 };
const EXTRAS_BONUS: Record<string, number> = { none: 0, box: 15, full: 35 };

const CONDITION_LABEL: Record<string, string> = {
  new: "Als nieuw",
  good: "Goede staat",
  normal: "Normale slijtage",
  damaged: "Zichtbare schade",
};
const BATTERY_LABEL: Record<string, string> = {
  "95": "95% of hoger",
  "90": "90% - 94%",
  "85": "85% - 89%",
  "80": "80% - 84%",
  "<80": "Onder 80%",
};

function VerkoopPage() {
  const initialBrand = BRANDS[0];
  const initialModel = initialBrand.models[0];
  const [f, setF] = useState({
    brand: initialBrand.id,
    model: initialModel.id,
    storage: initialModel.storages.includes("128") ? "128" : initialModel.storages[0],
    color: initialModel.colors[0],
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
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));

  const brand = getBrand(f.brand);
  const model = getModel(f.brand, f.model) ?? brand.models[0];

  useEffect(() => {
    const b = getBrand(f.brand);
    if (!b.models.find((m) => m.id === f.model)) {
      const m = b.models[0];
      setF((p) => ({
        ...p,
        model: m.id,
        storage: m.storages.includes("128") ? "128" : m.storages[0],
        color: m.colors[0],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.brand]);

  useEffect(() => {
    const m = getModel(f.brand, f.model);
    if (!m) return;
    setF((p) => ({
      ...p,
      storage: m.storages.includes(p.storage) ? p.storage : m.storages.includes("128") ? "128" : m.storages[0],
      color: m.colors.includes(p.color) ? p.color : m.colors[0],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f.model]);

  const price = useMemo(() => {
    const p =
      model.basePrice *
        (STORAGE_MULT[f.storage] ?? 1) *
        (AGE_MULT[f.age] ?? 1) *
        (CONDITION_MULT[f.condition] ?? 1) *
        (BATTERY_MULT[f.battery] ?? 1) *
        (SCREEN_MULT[f.screen] ?? 1) *
        (WATER_MULT[f.water] ?? 1) *
        (WORKS_MULT[f.works] ?? 1) +
      (EXTRAS_BONUS[f.extras] ?? 0);
    return Math.max(20, Math.round(p / 5) * 5);
  }, [f, model]);

  const batteryPct = f.battery === "<80" ? 65 : Number(f.battery);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name || !f.email) {
      toast.error("Vul je naam en e-mailadres in");
      return;
    }
    toast.success(`Bedankt ${f.name}! Je indicatie van € ${price} is verzonden.`);
  };

  return (
    <div className="td-root">
      <style>{CSS}</style>
      <div className="aurora" aria-hidden />
      <div className="grid-lines" aria-hidden />

      <div className="wrap">
        <header className="topbar">
          <div className="container nav">
            <Link to="/" className="brand">
              <div className="brand-badge">T</div>
              <div>
                TelefoonDeal
                <br />
                <span className="brand-sub">Snel. Veilig. Duidelijk.</span>
              </div>
            </Link>
            <nav className="nav-links">
              <a href="#voordelen">Voordelen</a>
              <a href="#hoe-werkt-het">Hoe werkt het</a>
              <a href="#formulier" className="btn btn-primary">Bereken je prijs</a>
            </nav>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="hero">
            <div className="container hero-grid">
              <div>
                <div className="eyebrow"><span className="pulse" /> Binnen 1 minuut jouw indicatie</div>
                <h1>
                  Verkoop je telefoon met een <span className="gradient-text">strakke, snelle check</span>
                </h1>
                <p className="lead">
                  Laat direct zien in welke staat je toestel is. Op basis van merk, model, opslag, batterij en
                  schade ontvang je meteen een duidelijke indicatieve prijs. Snel geregeld, zonder gedoe.
                </p>
                <div className="hero-actions">
                  <a className="btn btn-primary" href="#formulier">Bereken je prijs</a>
                  <a className="btn btn-secondary" href="#hoe-werkt-het">Bekijk hoe het werkt</a>
                </div>
                <div className="stats">
                  <div className="stat"><strong>24u</strong><span>Snelle terugkoppeling mogelijk</span></div>
                  <div className="stat"><strong>1 min</strong><span>Invullen van het formulier</span></div>
                  <div className="stat"><strong>100%</strong><span>Indicatie op basis van conditie</span></div>
                </div>
              </div>

              <div className="phone-stage" aria-hidden>
                <div className="ring" />
                <div className="ring2" />
                <div className="ring3" />
                <div className="floating-chip chip-a">⚡ Snelle beoordeling</div>
                <div className="floating-chip chip-b">🔋 Batterij telt mee</div>
                <div className="floating-chip chip-c">📦 Meer details = beter bod</div>
                <div className="floating-chip chip-d">✅ Direct indicatie</div>

                <div className="phone">
                  <div className="phone-notch" />
                  <div className="screen">
                    <div className="screen-content">
                      <div className="mini-pill">Live prijscheck</div>
                      <div className="price-card">
                        <div className="pc-sub">Indicatie voor {brand.name} {model.name}</div>
                        <div className="price-value">€ {price}</div>
                        <div className="pc-meta">
                          Gebaseerd op {CONDITION_LABEL[f.condition].toLowerCase()} + batterij {batteryPct}%
                        </div>
                      </div>
                      <div className="feature-card">
                        <div className="fc-title">Conditie-analyse</div>
                        <div className="feature-list">
                          <div>Scherm: {f.screen === "clean" ? "geen krassen" : f.screen === "light" ? "lichte gebruikssporen" : "barst / schade"}</div>
                          <div>Werking: {f.works === "yes" ? "alles werkend" : f.works === "mostly" ? "grotendeels werkend" : "defecten aanwezig"}</div>
                          <div>Water: {f.water === "no" ? "geen schade" : f.water === "maybe" ? "twijfelachtig" : "ja"}</div>
                        </div>
                      </div>
                      <div className="feature-card">
                        <div className="fc-row">
                          <span className="fc-title">Batterij-score</span>
                          <span>{batteryPct}%</span>
                        </div>
                        <div className="progress"><span style={{ width: `${batteryPct}%` }} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Form */}
          <section id="formulier">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>Vul de staat van de telefoon in</h2>
                  <p>Hoe completer de informatie, hoe scherper de indicatie. De uiteindelijke prijs wordt bevestigd na controle van het toestel.</p>
                </div>
              </div>

              <form onSubmit={submit} className="form-layout">
                <div className="glass form-card">
                  <div className="form-grid">
                    <SelectField label="Merk" value={f.brand} onChange={(v) => set("brand", v)}>
                      {BRANDS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </SelectField>

                    <SelectField label="Model" value={f.model} onChange={(v) => set("model", v)}>
                      {brand.models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </SelectField>

                    <SelectField label="Opslag" value={f.storage} onChange={(v) => set("storage", v)}>
                      {model.storages.map((s) => (
                        <option key={s} value={s}>{s === "1024" ? "1 TB" : `${s} GB`}</option>
                      ))}
                    </SelectField>

                    <SelectField label="Kleur" value={f.color} onChange={(v) => set("color", v)}>
                      {model.colors.map((c) => <option key={c} value={c}>{c}</option>)}
                    </SelectField>

                    <SelectField label="Leeftijd toestel" value={f.age} onChange={(v) => set("age", v)}>
                      <option value="0">Minder dan 1 jaar</option>
                      <option value="1">1 jaar</option>
                      <option value="2">2 jaar</option>
                      <option value="3">3 jaar</option>
                      <option value="4">4+ jaar</option>
                    </SelectField>

                    <SelectField label="Algemene staat" value={f.condition} onChange={(v) => set("condition", v)}>
                      <option value="new">Als nieuw</option>
                      <option value="good">Goede staat</option>
                      <option value="normal">Normale slijtage</option>
                      <option value="damaged">Zichtbare schade</option>
                    </SelectField>

                    <SelectField label="Batterijconditie" value={f.battery} onChange={(v) => set("battery", v)}>
                      <option value="95">95% of hoger</option>
                      <option value="90">90% - 94%</option>
                      <option value="85">85% - 89%</option>
                      <option value="80">80% - 84%</option>
                      <option value="<80">Onder 80%</option>
                    </SelectField>

                    <SelectField label="Schermstatus" value={f.screen} onChange={(v) => set("screen", v)}>
                      <option value="clean">Geen krassen of barsten</option>
                      <option value="light">Lichte gebruikssporen</option>
                      <option value="cracked">Barst / zware schade</option>
                    </SelectField>

                    <SelectField label="Waterschade" value={f.water} onChange={(v) => set("water", v)}>
                      <option value="no">Nee</option>
                      <option value="maybe">Twijfelachtig</option>
                      <option value="yes">Ja</option>
                    </SelectField>

                    <SelectField label="Werkt alles naar behoren?" value={f.works} onChange={(v) => set("works", v)}>
                      <option value="yes">Ja</option>
                      <option value="mostly">Grotendeels</option>
                      <option value="no">Nee</option>
                    </SelectField>

                    <SelectField label="Extra's" value={f.extras} onChange={(v) => set("extras", v)}>
                      <option value="none">Geen</option>
                      <option value="box">Originele doos aanwezig</option>
                      <option value="full">Doos + oplader</option>
                    </SelectField>

                    <div className="field full">
                      <label>Naam</label>
                      <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Jouw naam" />
                    </div>
                    <div className="field">
                      <label>E-mailadres</label>
                      <input type="email" value={f.email} onChange={(e) => set("email", e.target.value)} placeholder="naam@email.nl" />
                    </div>
                    <div className="field">
                      <label>Telefoonnummer</label>
                      <input type="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="06 12345678" />
                    </div>
                    <div className="field full">
                      <label>Extra toelichting</label>
                      <textarea
                        rows={4}
                        value={f.notes}
                        onChange={(e) => set("notes", e.target.value)}
                        placeholder="Bijvoorbeeld: camera werkt minder goed, achterkant heeft krasjes, scherm is ooit vervangen..."
                      />
                      <div className="hint">Deze pagina geeft een indicatieve prijs. De definitieve prijs volgt na beoordeling van het toestel.</div>
                    </div>
                    <div className="field full">
                      <button className="btn btn-primary btn-full" type="submit">Ontvang indicatie</button>
                    </div>
                  </div>
                </div>

                <aside className="glass quote-card">
                  <div className="quote-top">
                    <div className="badge">⚙️ Slimme prijsindicatie</div>
                    <div className="quote-live">Live update</div>
                  </div>
                  <div className="quote-label">Jouw huidige indicatie</div>
                  <div className="quote-value">€ {price}</div>

                  <div className="quote-meta">
                    <div className="quote-row"><span>Model</span><strong>{brand.name} {model.name}</strong></div>
                    <div className="quote-row"><span>Opslag</span><strong>{f.storage === "1024" ? "1 TB" : `${f.storage} GB`}</strong></div>
                    <div className="quote-row"><span>Kleur</span><strong>{f.color}</strong></div>
                    <div className="quote-row"><span>Conditie</span><strong>{CONDITION_LABEL[f.condition]}</strong></div>
                    <div className="quote-row"><span>Batterij</span><strong>{BATTERY_LABEL[f.battery]}</strong></div>
                    <div className="quote-row"><span>Status</span><strong>Indicatief bod</strong></div>
                  </div>

                  <div className="tiny">
                    Deze berekening is bedoeld als indicatie. De definitieve inkoopprijs kan afwijken op basis van controle
                    van werking, originaliteit van onderdelen en verborgen schade.
                  </div>
                </aside>
              </form>
            </div>
          </section>

          {/* Benefits */}
          <section id="voordelen">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>Waarom dit prettig werkt</h2>
                  <p>Kleuren, beweging en overzicht zorgen voor een rustige maar overtuigende flow. Dat maakt invullen laagdrempelig en vergroot de kans dat bezoekers doorgaan.</p>
                </div>
              </div>
              <div className="benefits">
                <div className="glass benefit-card">
                  <div className="icon">⚡</div>
                  <h3>Snel gevoel</h3>
                  <p>Frisse accentkleuren en subtiele animaties geven bezoekers het gevoel dat het proces modern, direct en eenvoudig is.</p>
                </div>
                <div className="glass benefit-card">
                  <div className="icon">🔒</div>
                  <h3>Vertrouwen</h3>
                  <p>Donkere premium achtergrond met heldere contrasten straalt waarde en controle uit, zonder druk of onrustig te ogen.</p>
                </div>
                <div className="glass benefit-card">
                  <div className="icon">💶</div>
                  <h3>Focus op actie</h3>
                  <p>De prijsindicatie beweegt mee met het formulier, waardoor bezoekers sneller willen afronden en hun gegevens achterlaten.</p>
                </div>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section id="hoe-werkt-het">
            <div className="container">
              <div className="section-head">
                <div>
                  <h2>Hoe het werkt</h2>
                  <p>Een simpele flow die logisch aanvoelt en direct duidelijk maakt wat iemand moet doen.</p>
                </div>
              </div>
              <div className="steps">
                <div className="glass step">
                  <div className="step-no">1</div>
                  <h3>Vul toestelgegevens in</h3>
                  <p>Kies merk, model, opslag en geef de staat van scherm, batterij en werking door.</p>
                </div>
                <div className="glass step">
                  <div className="step-no">2</div>
                  <h3>Ontvang direct indicatie</h3>
                  <p>De calculator laat meteen een indicatieve prijs zien op basis van de ingevulde conditie.</p>
                </div>
                <div className="glass step">
                  <div className="step-no">3</div>
                  <h3>Laat het toestel beoordelen</h3>
                  <p>Na controle van het toestel volgt de definitieve prijs. Zo blijft het duidelijk en professioneel.</p>
                </div>
              </div>

              <div className="glass cta">
                <div>
                  <h3>Klaar om je telefoon te verkopen?</h3>
                  <p>Vul het formulier in en ontvang direct een indicatieve prijs voor je toestel.</p>
                </div>
                <a className="btn btn-primary" href="#formulier">Start nu</a>
              </div>
            </div>
          </section>
        </main>

        <footer>
          <div className="container footer-line">
            <div>© {new Date().getFullYear()} TelefoonDeal</div>
            <div>
              <Link to="/" className="footer-link">← Terug naar I Will Make It</Link>
              <span className="footer-sep"> • </span>
              Indicatieve prijsweergave • Definitieve prijs na controle
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select>
    </div>
  );
}

// ─── Scoped TelefoonDeal styling ─────────────────────────────────────────────
const CSS = `
.td-root {
  --bg: #08111f;
  --card: rgba(8, 17, 31, 0.72);
  --card-border: rgba(255,255,255,0.12);
  --text: #f4f8ff;
  --muted: #b9c7dc;
  --accent: #31d0aa;
  --accent-2: #7de3ff;
  --warm: #ffb86b;
  --shadow: 0 18px 60px rgba(0,0,0,0.28);
  --radius: 24px;
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  color: var(--text);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 15% 20%, rgba(49,208,170,0.18), transparent 28%),
    radial-gradient(circle at 80% 10%, rgba(125,227,255,0.16), transparent 25%),
    radial-gradient(circle at 85% 75%, rgba(255,184,107,0.10), transparent 28%),
    linear-gradient(180deg, #091220 0%, #0a1321 35%, #07101d 100%);
}
.td-root * { box-sizing: border-box; }
.td-root a { color: inherit; text-decoration: none; }
.td-root h1, .td-root h2, .td-root h3 { font-family: inherit; }

.td-root .aurora {
  position: absolute; top: -10vw; left: -8vw;
  width: 42vw; height: 42vw; border-radius: 999px;
  filter: blur(80px); pointer-events: none; z-index: 0;
  background: rgba(49,208,170,.15);
  animation: td-floatBlob 16s ease-in-out infinite alternate;
}
.td-root .aurora::before, .td-root .aurora::after {
  content: ""; position: absolute; border-radius: 999px; filter: blur(80px); pointer-events: none;
  animation: td-floatBlob 19s ease-in-out infinite alternate;
}
.td-root .aurora::before { top: 40vh; left: 75vw; width: 30vw; height: 30vw; background: rgba(125,227,255,.13); }
.td-root .aurora::after  { top: 115vh; left: 12vw; width: 28vw; height: 28vw; background: rgba(255,184,107,.11); animation-duration: 22s; }
@keyframes td-floatBlob {
  0% { transform: translate3d(0,0,0) scale(1); }
  100% { transform: translate3d(4vw, 5vh, 0) scale(1.08); }
}

.td-root .grid-lines {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: linear-gradient(180deg, rgba(255,255,255,.4), rgba(255,255,255,.04));
  pointer-events: none; z-index: 0;
}

.td-root .wrap { position: relative; z-index: 1; }
.td-root .container { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }

.td-root .topbar {
  position: sticky; top: 0;
  backdrop-filter: blur(14px);
  background: rgba(7, 14, 25, 0.55);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  z-index: 10;
}
.td-root .nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; }
.td-root .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: .02em; }
.td-root .brand-badge {
  width: 42px; height: 42px; border-radius: 14px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: grid; place-items: center; color: #072030;
  box-shadow: 0 10px 30px rgba(49,208,170,.35); font-weight: 900;
}
.td-root .brand-sub { font-size: 12px; color: #9bb0cb; font-weight: 600; }
.td-root .nav-links { display: flex; gap: 18px; align-items: center; color: var(--muted); font-size: 14px; }

.td-root .btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  padding: 14px 18px; border-radius: 16px; border: 1px solid transparent;
  cursor: pointer; transition: .24s ease; font-weight: 700; font: inherit; font-weight: 700;
}
.td-root .btn-primary {
  color: #062130;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  box-shadow: 0 14px 40px rgba(49,208,170,0.28);
}
.td-root .btn-primary:hover { transform: translateY(-2px) scale(1.01); }
.td-root .btn-secondary { color: var(--text); border-color: rgba(255,255,255,.12); background: rgba(255,255,255,.04); }
.td-root .btn-full { width: 100%; padding: 16px 18px; font-size: 16px; }

.td-root .hero { padding: 66px 0 30px; }
.td-root .hero-grid { display: grid; grid-template-columns: 1.08fr .92fr; gap: 28px; align-items: center; }
.td-root .eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 14px; border-radius: 999px;
  background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.08);
  color: var(--accent-2); font-size: 14px; margin-bottom: 20px;
}
.td-root .pulse {
  width: 10px; height: 10px; border-radius: 999px; background: var(--accent);
  box-shadow: 0 0 0 0 rgba(49,208,170,.7);
  animation: td-pulse 1.8s infinite;
}
@keyframes td-pulse {
  0% { box-shadow: 0 0 0 0 rgba(49,208,170,.7); }
  70% { box-shadow: 0 0 0 16px rgba(49,208,170,0); }
  100% { box-shadow: 0 0 0 0 rgba(49,208,170,0); }
}
.td-root h1 {
  font-size: clamp(38px, 6vw, 68px); line-height: 1.02;
  margin: 0 0 18px; letter-spacing: -0.04em; max-width: 11ch; font-weight: 800;
}
.td-root .gradient-text {
  background: linear-gradient(135deg, #ffffff, #9fefff 40%, #31d0aa 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.td-root .lead { margin: 0; color: var(--muted); font-size: 18px; line-height: 1.65; max-width: 58ch; }
.td-root .hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
.td-root .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 28px; }
.td-root .stat {
  padding: 16px; border-radius: 18px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  backdrop-filter: blur(12px);
}
.td-root .stat strong { display: block; font-size: 24px; margin-bottom: 6px; }
.td-root .stat span { color: var(--muted); font-size: 14px; }

.td-root .phone-stage { position: relative; min-height: 600px; display: grid; place-items: center; }
.td-root .ring, .td-root .ring2, .td-root .ring3 {
  position: absolute; border: 1px solid rgba(125,227,255,.16); border-radius: 999px;
  animation: td-spin 24s linear infinite;
}
.td-root .ring { width: 440px; height: 440px; }
.td-root .ring2 { width: 340px; height: 340px; animation-direction: reverse; animation-duration: 18s; }
.td-root .ring3 { width: 250px; height: 250px; animation-duration: 14s; }
@keyframes td-spin { to { transform: rotate(360deg); } }

.td-root .floating-chip {
  position: absolute; padding: 12px 14px; border-radius: 18px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(14px); color: var(--text);
  box-shadow: var(--shadow);
  animation: td-bob 5s ease-in-out infinite; font-size: 14px;
}
.td-root .chip-a { top: 18%; left: 2%; }
.td-root .chip-b { top: 14%; right: 2%; animation-delay: .8s; }
.td-root .chip-c { bottom: 12%; left: 8%; animation-delay: .35s; }
.td-root .chip-d { bottom: 18%; right: 5%; animation-delay: 1.1s; }
@keyframes td-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

.td-root .phone {
  position: relative; width: min(340px, 70vw); aspect-ratio: 9/19.5;
  border-radius: 42px;
  background: linear-gradient(180deg, #151e31 0%, #0c1321 100%);
  box-shadow: 0 24px 90px rgba(0,0,0,.45), inset 0 0 0 1px rgba(255,255,255,.08);
  padding: 16px; transform: rotate(-7deg);
  animation: td-phoneFloat 5.8s ease-in-out infinite;
}
@keyframes td-phoneFloat {
  0%,100% { transform: rotate(-7deg) translateY(0px); }
  50% { transform: rotate(-5deg) translateY(-12px); }
}
.td-root .phone::before {
  content: ""; position: absolute; inset: 8px; border-radius: 34px;
  background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,0));
  pointer-events: none;
}
.td-root .phone-notch {
  width: 40%; height: 28px; background: #05070c;
  border-radius: 0 0 18px 18px; margin: 0 auto; position: relative; z-index: 2;
}
.td-root .screen {
  margin-top: 8px; height: calc(100% - 36px);
  border-radius: 32px; overflow: hidden;
  background:
    radial-gradient(circle at 20% 10%, rgba(125,227,255,.3), transparent 30%),
    radial-gradient(circle at 80% 80%, rgba(49,208,170,.25), transparent 25%),
    linear-gradient(180deg, #14263e 0%, #102038 40%, #0b1727 100%);
  position: relative;
}
.td-root .screen::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(125deg, transparent 35%, rgba(255,255,255,.16) 49%, transparent 61%);
  transform: translateX(-110%);
  animation: td-shine 4.8s ease-in-out infinite;
}
@keyframes td-shine {
  0%, 15% { transform: translateX(-120%); }
  55%,100% { transform: translateX(130%); }
}
.td-root .screen-content {
  position: relative; z-index: 1; padding: 22px 18px 18px; height: 100%;
  display: flex; flex-direction: column; gap: 14px;
}
.td-root .mini-pill {
  display: inline-flex; align-self: flex-start; padding: 8px 12px; border-radius: 999px;
  background: rgba(255,255,255,.1); color: #ddf8ff; font-size: 12px; font-weight: 700;
  border: 1px solid rgba(255,255,255,.12);
}
.td-root .price-card, .td-root .feature-card {
  border-radius: 20px; background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12); padding: 16px; backdrop-filter: blur(16px);
}
.td-root .pc-sub { color: #d6e9ff; font-size: 14px; }
.td-root .price-value { font-size: 30px; font-weight: 800; margin-top: 8px; }
.td-root .pc-meta { color: #c8d9f0; font-size: 12px; margin-top: 6px; }
.td-root .fc-title { font-weight: 700; margin-bottom: 10px; }
.td-root .fc-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.td-root .feature-list { display: grid; gap: 8px; color: #dbe7f5; font-size: 13px; }
.td-root .progress { height: 10px; border-radius: 999px; background: rgba(255,255,255,.12); overflow: hidden; }
.td-root .progress > span {
  display: block; height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  border-radius: inherit; transition: width .4s ease;
}

.td-root section { padding: 42px 0; }
.td-root .section-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 20px; }
.td-root .section-head h2 { margin: 0; font-size: clamp(28px, 4vw, 44px); line-height: 1.1; letter-spacing: -0.03em; font-weight: 800; }
.td-root .section-head p { margin: 0; color: var(--muted); max-width: 54ch; }

.td-root .glass {
  background: var(--card); border: 1px solid var(--card-border);
  border-radius: var(--radius); box-shadow: var(--shadow); backdrop-filter: blur(18px);
}

.td-root .form-layout { display: grid; grid-template-columns: 1.15fr .85fr; gap: 22px; }
.td-root .form-card { padding: 24px; }
.td-root .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.td-root .field { display: flex; flex-direction: column; gap: 8px; }
.td-root .field.full { grid-column: 1 / -1; }
.td-root .field label { font-size: 14px; color: #dce7f8; font-weight: 600; }
.td-root .field input, .td-root .field select, .td-root .field textarea {
  width: 100%; padding: 15px 16px; border-radius: 16px;
  border: 1px solid rgba(255,255,255,.10);
  background: rgba(255,255,255,.05); color: var(--text);
  outline: none; transition: .22s ease; font: inherit;
}
.td-root .field select {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8' fill='none'><path d='M1 1.5L6 6.5L11 1.5' stroke='%23b9c7dc' stroke-width='1.6' stroke-linecap='round'/></svg>");
  background-repeat: no-repeat; background-position: right 16px center; background-size: 12px;
  padding-right: 40px;
}
.td-root .field select option { background: #0f1e35; color: var(--text); }
.td-root .field input::placeholder, .td-root .field textarea::placeholder { color: #aab9cf; }
.td-root .field input:focus, .td-root .field select:focus, .td-root .field textarea:focus {
  border-color: rgba(125,227,255,.48);
  box-shadow: 0 0 0 4px rgba(125,227,255,.10);
}
.td-root .hint { color: var(--muted); font-size: 13px; }

.td-root .quote-card { padding: 24px; position: sticky; top: 96px; overflow: hidden; align-self: start; }
.td-root .quote-card::before {
  content: ""; position: absolute; inset: 0;
  background: radial-gradient(circle at top right, rgba(49,208,170,.16), transparent 36%);
  pointer-events: none;
}
.td-root .quote-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 18px; position: relative; z-index: 1; }
.td-root .badge {
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 999px;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.08);
  font-size: 13px; color: var(--accent-2);
}
.td-root .quote-live { color: #9db4d2; font-size: 13px; }
.td-root .quote-label { position: relative; z-index: 1; color: #cad8eb; font-size: 14px; }
.td-root .quote-value {
  font-size: clamp(36px, 6vw, 56px); font-weight: 900; letter-spacing: -0.04em;
  margin: 8px 0 10px; position: relative; z-index: 1;
}
.td-root .quote-meta { display: grid; gap: 10px; position: relative; z-index: 1; }
.td-root .quote-row {
  display: flex; justify-content: space-between; gap: 12px;
  padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.08);
  color: var(--muted);
}
.td-root .quote-row strong { color: var(--text); text-align: right; }
.td-root .tiny { font-size: 12px; color: var(--muted); line-height: 1.5; margin-top: 16px; position: relative; z-index: 1; }

.td-root .benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.td-root .benefit-card { padding: 22px; position: relative; overflow: hidden; }
.td-root .benefit-card::after {
  content: ""; position: absolute; inset: auto -20% -45% auto;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(49,208,170,.18), transparent 58%);
  pointer-events: none;
}
.td-root .icon {
  width: 50px; height: 50px; border-radius: 16px;
  display: grid; place-items: center;
  background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.10);
  margin-bottom: 14px; font-size: 22px;
}
.td-root .benefit-card h3 { margin: 0 0 8px; font-size: 20px; font-weight: 700; }
.td-root .benefit-card p { margin: 0; color: var(--muted); line-height: 1.65; }

.td-root .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.td-root .step { padding: 22px; }
.td-root .step-no {
  width: 42px; height: 42px; border-radius: 14px; display: grid; place-items: center;
  font-weight: 800; margin-bottom: 14px;
  background: linear-gradient(135deg, rgba(49,208,170,.18), rgba(125,227,255,.18));
  border: 1px solid rgba(125,227,255,.18); color: var(--accent-2);
}
.td-root .step h3 { margin: 0 0 10px; font-weight: 700; }
.td-root .step p { margin: 0; color: var(--muted); line-height: 1.65; }

.td-root .cta {
  padding: 26px; display: flex; align-items: center; justify-content: space-between;
  gap: 20px; margin-top: 18px;
}
.td-root .cta h3 { margin: 0 0 6px; font-size: 28px; font-weight: 800; }
.td-root .cta p { margin: 0; color: var(--muted); }

.td-root footer { padding: 30px 0 60px; color: var(--muted); font-size: 14px; }
.td-root .footer-line {
  display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  padding-top: 14px; border-top: 1px solid rgba(255,255,255,.08);
}
.td-root .footer-link { color: var(--accent-2); }
.td-root .footer-link:hover { text-decoration: underline; }
.td-root .footer-sep { color: rgba(255,255,255,.2); }

@media (max-width: 980px) {
  .td-root .hero-grid,
  .td-root .form-layout,
  .td-root .benefits,
  .td-root .steps { grid-template-columns: 1fr; }
  .td-root .phone-stage { min-height: 480px; }
  .td-root .quote-card { position: static; }
}
@media (max-width: 720px) {
  .td-root .nav-links a:not(.btn) { display: none; }
  .td-root .stats { grid-template-columns: 1fr; }
  .td-root .form-grid { grid-template-columns: 1fr; }
  .td-root .hero { padding-top: 42px; }
  .td-root .phone { width: min(290px, 75vw); }
  .td-root .chip-a, .td-root .chip-b, .td-root .chip-c, .td-root .chip-d { font-size: 12px; }
  .td-root .cta { flex-direction: column; align-items: flex-start; }
}
`;
