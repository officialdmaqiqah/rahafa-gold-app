import React from "react";
import { notFound } from "next/navigation";
import { getProductDetail } from "@/lib/storefront-data";
import { StorefrontHeader } from "@/components/storefront/storefront-header";
import { StorefrontFooter } from "@/components/storefront/storefront-footer";
import { ProductDetailView } from "@/components/storefront/product-detail-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { product, relatedProducts } = await getProductDetail(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-slate-900 flex flex-col selection:bg-amber-200 selection:text-slate-900">
      <StorefrontHeader
        buyPrice={product.total_price}
        buybackPrice={product.buyback_price}
      />

      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
      />

      <StorefrontFooter />
    </div>
  );
}
