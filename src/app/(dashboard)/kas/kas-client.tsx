"use client";

import { useState } from "react";

import { formatRupiah } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, ArrowDownLeft, ArrowUpRight, Trash2, Loader2 } from "lucide-react";
import { addCashTransaction, deleteCashTransaction } from "./actions";
import { toast } from "sonner";


interface CashTransaction {
  id: string;
  date: string;
  type: "IN" | "OUT";
  category: string;
  amount: number;
  description: string;
  created_at: string;
}

const CATEGORIES = {
  IN: [
    "Pendapatan Lain-lain",
    "Modal Awal / Tambahan",
    "Lainnya"
  ],
  OUT: [
    "Biaya Operasional",
    "Gaji Karyawan",
    "Listrik & Air",
    "Konsumsi",
    "Alat Tulis Kantor",
    "Pembelian Aset",
    "Lainnya"
  ]
};

export function KasClient({ initialData }: { initialData: CashTransaction[] }) {
  const [data, setData] = useState(initialData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type: "OUT" as "IN" | "OUT",
    category: "",
    amountStr: "",
    description: ""
  });

  const totalIn = data.filter(d => d.type === "IN").reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalOut = data.filter(d => d.type === "OUT").reduce((acc, curr) => acc + Number(curr.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) {
      toast.error("Pilih kategori terlebih dahulu");
      return;
    }
    const amount = parseInt(form.amountStr.replace(/\D/g, ""));
    if (!amount || amount <= 0) {
      toast.error("Nominal tidak valid");
      return;
    }

    setIsPending(true);
    const res = await addCashTransaction({
      date: form.date,
      type: form.type,
      category: form.category,
      amount,
      description: form.description
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Transaksi kas berhasil dicatat");
      setIsDialogOpen(false);
      // Optimistic update
      const newTx: CashTransaction = {
        id: Math.random().toString(),
        date: form.date,
        type: form.type,
        category: form.category,
        amount,
        description: form.description,
        created_at: new Date().toISOString()
      };
      setData([newTx, ...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setForm({ ...form, amountStr: "", description: "", category: "" });
    }
    setIsPending(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan ini?")) return;
    const res = await deleteCashTransaction(id);
    if (!res.error) {
      setData(data.filter(d => d.id !== id));
      toast.success("Catatan dihapus");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Total Pemasukan Lain</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">Rp {formatRupiah(totalIn)}</div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-800">Total Pengeluaran (Biaya)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-700">Rp {formatRupiah(totalOut)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button size="lg" className="font-bold h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-sm px-6" />}>
            <Plus className="mr-2 h-5 w-5" /> Catat Kas Baru
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-[#294376] text-center">Catat Arus Kas</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4 px-6 pb-6">
              <div className="space-y-2">
                <Label>Tanggal</Label>
                <Input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              </div>
              
              <div className="space-y-2">
                <Label>Tipe Transaksi</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    type="button" 
                    variant={form.type === "IN" ? "default" : "outline"}
                    className={form.type === "IN" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    onClick={() => setForm({...form, type: "IN", category: ""})}
                  >
                    Pemasukan
                  </Button>
                  <Button 
                    type="button" 
                    variant={form.type === "OUT" ? "default" : "outline"}
                    className={form.type === "OUT" ? "bg-rose-600 hover:bg-rose-700" : ""}
                    onClick={() => setForm({...form, type: "OUT", category: ""})}
                  >
                    Pengeluaran
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={v => setForm({...form, category: v || ""})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES[form.type].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nominal (Rp)</Label>
                <Input 
                  required
                  value={form.amountStr ? formatRupiah(parseInt(form.amountStr)) : ""}
                  onChange={e => setForm({...form, amountStr: e.target.value.replace(/\D/g, "")})}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Keterangan Tambahan</Label>
                <Input 
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Catatan (Opsional)"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" size="lg" className="w-full font-bold h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-sm" disabled={isPending}>
                  {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  Simpan
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base font-semibold">Riwayat Transaksi Kas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {data.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Belum ada catatan kas
              </div>
            ) : (
              data.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${tx.type === 'IN' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {tx.type === 'IN' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{tx.category}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(tx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} {tx.description && `• ${tx.description}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`font-semibold ${tx.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.type === 'IN' ? '+' : '-'} Rp {formatRupiah(tx.amount)}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(tx.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
