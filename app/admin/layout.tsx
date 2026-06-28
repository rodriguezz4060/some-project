import { redirect } from "next/navigation";
import { auth } from "@root/lib/auth";
import { AdminSidebar } from "@/components/shared/admin/admin-sidebar";
import { SiteHeader } from "@/components/shared/military/dashboard/layout/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "moderator")) {
    redirect("/");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "68px",
        } as React.CSSProperties
      }
    >
      <AdminSidebar variant="inset" />
      <SidebarInset className="overflow-y-auto">
        <SiteHeader title="Адміністрування" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
