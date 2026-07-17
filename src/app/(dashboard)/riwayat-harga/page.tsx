import { getPriceHistory } from "./actions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarClock, Tag } from "lucide-react";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RiwayatHargaPage() {
  const sessions = await getPriceHistory(100);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Riwayat Harga</h1>
        <p className="text-muted-foreground">Log riwayat sesi update harga harian.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center p-12 border rounded-lg text-muted-foreground bg-muted/20">
          Belum ada riwayat harga.
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-[#294376] dark:text-blue-400 rounded-full hidden sm:block">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg">{s.date}</span>
                    <Badge variant="outline" className="bg-slate-100 text-slate-800">{s.session_name}</Badge>
                    {s.status === 'active' && <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Aktif</Badge>}
                    {s.status === 'draft' && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Draft</Badge>}
                    {s.status === 'archived' && <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300">Arsip</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Dibuat pada: {new Date(s.created_at).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-2">
                <Link href={`/harga-harian?date=${s.date}`}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Lihat Detail
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
