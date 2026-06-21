import { AppSidebar } from "@/components/shared/military/dashboard/app-sidebar";
import { SiteHeader } from "@/components/shared/military/dashboard/site-header";
import { MilitaryFilterBar } from "@/components/shared/military/dashboard/military-filter-bar";
import { MilitaryCardGrid } from "@/components/shared/military/dashboard/military-card-grid";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  MOCK_PERSONNEL,
  MOCK_TOTAL_DB_COUNT,
} from "@/components/shared/military/personnel-mock";
import type { StatusType, StatusFilterValue } from "@/components/shared/military/types";

const ALLOWED_STATUSES: StatusType[] = [
  "active",
  "on-mission",
  "wounded",
  "vacation",
  "reserve",
];

function parseStatus(value: string | undefined): StatusFilterValue {
  if (value && ALLOWED_STATUSES.includes(value as StatusType)) {
    return value as StatusType;
  }
  return "all";
}

export default async function MilitaryMain({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filterValue = parseStatus(status);

  const filtered =
    filterValue === "all"
      ? MOCK_PERSONNEL
      : MOCK_PERSONNEL.filter((p) => p.status === filterValue);

  const activeCount = filtered.filter((p) => p.status === "active").length;
  const shownCount = filtered.length;

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
            <MilitaryFilterBar
              currentFilter={filterValue}
              activeCount={activeCount}
              shownCount={shownCount}
              totalDbCount={MOCK_TOTAL_DB_COUNT}
            />

            <MilitaryCardGrid personnel={filtered} />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
