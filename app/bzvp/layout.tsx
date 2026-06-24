import type { Metadata } from "next";
import { AppSidebar } from "@/components/shared/military/dashboard/layout/app-sidebar";
import { SiteHeader } from "@/components/shared/military/dashboard/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "БЗВП | 23 ОМБр",
  description: "Бойова зброя вогнева підготовка",
};

export default function BzvpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "68px",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="БЗВП" />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
