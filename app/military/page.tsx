import { AppSidebar } from "@/components/shared/military/dashboard/app-sidebar";
import { SiteHeader } from "@/components/shared/military/dashboard/site-header";
import { MilitaryPageHeader } from "@/components/shared/military/dashboard/military-page-header";
import { MilitaryCardGrid } from "@/components/shared/military/dashboard/military-card-grid";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  MOCK_PERSONNEL,
  MOCK_TOTAL_DB_COUNT,
} from "@/components/shared/military/personnel-mock";

const activeCount = MOCK_PERSONNEL.filter(
  (p) => p.status === "active",
).length;
const shownCount = MOCK_PERSONNEL.length;

export default async function MilitaryMain() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SiteHeader />

        <main className="flex-1">
          <div className="p-6">
            <MilitaryPageHeader
              activeCount={activeCount}
              shownCount={shownCount}
              totalDbCount={MOCK_TOTAL_DB_COUNT}
            />

            <MilitaryCardGrid personnel={MOCK_PERSONNEL} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
