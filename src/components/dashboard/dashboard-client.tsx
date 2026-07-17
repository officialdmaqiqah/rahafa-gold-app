"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { ArrowUpRight, DollarSign, Package, AlertTriangle, FileText, Download, Users, TrendingUp, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { GreetingBanner } from "./greeting-banner";

interface DashboardClientProps {
  data: any;
}

export function DashboardClient({ data }: DashboardClientProps) {
  const { role, summary, recentTransactions, topProducts, topHoldStocks } = data;
  const isAdmin = role !== "kasir";

  return (
    <div className="space-y-6">
      <GreetingBanner role={role} />
      


      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Penjualan (Umum)</CardTitle>
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Rp {formatRupiah(summary.salesGeneralToday)}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Omset hari ini</p>
          </CardContent>
        </Card>
        <Card className="glass-panel rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-700/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Penjualan (Reseller)</CardTitle>
            <div className="p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Rp {formatRupiah(summary.salesResellerToday)}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Omset hari ini</p>
          </CardContent>
        </Card>
        <Card className="glass-panel rounded-2xl border-none ring-1 ring-primary/30 bg-primary/5 relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-primary">Keluar (Buyback)</CardTitle>
            <div className="p-1.5 bg-primary/20 rounded-lg text-primary border border-primary/20">
              <RefreshIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold tracking-tight text-primary">Rp {formatRupiah(summary.buybackToday)}</div>
            <p className="text-xs text-primary/70 mt-1 font-medium">Pembelian kembali hari ini</p>
          </CardContent>
        </Card>
        {isAdmin ? (
          <Card className="rounded-2xl border-none shadow-xl shadow-primary/20 bg-primary overflow-hidden relative group text-primary-foreground">
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/20 blur-xl group-hover:bg-white/30 transition-colors"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-semibold">Estimasi Profit</CardTitle>
              <div className="p-1.5 bg-white/20 rounded-lg">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-2xl font-bold tracking-tight">Rp {formatRupiah(summary.estimatedProfitToday)}</div>
              <p className="text-xs opacity-80 mt-1 font-semibold">Total profit kotor hari ini</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-panel rounded-2xl border-none ring-1 ring-slate-200 dark:ring-slate-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Transaksi</CardTitle>
              <div className="p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{summary.transactionsCountToday}</div>
              <p className="text-xs text-slate-500 mt-1 font-medium">Nota diterbitkan hari ini</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Stok Berstatus HOLD</CardTitle>
            <AlertTriangle className={summary.holdStockCount > 0 ? "h-4 w-4 text-red-400" : "h-4 w-4 text-slate-600"} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.holdStockCount > 0 ? "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" : "text-slate-900 dark:text-slate-100"}`}>
              {summary.holdStockCount}
            </div>
            <p className="text-xs text-slate-500 mt-1">Batch dengan harga jual &lt; modal</p>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Piutang</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">Rp {formatRupiah(summary.totalReceivables)}</div>
            <p className="text-xs text-slate-500 mt-1">Pembayaran yang belum lunas</p>
          </CardContent>
        </Card>
        {isAdmin && (
          <Card className="glass-panel lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">Transaksi (Hari Ini)</CardTitle>
              <FileText className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{summary.transactionsCountToday}</div>
              <p className="text-xs text-slate-500 mt-1">Total struk/nota diterbitkan</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tables Section */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="md:col-span-2 rounded-2xl border-none shadow-sm ring-1 ring-slate-200 pt-0 overflow-hidden">
          <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
            <CardTitle className="flex items-center gap-2 text-white"><Clock className="w-5 h-5 text-white/80" /> Riwayat Transaksi Terakhir</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800/50">
              {recentTransactions.map((trx: any) => (
                <div key={trx.id} className="flex items-center justify-between p-4 hover:bg-slate-100 dark:bg-slate-800/30 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none mb-1">
                      {trx.transaction_number} - {trx.customers?.name || "Umum"}
                    </p>
                    <div className="flex gap-2 items-center text-[11px] font-medium mt-2">
                      {trx.status === 'cancelled' ? (
                        <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full ring-1 ring-red-500/20">Batal</span>
                      ) : trx.transaction_type === 'sale_general' ? (
                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full ring-1 ring-slate-300 dark:ring-slate-600">Umum</span>
                      ) : trx.transaction_type === 'sale_reseller' ? (
                        <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full ring-1 ring-indigo-500/20">Reseller</span>
                      ) : (
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full ring-1 ring-primary/20">Buyback</span>
                      )}
                      <span className="text-slate-500">{new Date(trx.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-sm font-bold tracking-tight ${trx.transaction_type === 'buyback' ? 'text-primary' : 'text-slate-800 dark:text-slate-200'} ${trx.status === 'cancelled' ? 'line-through opacity-50' : ''}`}>
                      Rp {formatRupiah(trx.total_amount)}
                    </div>
                    <Link href={trx.transaction_type === 'buyback' ? `/buyback/${trx.id}` : `/invoice/${trx.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary rounded-full hover:bg-primary/10">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {recentTransactions.length === 0 && (
                <div className="text-center text-slate-500 py-8 text-sm font-medium">Belum ada transaksi hari ini</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products / Hold */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-none shadow-sm ring-1 ring-slate-200 pt-0 overflow-hidden">
            <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-white"><TrendingUp className="w-4 h-4 text-white/80" /> Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {topProducts.map((p: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="truncate pr-2 text-slate-700 dark:text-slate-300">{p.name}</span>
                    <span className="font-medium bg-slate-100 dark:bg-slate-800 text-primary px-2 rounded-full ring-1 ring-primary/30">{p.qty} pcs</span>
                  </div>
                ))}
                {topProducts.length === 0 && (
                  <div className="text-xs text-slate-500">Belum ada data</div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {topHoldStocks.length > 0 && (
            <Card className="glass-panel pt-0 gap-0 border-red-500/30 shadow-[0_0_15px_rgba(248,113,113,0.1)] overflow-hidden">
              <CardHeader className="pt-4 pb-3 px-4 bg-red-500/10 rounded-t-xl border-b border-red-500/20 m-0">
                <CardTitle className="text-sm text-red-500 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Stok Prioritas HOLD
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pb-4">
                <div className="space-y-4">
                  {topHoldStocks.map((h: any, i: number) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="truncate pr-2">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{h.name}</div>
                        <div className="text-[10px] text-red-400/80 mt-0.5">Harga: {formatRupiah(h.active_price)} &lt; Modal: {formatRupiah(h.cost_price)}</div>
                      </div>
                      <span className="font-bold text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.3)]">{h.qty} pcs</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// Temporary icon component since standard lucide-react doesn't have RefreshIcon explicitly as named, using RefreshCcw
function RefreshIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}
