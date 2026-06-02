import { REPAIR_CATEGORIES } from "@/lib/categories";

export type MarketEstimate = {
  low: number;
  high: number;
  label: string;
  note: string;
};

const DEFAULT_ESTIMATE: MarketEstimate = {
  low: 60,
  high: 180,
  label: "Veel reparaties zitten vaak rond €60 - €180",
  note: "De exacte prijs hangt af van model, onderdeelkwaliteit en extra schade.",
};

const ESTIMATES: Record<string, MarketEstimate> = {
  Schermreparatie: {
    low: 90,
    high: 320,
    label: "Schermreparaties zitten vaak rond €90 - €320",
    note: "Nieuwe modellen en originele/OLED-schermen zitten meestal hoger.",
  },
  "Accu / batterij": {
    low: 45,
    high: 120,
    label: "Batterijvervanging zit vaak rond €45 - €120",
    note: "De prijs hangt vooral af van toestelmodel en onderdeelkwaliteit.",
  },
  Camera: {
    low: 70,
    high: 180,
    label: "Camerareparaties zitten vaak rond €70 - €180",
    note: "Bij meerdere defecte camera's of lensschade kan dit hoger uitvallen.",
  },
  Laadpoort: {
    low: 50,
    high: 140,
    label: "Laadpoortreparaties zitten vaak rond €50 - €140",
    note: "Soms is schoonmaken genoeg; soms moet de poort vervangen worden.",
  },
  Waterschade: {
    low: 80,
    high: 350,
    label: "Waterschade is lastig: vaak €80 - €350+",
    note: "Bij waterschade is diagnose belangrijker dan direct een vaste prijs.",
  },
  "Speaker / microfoon": {
    low: 45,
    high: 150,
    label: "Speaker- en microfoonreparaties zitten vaak rond €45 - €150",
    note: "Soms is schoonmaken genoeg; soms moet het onderdeel vervangen worden.",
  },
  Knoppen: {
    low: 40,
    high: 130,
    label: "Knopreparaties zitten vaak rond €40 - €130",
    note: "De prijs hangt af van bereikbaarheid van het onderdeel in het toestel.",
  },
  "Gaat niet aan": {
    low: 60,
    high: 250,
    label: "Diagnose en reparatie zitten vaak rond €60 - €250+",
    note: "Bij toestellen die niet aangaan is eerst diagnose nodig.",
  },
  Software: {
    low: 30,
    high: 100,
    label: "Softwarehulp zit vaak rond €30 - €100",
    note: "Dat hangt af van back-up, herstel en databehoud.",
  },
  "iPhone inkoop": {
    low: 0,
    high: 0,
    label: "Inkoopwaarde hangt af van model, staat en batterijconditie",
    note: "Gebruik dit vooral voor indicaties; fysieke controle blijft belangrijk.",
  },
  Anders: DEFAULT_ESTIMATE,
};

export function getMarketEstimate(category?: string | null): MarketEstimate {
  if (!category) return DEFAULT_ESTIMATE;

  const exact = ESTIMATES[category];
  if (exact) return exact;

  const normalized = category.toLowerCase();
  const key = Object.keys(ESTIMATES).find((name) => normalized.includes(name.toLowerCase()));

  return key ? (ESTIMATES[key] ?? DEFAULT_ESTIMATE) : DEFAULT_ESTIMATE;
}

export function getBudgetSignal(category: string | null | undefined, budget: number | null) {
  if (budget == null) return null;
  const estimate = getMarketEstimate(category);

  if (estimate.low > 0 && budget < estimate.low * 0.75) {
    return {
      tone: "low" as const,
      title: "Budget lijkt erg laag",
      message:
        "Je mag dit plaatsen, maar reparateurs reageren sneller als je budget realistisch is of leeg blijft.",
    };
  }

  if (estimate.high > 0 && budget > estimate.high * 1.15) {
    return {
      tone: "high" as const,
      title: "Budget geeft ruimte",
      message: "Goed: reparateurs kunnen dan concurreren op prijs, snelheid en betrouwbaarheid.",
    };
  }

  return {
    tone: "ok" as const,
    title: "Budget lijkt realistisch",
    message: "Laat reparateurs alsnog concurreren; het laagste bod is niet altijd de beste keuze.",
  };
}

export function isKnownRepairCategory(category: string) {
  return REPAIR_CATEGORIES.includes(category as (typeof REPAIR_CATEGORIES)[number]);
}
