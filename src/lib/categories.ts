import { PRODUCT_TYPES, getProductType } from "@/lib/product-types";

/** Alle reparatiecategorieën over alle productsoorten heen (uniek). */
export const REPAIR_CATEGORIES = Array.from(
  new Set(PRODUCT_TYPES.flatMap((p) => p.repairCategories)),
) as string[];

/** Categorieën voor één productsoort (bv. "phone"). */
export function categoriesForProduct(slug: string | null | undefined) {
  return getProductType(slug).repairCategories;
}

export type RepairCategory = string;
