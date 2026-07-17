"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Save, Building, FileText, ShieldAlert } from "lucide-react";
import { updateSettings, uploadLogo } from "@/app/(dashboard)/settings/actions";
import { useRouter } from "next/navigation";

export function SettingsClient({ initialData, role }: { initialData: any, role: string }) {
  const router = useRouter();
  const [data, setData] = useState(initialData || {});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pin, setPin] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("id", data.id);
    formData.append("store_name", data.store_name || "");
    formData.append("tagline", data.tagline || "");
    formData.append("phone", data.phone || "");
    formData.append("invoice_prefix", data.invoice_prefix || "");
    formData.append("buyback_prefix", data.buyback_prefix || "");
    formData.append("invoice_footer", data.invoice_footer || "");
    formData.append("bank_account_info", data.bank_account_info || "");
    formData.append("minimum_margin_amount", data.minimum_margin_amount || "0");
    formData.append("minimum_margin_percent", data.minimum_margin_percent || "0");
    if (pin) formData.append("pin", pin);

    const result = await updateSettings(formData);
    
    if (result.error) {
      setErrorMsg(result.error);
    } else {
      setSuccessMsg("Pengaturan berhasil disimpan.");
      setPin("");
      router.refresh();
    }
    setLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Ukuran gambar maksimal 2MB");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append("logo", file);
    formData.append("id", data.id);

    const result = await uploadLogo(formData);
    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.url) {
      setData({ ...data, logo_url: result.url });
      setSuccessMsg("Logo berhasil diperbarui.");
      router.refresh();
    }
    
    setUploading(false);
  };

  if (role === "kasir") {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Akses Ditolak</h2>
        <p className="text-muted-foreground">Hanya Admin atau Owner yang dapat mengakses halaman pengaturan.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1 space-y-6">
        <Card className="pt-0 overflow-hidden">
          <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
            <CardTitle className="text-lg text-white">Logo Toko</CardTitle>
            <CardDescription className="text-white/70">Format JPG/PNG maks 2MB</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="h-32 w-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-slate-50 relative group">
              {data.logo_url ? (
                <img src={data.logo_url} alt="Logo" className="object-contain h-full w-full p-2" />
              ) : (
                <Building className="h-10 w-10 text-slate-300" />
              )}
              
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                {uploading ? <Loader2 className="h-6 w-6 text-white animate-spin" /> : <Upload className="h-6 w-6 text-white" />}
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
              </label>
            </div>
            {uploading && <p className="text-xs text-blue-600 font-medium animate-pulse">Mengunggah logo...</p>}
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-3">
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 border border-red-200 flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <p className="text-sm font-medium">{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-700 p-4 rounded-md mb-6 border border-emerald-200">
            <p className="text-sm font-medium">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSave}>
          <Tabs defaultValue="profil">
            <TabsList className="mb-6">
              <TabsTrigger value="profil"><Building className="h-4 w-4 mr-2" /> Profil</TabsTrigger>
              <TabsTrigger value="format"><FileText className="h-4 w-4 mr-2" /> Format Nota</TabsTrigger>
              <TabsTrigger value="keamanan"><ShieldAlert className="h-4 w-4 mr-2" /> Keamanan & Margin</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profil">
              <Card className="pt-0 overflow-hidden">
                <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
                  <CardTitle className="text-lg text-white">Profil Toko</CardTitle>
                  <CardDescription className="text-white/70">Informasi ini akan muncul pada struk dan laporan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="store_name">Nama Toko *</Label>
                    <Input id="store_name" name="store_name" value={data.store_name || ""} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input id="tagline" name="tagline" value={data.tagline || ""} onChange={handleChange} placeholder="EMAS & SILVER" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Nomor Telepon / WA</Label>
                    <Input id="phone" name="phone" value={data.phone || ""} onChange={handleChange} placeholder="0853-xxxx-xxxx" />
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-slate-50 p-4 rounded-b-lg">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Simpan Profil
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="format">
              <Card className="pt-0 overflow-hidden">
                <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
                  <CardTitle className="text-lg text-white">Format Dokumen</CardTitle>
                  <CardDescription className="text-white/70">Atur kode penomoran untuk nota dan invoice.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice_prefix">Prefix Invoice Penjualan</Label>
                      <Input id="invoice_prefix" name="invoice_prefix" value={data.invoice_prefix || ""} onChange={handleChange} placeholder="INV" />
                      <p className="text-xs text-muted-foreground">Contoh hasil: {data.invoice_prefix || "INV"}-20260714-xxxx</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buyback_prefix">Prefix Nota Buyback</Label>
                      <Input id="buyback_prefix" name="buyback_prefix" value={data.buyback_prefix || ""} onChange={handleChange} placeholder="BB" />
                      <p className="text-xs text-muted-foreground">Contoh hasil: {data.buyback_prefix || "BB"}-20260714-xxxx</p>
                    </div>
                  </div>
                  <div className="space-y-2 pt-4">
                    <Label htmlFor="invoice_footer">Catatan Kaki (Footer) Nota</Label>
                    <Textarea 
                      id="invoice_footer" 
                      name="invoice_footer" 
                      value={data.invoice_footer || ""} 
                      onChange={handleChange} 
                      placeholder="Barang yang sudah dibeli tidak dapat ditukar/dikembalikan."
                      className="h-24"
                    />
                  </div>
                  <div className="space-y-2 pt-4 border-t mt-4">
                    <Label htmlFor="bank_account_info">Info Rekening Transfer (Ditampilkan di Invoice)</Label>
                    <Textarea 
                      id="bank_account_info" 
                      name="bank_account_info" 
                      value={data.bank_account_info || ""} 
                      onChange={handleChange} 
                      placeholder="Contoh:&#10;BCA 12345678 a.n Rahafa Gold&#10;Mandiri 98765432 a.n Rahafa"
                      className="h-24"
                    />
                    <p className="text-xs text-muted-foreground">Info ini akan muncul di bagian bawah struk/invoice jika metode pembayaran adalah Transfer.</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-slate-50 p-4 rounded-b-lg">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Simpan Format
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="keamanan">
              <Card className="pt-0 overflow-hidden">
                <CardHeader className="bg-[#294376] pb-4 pt-4 px-6 m-0">
                  <CardTitle className="text-lg text-white">Batas Keamanan & Otorisasi</CardTitle>
                  <CardDescription className="text-white/70">Batas margin aman dan proteksi aksi penting.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm">Peringatan Margin Tipis / HOLD</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-primary/5 p-4 rounded-md border border-primary/20">
                      <div className="space-y-2">
                        <Label htmlFor="minimum_margin_amount">Batas Minimal Rupiah (Rp)</Label>
                        <Input 
                          id="minimum_margin_amount" 
                          name="minimum_margin_amount" 
                          type="number" 
                          min="0"
                          value={data.minimum_margin_amount || ""} 
                          onChange={handleChange} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimum_margin_percent">Batas Minimal Persentase (%)</Label>
                        <Input 
                          id="minimum_margin_percent" 
                          name="minimum_margin_percent" 
                          type="number" 
                          min="0"
                          step="0.1"
                          value={data.minimum_margin_percent || ""} 
                          onChange={handleChange} 
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sistem akan menandai barang "Margin Tipis" atau "Hold" di Dashboard dan Kasir jika profit per barang berada di bawah batas ini. Biarkan 0 jika tidak ingin memakai batas.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-semibold text-sm text-red-600">PIN Otorisasi (Owner PIN)</h3>
                    <div className="space-y-2">
                      <Label htmlFor="pin">Setel PIN Baru (6 Angka)</Label>
                      <Input 
                        id="pin" 
                        type="password" 
                        maxLength={6}
                        placeholder="••••••"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\\D/g, ""))}
                        className="max-w-[200px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Hanya diisi jika ingin merubah PIN. PIN ini akan dienkripsi dan digunakan untuk menyetujui transaksi jual rugi oleh kasir.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-slate-50 p-4 rounded-b-lg">
                  <Button type="submit" disabled={loading} className="w-full sm:w-auto" variant="destructive">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Simpan Keamanan
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </div>
  );
}
