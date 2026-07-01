import { MilitaryFilterBar } from "@/components/shared/military/dashboard/roster/military-filter-bar";
import { MilitaryCardGrid } from "@/components/shared/military/dashboard/roster/military-card-grid";
import { MilitaryCard } from "@/components/shared/military/dashboard/roster/military-card";
import { getFilteredMilitary } from "@root/lib/data/military";
import type { StatusType } from "@/components/shared/military/types";

const ALLOWED_STATUSES: StatusType[] = [
  "active",
  "on-mission",
  "wounded",
  "vacation",
  "reserve",
];

function parseStatuses(value: string | undefined): StatusType[] {
  if (!value) return [];
  return value
    .split(",")
    .filter((s): s is StatusType => ALLOWED_STATUSES.includes(s as StatusType));
}

export default async function MilitaryMain({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const selectedStatuses = parseStatuses(status);
  const rawQuery = q?.trim() ?? "";

  const { personnel: filtered, totalCount } = await getFilteredMilitary(selectedStatuses, rawQuery);

  const activeCount = filtered.filter((p) => p.status === "active").length;

  return (
    <div className="p-6">
      <MilitaryFilterBar
        initialStatuses={selectedStatuses}
        initialQuery={rawQuery}
        activeCount={activeCount}
        shownCount={filtered.length}
        totalDbCount={totalCount}
      />

      <MilitaryCardGrid
        totalCount={totalCount}
        statuses={selectedStatuses}
        query={rawQuery}
      >
        {filtered.map((person) => (
          <MilitaryCard key={person.id} {...person} />
        ))}
      </MilitaryCardGrid>
    </div>
  );
}
