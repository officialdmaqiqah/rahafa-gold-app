"use client";

import { useState, useEffect, useRef } from "react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Printer, Search, Loader2, AlertTriangle, TrendingUp, RefreshCcw, Package, FileText, ArrowRight } from "lucide-react";
import { getReportSummary, getStockValuationReport } from "@/app/(dashboard)/laporan/actions";

export function LaporanClient() {
  const [activeTab, setActiveTab] = useState("transaksi");
  const printRef = useRef<HTMLDivElement>(null);

  // Filters
  const [startDate, setStartDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [endDate, setEndDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [trxType, setTrxType] = useState("all");

  // State Transaksi
  const [reportData, setReportData] = useState<any>(null);
  const [loadingTrx, setLoadingTrx] = useState(false);

  // State Valuasi Stok
  const [stockData, setStockData] = useState<any>(null);
  const [loadingStock, setLoadingStock] = useState(false);

  const fetchTransaksi = async () => {
    setLoadingTrx(true);
    const data = await getReportSummary(startDate, endDate, trxType);
    setReportData(data);
    setLoadingTrx(false);
  };

  const fetchStok = async () => {
    setLoadingStock(true);
    const data = await getStockValuationReport();
    setStockData(data);
    setLoadingStock(false);
  };

  useEffect(() => {
    fetchTransaksi();
  }, [startDate, endDate, trxType]);

  useEffect(() => {
    if (activeTab === "stok" && !stockData) {
      fetchStok();
    }
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    if (activeTab === "transaksi" && reportData?.itemsExport) {
      const headers = Object.keys(reportData.itemsExport[0] || {}).join(",");
      const rows = reportData.itemsExport.map((row: any) => Object.values(row).join(",")).join("\\n");
      const csv = `${headers}\\n${rows}`;
      downloadFile(csv, `Laporan_Transaksi_${startDate}_${endDate}.csv`, "text/csv");
    } else if (activeTab === "stok" && stockData?.stocks) {
      const isKasir = stockData.role === "kasir";
      const headers = isKasir 
        ? "Produk,Kode,Gramasi,Satuan,Qty Stok,Harga Umum,Harga Reseller,Harga Buyback,Status"
        : "Produk,Kode,Gramasi,Satuan,Qty Stok,Total Modal,Harga Umum,Harga Reseller,Harga Buyback,Potensi Profit Umum,Status";
      
      const rows = stockData.stocks.map((s: any) => {
        if (isKasir) {
          return `${s.name},${s.code},${s.weight},${s.unit},${s.total_qty},${s.prices.retail_sell_price},${s.prices.reseller_sell_price},${s.prices.buyback_price},${s.has_hold ? "HOLD" : "Aman"}`;
        } else {
          return `${s.name},${s.code},${s.weight},${s.unit},${s.total_qty},${s.total_modal},${s.prices.retail_sell_price},${s.prices.reseller_sell_price},${s.prices.buyback_price},${s.pot_profit_umum},${s.has_hold ? "HOLD" : "Aman"}`;
        }
      }).join("\\n");
      const csv = `${headers}\\n${rows}`;
      downloadFile(csv, `Valuasi_Stok_${new Date().toLocaleDateString('en-CA')}.csv`, "text/csv");
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSetBulanIni = () => {
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-CA');
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toLocaleDateString('en-CA');
    setStartDate(firstDay);
    setEndDate(lastDay);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="transaksi">Rekap Transaksi</TabsTrigger>
            <TabsTrigger value="stok">Valuasi Stok Akhir</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={handlePrint} className="bg-white flex-1 md:flex-none">
            <Printer className="mr-2 h-4 w-4" /> Print PDF
          </Button>
          <Button variant="outline" onClick={exportCSV} className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 flex-1 md:flex-none">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div id="print-area" className="print:block">
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold text-[#294376] dark:text-white">LAPORAN {reportData?.settings?.store_name?.toUpperCase() || 'RAHAFA GOLD'}</h1>
          <p className="text-muted-foreground">{activeTab === "transaksi" ? `Periode: ${startDate} s/d ${endDate}` : `Tanggal: ${new Date().toLocaleDateString('id-ID')}`}</p>
        </div>

        {activeTab === "transaksi" && (
          <div className="space-y-6">
            <Card className="print:hidden border-blue-100 shadow-sm">
              <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Mulai Tanggal</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Sampai Tanggal</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                <div className="space-y-2 min-w-0">
                  <Label>Jenis Transaksi</Label>
                  <div>
                    <Select value={trxType} onValueChange={(val) => setTrxType(val || "all")} items={[{value:'all',label:'Semua Transaksi'},{value:'sale_general',label:'Penjualan Umum'},{value:'sale_reseller',label:'Penjualan Reseller'},{value:'buyback',label:'Pembelian Buyback'}]}>
                      <SelectTrigger>
                        <SelectValue placeholder="Semua Jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Transaksi</SelectItem>
                        <SelectItem value="sale_general">Penjualan Umum</SelectItem>
                        <SelectItem value="sale_reseller">Penjualan Reseller</SelectItem>
                        <SelectItem value="buyback">Pembelian Buyback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={handleSetBulanIni} className="w-full h-8">
                  Set Bulan Ini
                </Button>
              </CardContent>
            </Card>

            {loadingTrx || !reportData ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Card className="bg-blue-50/50">
                    <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Jual Umum</CardTitle></CardHeader>
                    <CardContent><div className="text-lg font-bold text-blue-700">Rp {formatRupiah(reportData.summary.totalSalesGeneral)}</div></CardContent>
                  </Card>
                  <Card className="bg-indigo-50/50">
                    <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Jual Reseller</CardTitle></CardHeader>
                    <CardContent><div className="text-lg font-bold text-indigo-700">Rp {formatRupiah(reportData.summary.totalSalesReseller)}</div></CardContent>
                  </Card>
                  <Card className="bg-primary/5">
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-slate-500">Total Buyback</CardTitle></CardHeader>
                    <CardContent><div className="text-lg font-bold text-primary">Rp {formatRupiah(reportData.summary.totalBuyback)}</div></CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">Piutang (Gantung)</CardTitle></CardHeader>
                    <CardContent><div className="text-lg font-bold text-red-600">Rp {formatRupiah(reportData.summary.totalPiutang)}</div></CardContent>
                  </Card>

                  {reportData.role !== "kasir" && (
                    <>
                      <Card className="bg-emerald-50/50 border-emerald-200">
                        <CardHeader className="pb-2"><CardTitle className="text-xs text-emerald-700">Laba Kotor (Gross Profit)</CardTitle></CardHeader>
                        <CardContent><div className="text-lg font-bold text-emerald-700">Rp {formatRupiah(reportData.summary.totalProfit)}</div></CardContent>
                      </Card>
                      <Card className="bg-rose-50/50 border-rose-200">
                        <CardHeader className="pb-2"><CardTitle className="text-xs text-rose-700">Total Biaya Operasional</CardTitle></CardHeader>
                        <CardContent><div className="text-lg font-bold text-rose-700">-Rp {formatRupiah(reportData.summary.totalOperationalCosts)}</div></CardContent>
                      </Card>
                      <Card className="bg-emerald-50/50 border-emerald-200">
                        <CardHeader className="pb-2"><CardTitle className="text-xs text-emerald-700">Pendapatan Lain-lain</CardTitle></CardHeader>
                        <CardContent><div className="text-lg font-bold text-emerald-700">+Rp {formatRupiah(reportData.summary.totalOtherIncomes)}</div></CardContent>
                      </Card>
                      <Card className="bg-emerald-100 border-emerald-300">
                        <CardHeader className="pb-2"><CardTitle className="text-xs font-bold text-emerald-800">LABA BERSIH (Net Profit)</CardTitle></CardHeader>
                        <CardContent><div className="text-lg font-bold text-emerald-800">Rp {formatRupiah(reportData.summary.totalProfit - reportData.summary.totalOperationalCosts + reportData.summary.totalOtherIncomes)}</div></CardContent>
                      </Card>
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 border rounded-lg text-center space-y-1 bg-white">
                    <FileText className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
                    <div className="text-2xl font-bold">{reportData.summary.totalTransactions}</div>
                    <div className="text-xs text-muted-foreground">Nota Diterbitkan</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center space-y-1 bg-white">
                    <ArrowRight className="h-5 w-5 mx-auto text-blue-500 mb-2" />
                    <div className="text-2xl font-bold">{reportData.summary.goodsOut} pcs</div>
                    <div className="text-xs text-muted-foreground">Barang Keluar (Jual)</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center space-y-1 bg-white">
                    <Package className="h-5 w-5 mx-auto text-purple-500 mb-2" />
                    <div className="text-2xl font-bold">{reportData.summary.goodsInSupplier} pcs</div>
                    <div className="text-xs text-muted-foreground">Brg Masuk (Supplier)</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center space-y-1 bg-white">
                    <RefreshCcw className="h-5 w-5 mx-auto text-primary mb-2" />
                    <div className="text-2xl font-bold">{reportData.summary.goodsInBuyback} pcs</div>
                    <div className="text-xs text-muted-foreground">Brg Masuk (Buyback)</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2 pt-0 overflow-hidden">
                    <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
                      <CardTitle className="text-white">Riwayat Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto p-0">
                      <table className="w-full text-sm">
                        <thead className="bg-[#294376] text-white">
                          <tr>
                            <th className="p-3 text-left">No Nota</th>
                            <th className="p-3 text-left">Tgl & Pelanggan</th>
                            <th className="p-3 text-right">Nilai Total</th>
                            {reportData.role !== "kasir" && <th className="p-3 text-right">Profit</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {reportData.transactions.map((trx: any) => (
                            <tr key={trx.id}>
                              <td className="p-3">
                                <div className="font-medium">{trx.transaction_number}</div>
                                <div className="text-xs text-muted-foreground">
                                  {trx.transaction_type === 'sale_general' ? 'Jual Umum' : trx.transaction_type === 'sale_reseller' ? 'Reseller' : 'Buyback'}
                                </div>
                              </td>
                              <td className="p-3">
                                <div>{trx.customer_name}</div>
                                <div className="text-xs text-muted-foreground">{new Date(trx.transaction_date).toLocaleDateString('id-ID')}</div>
                              </td>
                              <td className="p-3 text-right font-medium">Rp {formatRupiah(trx.total_amount)}</td>
                              {reportData.role !== "kasir" && (
                                <td className="p-3 text-right text-emerald-600">
                                  {trx.transaction_type === 'buyback' ? '-' : `Rp ${formatRupiah(trx.profit)}`}
                                </td>
                              )}
                            </tr>
                          ))}
                          {reportData.transactions.length === 0 && (
                            <tr><td colSpan={5} className="text-center p-4 text-muted-foreground">Tidak ada transaksi</td></tr>
                          )}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                  
                  <Card className="pt-0 overflow-hidden">
                    <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
                      <CardTitle className="text-white">Produk Terlaris</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-4">
                        {reportData.topProducts.map((p: any, i: number) => (
                          <li key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                            <span className="truncate pr-2">{p.name}</span>
                            <span className="font-bold bg-slate-100 px-2 rounded-lg">{p.qty} pcs</span>
                          </li>
                        ))}
                        {reportData.topProducts.length === 0 && (
                          <li className="text-center text-muted-foreground text-sm">Tidak ada penjualan</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "stok" && (
          <div className="space-y-6">
            {loadingStock || !stockData ? (
              <div className="flex justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <Card className="pt-0 overflow-hidden">
                <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
                  <CardTitle className="text-white">Valuasi & Sisa Stok Akhir</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-[#294376] text-white">
                      <tr>
                        <th className="p-3 text-left">Produk</th>
                        <th className="p-3 text-center">Qty Sisa</th>
                        {stockData.role !== "kasir" && <th className="p-3 text-right">Nilai Modal Total</th>}
                        <th className="p-3 text-right text-blue-200">H.Umum/pc</th>
                        <th className="p-3 text-right text-indigo-200">H.Reseller/pc</th>
                        <th className="p-3 text-center">Status</th>
                        {stockData.role !== "kasir" && <th className="p-3 text-right">Potensi Profit (Umum)</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stockData.stocks.map((s: any, i: number) => (
                        <tr key={i}>
                          <td className="p-3">
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-muted-foreground">{s.code} - {s.weight}{s.unit}</div>
                          </td>
                          <td className="p-3 text-center font-bold text-lg">{s.total_qty}</td>
                          {stockData.role !== "kasir" && <td className="p-3 text-right">Rp {formatRupiah(s.total_modal)}</td>}
                          <td className="p-3 text-right text-blue-700 bg-blue-50/30">Rp {formatRupiah(s.prices.retail_sell_price)}</td>
                          <td className="p-3 text-right text-indigo-700 bg-indigo-50/30">Rp {formatRupiah(s.prices.reseller_sell_price)}</td>
                          <td className="p-3 text-center">
                            {s.has_hold ? (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">HOLD</span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">AMAN</span>
                            )}
                          </td>
                          {stockData.role !== "kasir" && (
                            <td className={`p-3 text-right font-medium ${s.pot_profit_umum < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              Rp {formatRupiah(s.pot_profit_umum)}
                            </td>
                          )}
                        </tr>
                      ))}
                      {stockData.stocks.length === 0 && (
                        <tr><td colSpan={8} className="text-center p-4 text-muted-foreground">Tidak ada stok</td></tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { size: landscape; }
        }
      `}} />
    </div>
  );
}
