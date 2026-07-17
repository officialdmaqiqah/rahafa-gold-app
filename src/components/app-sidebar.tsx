"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Home, Package, DollarSign, ArrowDownCircle, Archive, FileText, RefreshCcw, PieChart, Settings, LogOut, History, Wallet, CalendarClock } from "lucide-react"
import Link from "next/link"
import { logoutAction } from "@/app/actions"

const items = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Produk", url: "/produk", icon: Package },
  { title: "Harga Hari Ini", url: "/harga-harian", icon: DollarSign },
  { title: "Barang Masuk", url: "/barang-masuk", icon: ArrowDownCircle },
  { title: "Stok Akhir", url: "/stok", icon: Archive },
  { title: "Buat Invoice", url: "/buat-invoice", icon: FileText },
  { title: "Buyback", url: "/buyback", icon: RefreshCcw },
  { title: "Kas & Biaya", url: "/kas", icon: Wallet },
  { title: "Laporan", url: "/laporan", icon: PieChart },
  { title: "Riwayat Transaksi", url: "/riwayat", icon: History },
  { title: "Riwayat Harga", url: "/riwayat-harga", icon: CalendarClock },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { setOpenMobile } = useSidebar()
  
  return (
    <Sidebar className="border-r border-slate-200 dark:border-sidebar-border bg-white dark:bg-sidebar">
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-8 mb-4">
            <h2 className="text-3xl font-bold text-primary tracking-tight drop-shadow-md">RAHAFA GOLD</h2>
            <p className="text-xs text-primary/80 font-medium tracking-[0.25em] mt-2 ml-1">MANAGEMENT</p>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    render={<Link href={item.url} />} 
                    onClick={() => setOpenMobile(false)}
                    className="hover:bg-primary/10 dark:hover:bg-primary/15 text-slate-700 dark:text-sidebar-foreground hover:text-primary dark:hover:text-primary transition-all duration-300 rounded-lg mx-2 w-[calc(100%-1rem)] py-6 group"
                  >
                    <item.icon className="text-slate-500 dark:text-muted-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors w-5 h-5 mr-1" />
                    <span className="font-medium text-[15px]">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <form action={logoutAction}>
              <SidebarMenuButton 
                render={<button type="submit" />}
                className="hover:bg-red-100 dark:hover:bg-red-500/10 text-slate-700 dark:text-sidebar-foreground hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 rounded-lg mx-2 w-[calc(100%-1rem)] py-6 group"
              >
                <LogOut className="w-5 h-5 text-slate-500 dark:text-muted-foreground group-hover:text-red-600 dark:group-hover:text-red-400" />
                <span className="font-medium text-[15px]">Logout</span>
              </SidebarMenuButton>
            </form>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
