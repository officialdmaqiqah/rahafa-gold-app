import { supabase } from "@/lib/supabase";

export interface StorefrontProduct {
  id: string;
  item_code: string;
  system_code: string;
  name: string;
  category: string; // 'gold' | 'silver'
  type: string;     // 'ANTAM', 'RETRO ANTAM', 'MINIGOLD REGULER', 'DIRHAM ABA', 'SILVERIUM REGULER', etc.
  weight: number;
  unit: string;
  retail_price: number;
  buyback_price: number;
  tax: number;
  total_price: number;
  is_active: boolean;
  tag?: string;
  badge?: string;
  image_url: string;
}

export interface StorefrontData {
  products: StorefrontProduct[];
  benchmark1g: number;
  benchmarkBuyback1g: number;
  gold10g: StorefrontProduct | null;
  dirham1: StorefrontProduct | null;
  lastUpdatedText: string;
  sessionName: string;
  date: string;
}

export function getProductImage(product: { category?: string; type?: string; weight?: number; name?: string }): string {
  const type = (product.type || "").toUpperCase();
  const name = (product.name || "").toUpperCase();
  const category = (product.category || "").toLowerCase();
  const weight = Number(product.weight) || 0;

  // 1. Antam CertiCard (New Reinvented CertiCard)
  if (type === "ANTAM" || (name.includes("ANTAM") && !type.includes("RETRO") && !name.includes("RETRO"))) {
    if (weight === 1) return "/images/products/antam_1g_certicard.jpg";
    if (weight === 5) return "/images/products/antam_5g_certicard.jpg";
    if (weight === 10) return "/images/products/antam_10g_certicard.jpg";
    if (weight >= 25) return "/images/products/antam_25g_vault.jpg";
    return "/images/products/antam_certicard.jpg";
  }

  // 2. Retro Antam (Antam Klasik Potrait dengan Sertifikat)
  if (type.includes("RETRO") || name.includes("RETRO")) {
    return "/images/products/retro_antam.jpg";
  }

  // 3. MiniGold & Micro Gold (Kemasan Kartu 24K)
  if (type.includes("MINIGOLD") || type.includes("MICRO") || name.includes("MINIGOLD") || name.includes("MICRO")) {
    return "/images/products/minigold_card.jpg";
  }

  // 4. Koin Dirham & Rupiya (Perak Murni Syariah)
  if (type.includes("DIRHAM") || type.includes("RUPIYA") || name.includes("DIRHAM") || name.includes("RUPIYA")) {
    return "/images/products/dirham_perak.jpg";
  }

  // 5. Perak Silverium (Batangan Perak Murni 99.9%)
  if (category === "silver" || type.includes("SILVERIUM") || name.includes("SILVERIUM")) {
    return "/images/products/silverium_bar.jpg";
  }

  // Default
  return "/images/products/antam_certicard.jpg";
}

