export const REPAIR_CATEGORIES = [
  "Schermreparatie",
  "Accu / batterij",
  "Laadpoort",
  "Camera",
  "Speaker / microfoon",
  "Knoppen",
  "Waterschade",
  "Gaat niet aan",
  "Software",
  "iPhone inkoop",
  "Anders",
] as const;

export type RepairCategory = (typeof REPAIR_CATEGORIES)[number];
