"use client";

import { useState, useEffect } from "react";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search, XCircle, AlertTriangle, ArrowLeftRight } from "lucide-react";
import { getTransactionHistory, voidTransaction } from "@/app/(dashboard)/riwayat/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function RiwayatClient() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");

  // Void state
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [voiding, setVoiding] = useState(false);
  const [voidError, setVoidError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const history = await getTransactionHistory(200); // Ambil 200 transaksi terakhir
      setData(history);
      setFilteredData(history);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    let result = data;
    if (filterType !== "all") {
      result = result.filter(item => item.type === filterType);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(item => 
        item.title?.toLowerCase().includes(q) || 
        item.description?.toLowerCase().includes(q)
      );
    }
    setFilteredData(result);
  }, [filterType, search, data]);

  const handleOpenVoid = (item: any) => {
    setSelectedItem(item);
    setVoidError("");
    setVoidModalOpen(true);
  };

  const handleConfirmVoid = async () => {
    if (!selectedItem) return;
    setVoiding(true);
    setVoidError("");

    const res = await voidTransaction(selectedItem.id, selectedItem.type);
    
    if (res?.error) {
      setVoidError(res.error);
      setVoiding(false);
    } else {
      setVoiding(false);
      setVoidModalOpen(false);
      setSelectedItem(null);
      fetchData(); // Refresh data
    }
  };

  const getTypeBadge = (type: string, status: string) => {
    if (status === "cancelled") {
      return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Dibatalkan</span>;
    }
    switch (type) {
      case "sale_general": return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Jual Umum</span>;
      case "sale_reseller": return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Jual Reseller</span>;
      case "buyback": return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">Buyback</span>;
      case "stock_in": return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Masuk</span>;
      default: return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{type}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm ring-1 ring-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-[#294376] flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            Daftar Riwayat Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Cari No. Transaksi, pelanggan, atau barang..." 
                className="pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={filterType} onValueChange={(v) => setFilterType(v || "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Semua Transaksi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Transaksi</SelectItem>
                  <SelectItem value="sale_general">Penjualan Umum</SelectItem>
                  <SelectItem value="sale_reseller">Penjualan Reseller</SelectItem>
                  <SelectItem value="buyback">Buyback</SelectItem>
                  <SelectItem value="stock_in">Barang Masuk</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={fetchData}>
              Refresh
            </Button>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b text-slate-600 font-medium">
                  <tr>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">No. Trx / Tipe</th>
                    <th className="px-4 py-3">Detail</th>
                    <th className="px-4 py-3 text-right">Nilai (Rp)</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-[#294376]" />
                        Memuat data riwayat...
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Tidak ada transaksi ditemukan
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-xs">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-900">{item.title}</div>
                          <div className="mt-1">{getTypeBadge(item.type, item.status)}</div>
                        </td>
                        <td className="px-4 py-3 min-w-[250px]">
                          <span className="text-slate-600 leading-relaxed">{item.description}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium whitespace-nowrap">
                          Rp {formatRupiah(item.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.status === "cancelled" ? (
                            <span className="text-red-500 font-medium">Batal</span>
                          ) : (
                            <span className="text-emerald-500 font-medium">Sukses</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.status !== "cancelled" && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => handleOpenVoid(item)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Void
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={voidModalOpen} onOpenChange={setVoidModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center justify-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6" />
              Konfirmasi Pembatalan
            </DialogTitle>
            <DialogDescription className="text-center pt-2 text-base">
              Apakah Anda yakin ingin membatalkan transaksi ini? 
              Stok barang akan dikembalikan ke posisi semula secara otomatis.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="bg-slate-50 p-4 rounded-xl border text-sm space-y-2 mt-2 mx-2">
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Tipe</span>
                <span className="col-span-2 font-medium">{selectedItem.title}</span>
              </div>
              <div className="grid grid-cols-3">
                <span className="text-slate-500">Nilai</span>
                <span className="col-span-2 font-medium">Rp {formatRupiah(selectedItem.amount)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 mt-3 text-slate-600 leading-relaxed">
                {selectedItem.description}
              </div>
            </div>
          )}

          {voidError && (
            <div className="p-3 mx-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm mt-4 font-medium flex gap-2 items-start">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              {voidError}
            </div>
          )}

          <DialogFooter className="mt-6 flex-col sm:flex-row gap-3 sm:justify-center px-6 pb-6 border-none bg-transparent">
            <Button variant="outline" onClick={() => setVoidModalOpen(false)} disabled={voiding} className="w-full sm:w-32 rounded-full h-11 border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shadow-sm">
              Tutup
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmVoid} 
              disabled={voiding}
              className="w-full sm:w-auto rounded-full h-11 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border border-red-100 font-semibold shadow-sm"
            >
              {voiding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Ya, Batalkan Transaksi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
