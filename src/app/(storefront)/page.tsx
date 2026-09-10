import React from "react";
import { getStorefrontData } from "@/lib/storefront-data";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { HeroSection } from "@/components/storefront/hero-section";
import { TrustBar } from "@/components/storefront/trust-bar";
import { LivePriceBoard } from "@/components/storefront/live-price-board";
import { CertificateChecker } from "@/components/storefront/certificate-checker";
import { ProductCatalog } from "@/components/storefront/product-catalog";
import { SavingsCalculator } from "@/components/storefront/savings-calculator";
import { BoutiqueAndReviews } from "@/components/storefront/boutique-and-reviews";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StorefrontPage() {
  const data = await getStorefrontData();

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-slate-900 flex flex-col selection:bg-amber-200 selection:text-slate-900">
      {/* 1. Header with Live Ticker connected to Supabase */}
      <StorefrontHeader
        buyPrice={data.benchmark1g}
        buybackPrice={data.benchmarkBuyback1g}
        lastUpdated={data.lastUpdatedText}
      />

      {/* 2. Main Storefront Flow */}
      <main className="flex-1 w-full">
        {/* Hero Section with actual featured items & live prices */}
        <HeroSection
          featuredGold={data.gold10g}
          featuredSilver={data.dirham1}
          gold10gPrice={data.gold10g?.retail_price || 25990000}
          dinarPrice={data.dirham1?.retail_price || 159000}
        />

        {/* 4 Pillars Trust Highlights */}
        <TrustBar />

        {/* Live Price Board with real database matrix table */}
        <LivePriceBoard
          products={data.products}
          baseBuyPerGram={data.benchmark1g}
          baseBuybackPerGram={data.benchmarkBuyback1g}
          lastUpdatedText={data.lastUpdatedText}
        />

        {/* Certificate & Serial Authenticity Checker */}
        <CertificateChecker />

        {/* Curated Product Catalog displaying actual products & daily prices */}
        <ProductCatalog
          products={data.products}
        />

        {/* Gold Savings & Investment Projection Calculator */}
        <SavingsCalculator
          baseGoldPerGram={data.benchmark1g}
        />

        {/* Boutique, Why Choose Us, & Testimonials */}
        <BoutiqueAndReviews />
      </main>

      {/* 3. Luxury Storefront Footer */}
      <StorefrontFooter />
    </div>
  );
}
