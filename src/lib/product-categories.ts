export type CategoryKey = 
  | "antam_certicard"
  | "antam_retro"
  | "minigold"
  | "microgold"
  | "dirham"
  | "perak";

export interface CategoryInfo {
  key: CategoryKey;
  label: string;
  unitLabel: string;
  badgeColor: string;
  iconType: "gold" | "silver";
  description: string;
}

export const CATEGORIES_CONFIG: CategoryInfo[] = [
  {
    key: "antam_certicard",
    label: "Antam Certicard",
    unitLabel: "per gram",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300",
    iconType: "gold",
    description: "Varian Antam Serticard (0.5g - 100g)"
  },
  {
    key: "antam_retro",
    label: "Antam Retro",
    unitLabel: "per gram",
    badgeColor: "bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300",
    iconType: "gold",
    description: "Varian Antam Retro (0.5g - 10g)"
  },
  {
    key: "minigold",
    label: "Minigold",
    unitLabel: "per gram",
    badgeColor: "bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300",
    iconType: "gold",
    description: "Varian Minigold Reguler (0.025g - 1.5g)"
  },
  {
    key: "microgold",
    label: "Microgold",
    unitLabel: "per gram",
    badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300",
    iconType: "gold",
    description: "Varian Micro Gold (0.1g - 0.25g)"
  },
  {
    key: "dirham",
    label: "Dirham",
    unitLabel: "per 1 Dirham",
    badgeColor: "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200",
    iconType: "silver",
    description: "Varian Dirham & Rupiya (1 Dirham / 3.11g)"
  },
  {
    key: "perak",
    label: "Perak (Silverium)",
    unitLabel: "per gram",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200",
    iconType: "silver",
    description: "Varian Silverium (Reguler, Palestine, Limited, Asmaul Husna)"
  }
];

export function matchProductCategory(product: { name: string; type?: string | null; category: string }): CategoryKey | null {
  const typeUpper = (product.type || "").toUpperCase().trim();
  const nameUpper = (product.name || "").toUpperCase().trim();

  // 1. Antam Retro
  if (typeUpper === "RETRO ANTAM" || typeUpper === "ANTAM RETRO" || nameUpper.includes("RETRO ANTAM")) {
    return "antam_retro";
  }
  // 2. Antam Certicard
  if (typeUpper === "ANTAM" || typeUpper === "ANTAM CERTICARD" || (product.category === "gold" && nameUpper.includes("ANTAM"))) {
    return "antam_certicard";
  }
  // 3. Minigold
  if (typeUpper.includes("MINIGOLD") || nameUpper.includes("MINIGOLD")) {
    return "minigold";
  }
  // 4. Microgold
  if (typeUpper.includes("MICRO") || nameUpper.includes("MICRO GOLD")) {
    return "microgold";
  }
  // 5. Dirham
  if (typeUpper.includes("DIRHAM") || typeUpper.includes("RUPIYA") || nameUpper.includes("DIRHAM") || nameUpper.includes("RUPIYA")) {
    return "dirham";
  }
  // 6. Perak
  if (product.category === "silver" || typeUpper.includes("SILVERIUM") || nameUpper.includes("SILVERIUM")) {
    return "perak";
  }

  return null;
}
