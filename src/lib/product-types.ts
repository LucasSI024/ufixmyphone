/**
 * Productsoort-registry.
 *
 * Repaireally start met telefoons, maar alle flows (reparatie + verkoop)
 * werken via deze registry zodat een nieuwe productsoort alleen hier —
 * en in de `product_types`-tabel — hoeft te worden toegevoegd.
 */

export type ListingType = "repair" | "sell";
export type OfferType = "repair" | "buy";

export type ProductTypeSlug = "phone" | "tablet" | "laptop" | "smartwatch" | "console";

export type ProductTypeDef = {
  slug: ProductTypeSlug;
  /** enkelvoud, bv. "telefoon" */
  name: string;
  /** meervoud, bv. "telefoons" */
  plural: string;
  /** lucide icon-naam */
  icon: string;
  /** alleen actieve soorten zijn zichtbaar in de UI */
  isActive: boolean;
  sortOrder: number;
  /** reparatiecategorieën die bij deze productsoort horen */
  repairCategories: readonly string[];
};

const GENERIC_CATEGORIES = ["Scherm", "Accu / batterij", "Laadpoort", "Software", "Anders"] as const;

export const PRODUCT_TYPES: readonly ProductTypeDef[] = [
  {
    slug: "phone",
    name: "telefoon",
    plural: "telefoons",
    icon: "smartphone",
    isActive: true,
    sortOrder: 10,
    repairCategories: [
      "Schermreparatie",
      "Accu / batterij",
      "Laadpoort",
      "Camera",
      "Speaker / microfoon",
      "Knoppen",
      "Waterschade",
      "Gaat niet aan",
      "Software",
      "Anders",
    ],
  },
  { slug: "tablet", name: "tablet", plural: "tablets", icon: "tablet", isActive: false, sortOrder: 20, repairCategories: GENERIC_CATEGORIES },
  { slug: "laptop", name: "laptop", plural: "laptops", icon: "laptop", isActive: false, sortOrder: 30, repairCategories: [...GENERIC_CATEGORIES, "Toetsenbord"] },
  { slug: "smartwatch", name: "smartwatch", plural: "smartwatches", icon: "watch", isActive: false, sortOrder: 40, repairCategories: GENERIC_CATEGORIES },
  { slug: "console", name: "spelcomputer", plural: "spelcomputers", icon: "gamepad-2", isActive: false, sortOrder: 50, repairCategories: GENERIC_CATEGORIES },
];

export const DEFAULT_PRODUCT_TYPE: ProductTypeSlug = "phone";

export const ACTIVE_PRODUCT_TYPES = PRODUCT_TYPES.filter((p) => p.isActive);

export function getProductType(slug: string | null | undefined): ProductTypeDef {
  return PRODUCT_TYPES.find((p) => p.slug === slug) ?? PRODUCT_TYPES[0];
}

export function repairCategoriesFor(slug: string | null | undefined) {
  return getProductType(slug).repairCategories;
}

/** Labels per listing type — gebruikt in feed, detailpagina en notificaties. */
export const LISTING_LABELS: Record<ListingType, {
  title: string;
  short: string;
  offerNoun: string;
  offerNounPlural: string;
  offerVerb: string;
  emptyHint: string;
}> = {
  repair: {
    title: "Reparatieaanvraag",
    short: "Reparatie",
    offerNoun: "reparatieofferte",
    offerNounPlural: "reparatieoffertes",
    offerVerb: "Offerte uitbrengen",
    emptyHint: "Nog geen offertes. Reparateurs zien je aanvraag nu.",
  },
  sell: {
    title: "Te koop aangeboden",
    short: "Verkoop",
    offerNoun: "inkoopbod",
    offerNounPlural: "inkoopbiedingen",
    offerVerb: "Inkoopbod doen",
    emptyHint: "Nog geen inkoopbiedingen. Aangesloten bedrijven zien je toestel nu.",
  },
};

export type InspectionStatus = "not_started" | "awaiting_inspection" | "confirmed" | "deviated" | "paid";
export type RevisedResponse = "none" | "pending" | "accepted" | "rejected";

export const INSPECTION_LABELS: Record<InspectionStatus, string> = {
  not_started: "Nog niet gecontroleerd",
  awaiting_inspection: "Wacht op controle",
  confirmed: "Conditie klopt",
  deviated: "Conditie wijkt af",
  paid: "Uitbetaald",
};
