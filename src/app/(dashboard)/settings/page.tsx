import { SettingsClient } from "@/components/settings/settings-client";
import { getSettings } from "./actions";
import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await verifySession();
  
  if (!session) {
    redirect("/login");
  }

  const settings = await getSettings();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-[#294376] dark:text-white">Pengaturan Toko</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola profil, logo, format nomor dokumen, dan keamanan margin.
          </p>
        </div>
      </div>
      
      <SettingsClient initialData={settings} role={session.role} />
    </div>
  );
}
