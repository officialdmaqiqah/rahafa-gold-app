import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "./actions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 min-h-screen bg-background relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 blur-[120px] pointer-events-none -z-10" />
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bold tracking-tight text-[#294376] dark:text-white">
          Ringkasan <span className="text-gold-gradient">Bisnis</span>
        </h2>
      </div>
      
      <DashboardClient data={data} />
    </div>
  );
}
