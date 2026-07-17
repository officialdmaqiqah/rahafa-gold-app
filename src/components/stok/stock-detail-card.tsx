import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";

interface StockDetailProps {
  batch: any;
  activePrice: any;
  minMargin: number;
  minMarginPercent?: number;
}

export function StockDetailCard({ batch, activePrice, minMargin, minMarginPercent = 0 }: StockDetailProps) {
  const retailPrice = activePrice?.retail_sell_price || 0;
  const costPrice = batch.cost_price;

  let statusText = "Tidak Ada Harga Aktif";
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "outline";
  let statusColor = "text-gray-600 border-gray-300";

  if (batch.quantity_remaining === 0) {
    statusText = "Sold Out";
    statusColor = "text-gray-500 border-gray-500 bg-gray-100";
  } else if (retailPrice > 0) {
    const profit = retailPrice - costPrice;
    const profitPercent = (profit / costPrice) * 100;
    
    if (profit < 0) {
      statusText = "Hold (Rugi)";
      statusColor = "text-red-700 border-red-200 bg-red-50/50";
      badgeVariant = "outline";
    } else if ((minMargin > 0 && profit < minMargin) || (minMarginPercent > 0 && profitPercent < minMarginPercent)) {
      statusText = "Margin Tipis";
      statusColor = "text-primary border-primary/20 bg-primary/10";
      badgeVariant = "outline";
    } else {
      statusText = "Aman Jual Umum";
      statusColor = "text-emerald-700 border-emerald-200 bg-emerald-50/50";
      badgeVariant = "outline";
    }
  }

  const dateIn = new Date(batch.date_in).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-slate-200 rounded-xl mb-3 bg-white hover:border-primary/50 hover:shadow-sm transition-all gap-3">
      <div className="grid gap-1 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{batch.quantity_remaining} pcs</span>
          <span className="text-muted-foreground text-sm">/ {batch.quantity_in} awal</span>
          <Badge variant={badgeVariant} className={statusColor}>{statusText}</Badge>
        </div>
        <div className="text-sm">
          Modal: <span className="font-medium">Rp {formatRupiah(costPrice)}</span>
        </div>
        <div className="text-xs text-muted-foreground">
          {dateIn} • {batch.source_type === "supplier" ? "Supplier: " + (batch.supplier_name || '-') : batch.source_type}
        </div>
      </div>
      
      {retailPrice > 0 && (
        <div className="text-right text-sm">
          <div className="text-muted-foreground">
            Profit: <span className={retailPrice - costPrice < 0 ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
              Rp {formatRupiah(retailPrice - costPrice)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Harga Aktif: Rp {formatRupiah(retailPrice)}
          </div>
        </div>
      )}
    </div>
  );
}