export async function getStorefrontData(): Promise<StorefrontData> {
  try {
    // 1. Fetch latest active session in daily_prices
    const { data: latestActiveSession } = await supabase
      .from("daily_prices")
      .select("date, session_name, created_at")
      .eq("status", "active")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(1);

    const activeDate = latestActiveSession?.[0]?.date || new Date().toISOString().split("T")[0];
    const activeSession = latestActiveSession?.[0]?.session_name || "Sesi 1";

    // 2. Fetch products and prices for that active date and session
    const [
      { data: rawProducts, error: prodErr },
      { data: rawPrices, error: priceErr }
    ] = await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("weight", { ascending: true }),
      supabase
        .from("daily_prices")
        .select("*")
        .eq("date", activeDate)
        .eq("session_name", activeSession)
        .eq("status", "active")
    ]);

    if (prodErr) console.error("Error fetching products for storefront:", prodErr);
    if (priceErr) console.error("Error fetching daily_prices for storefront:", priceErr);

    const priceMap = new Map<string, any>();
    if (rawPrices && rawPrices.length > 0) {
      rawPrices.forEach((p) => {
        priceMap.set(p.product_id, p);
      });
    }

    // 3. Map products with real prices and real images
    const products: StorefrontProduct[] = (rawProducts || [])
      .map((p) => {
        const priceRow = priceMap.get(p.id);
        const retailPrice = Number(priceRow?.retail_sell_price) || 0;
        
        let buybackPrice = Number(priceRow?.buyback_price) || 0;
        if (!buybackPrice && retailPrice > 0) {
          const ratio = p.category === "silver" ? 0.85 : 0.92;
          buybackPrice = Math.round((retailPrice * ratio) / 1000) * 1000;
        }

        const tax = Math.round(retailPrice * 0.0025);
        const totalPrice = retailPrice + tax;

        let tag = "";
        let badge = p.category === "gold" ? "999.9 24K" : "Fine Silver 99.9%";
        const cleanType = (p.type || "").trim().toUpperCase();

        if (cleanType.includes("ANTAM") && p.weight === 10) {
          tag = "Signature Terlaris";
        } else if (cleanType.includes("ANTAM") && p.weight === 1) {
          tag = "Paling Populer";
        } else if (cleanType.includes("DIRHAM")) {
          tag = "Muamalah & Mahar";
          badge = "Perak Murni";
        } else if (cleanType.includes("MINIGOLD") && p.weight <= 0.1) {
          tag = "Mulai Menabung";
        } else if (cleanType.includes("SILVERIUM") && cleanType.includes("LIMITED")) {
          tag = "Edisi Kolektor";
        }

        const imageUrl = getProductImage(p);

        return {
          id: p.id,
          item_code: p.item_code || "",
          system_code: p.system_code || "",
          name: p.name,
          category: (p.category || "gold").toLowerCase(),
          type: (p.type || "ANTAM").trim(),
          weight: Number(p.weight) || 0,
          unit: p.unit || "gram",
          retail_price: retailPrice,
          buyback_price: buybackPrice,
          tax,
          total_price: totalPrice,
          is_active: Boolean(p.is_active),
          tag,
          badge,
          image_url: imageUrl,
        };
      })
      .filter((p) => p.retail_price > 0);

    // 4. Determine Benchmark 1 Gram Price
    const antam1g = products.find(
      (p) => p.weight === 1 && p.type.toUpperCase().includes("ANTAM") && !p.name.toLowerCase().includes("sale")
    ) || products.find((p) => p.weight === 1 && p.category === "gold") || products[0];

    const benchmark1g = antam1g ? antam1g.retail_price : 2818000;
    const benchmarkBuyback1g = antam1g ? antam1g.buyback_price : Math.round(benchmark1g * 0.92);

    // Find 10g Gold
    const gold10g = products.find(
      (p) => p.weight === 10 && p.type.toUpperCase().includes("ANTAM") && !p.name.toLowerCase().includes("sale")
    ) || products.find((p) => p.weight === 10) || null;

    // Find Dirham
    const dirham1 = products.find(
      (p) => p.type.toUpperCase().includes("DIRHAM") && p.weight <= 3.5
    ) || products.find((p) => p.category === "silver") || null;

    // Format date text
    const dateObj = new Date(activeDate);
    const dateFormatted = dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      products,
      benchmark1g,
      benchmarkBuyback1g,
      gold10g,
      dirham1,
      lastUpdatedText: `${dateFormatted} (${activeSession})`,
      sessionName: activeSession,
      date: activeDate,
    };
  } catch (error) {
    console.error("Fatal error in getStorefrontData:", error);
    return {
      products: [],
      benchmark1g: 2818000,
      benchmarkBuyback1g: 2593000,
      gold10g: null,
      dirham1: null,
      lastUpdatedText: "Hari ini (Sesi 1)",
      sessionName: "Sesi 1",
      date: new Date().toISOString().split("T")[0],
    };
  }
}

export async function getProductDetail(idOrCode: string): Promise<{ product: StorefrontProduct | null; relatedProducts: StorefrontProduct[] }> {
  const { products } = await getStorefrontData();

  let target = products.find((p) => p.id === idOrCode || p.item_code.toLowerCase() === idOrCode.toLowerCase());

  if (!target && (idOrCode === "10g" || idOrCode === "10")) {
    target = products.find((p) => p.weight === 10 && p.type.toUpperCase().includes("ANTAM")) || products.find((p) => p.weight === 10);
  } else if (!target && (idOrCode === "1g" || idOrCode === "1")) {
    target = products.find((p) => p.weight === 1 && p.type.toUpperCase().includes("ANTAM")) || products.find((p) => p.weight === 1);
  } else if (!target && (idOrCode === "5g" || idOrCode === "5")) {
    target = products.find((p) => p.weight === 5 && p.type.toUpperCase().includes("ANTAM")) || products.find((p) => p.weight === 5);
  }

  if (!target && products.length > 0) {
    target = products[0];
  }

  const related = products
    .filter((p) => p.id !== target?.id && p.category === target?.category)
    .slice(0, 3);

  return {
    product: target || null,
    relatedProducts: related,
  };
}
