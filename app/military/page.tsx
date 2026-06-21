import { MilitaryFilterBar } from "@/components/shared/military/dashboard/roster/military-filter-bar";
import { MilitaryCardGrid } from "@/components/shared/military/dashboard/roster/military-card-grid";
import {
  MOCK_PERSONNEL,
  MOCK_TOTAL_DB_COUNT,
} from "@/components/shared/military/personnel-mock";
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
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const selectedStatuses = parseStatuses(status);

  const filtered =
    selectedStatuses.length === 0
      ? MOCK_PERSONNEL
      : MOCK_PERSONNEL.filter((p) => selectedStatuses.includes(p.status));

  const activeCount = filtered.filter((p) => p.status === "active").length;
  const shownCount = filtered.length;

  return (
    <div className="p-6">
      <MilitaryFilterBar
        selectedStatuses={selectedStatuses}
        activeCount={activeCount}
        shownCount={shownCount}
        totalDbCount={MOCK_TOTAL_DB_COUNT}
      />

      <MilitaryCardGrid personnel={filtered} />
    </div>
  );
}
