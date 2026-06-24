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

const SEARCH_FIELDS: (keyof import("@/components/shared/military/types").MilitaryPersonnel)[] = [
  "fullName",
  "rank",
  "position",
  "unit",
  "phone",
  "email",
];

function parseStatuses(value: string | undefined): StatusType[] {
  if (!value) return [];
  return value
    .split(",")
    .filter((s): s is StatusType => ALLOWED_STATUSES.includes(s as StatusType));
}

function matchesQuery(person: import("@/components/shared/military/types").MilitaryPersonnel, query: string): boolean {
  const lower = query.toLowerCase();
  return SEARCH_FIELDS.some((field) => {
    const val = person[field];
    return val != null && String(val).toLowerCase().includes(lower);
  });
}

export default async function MilitaryMain({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const selectedStatuses = parseStatuses(status);
  const rawQuery = q?.trim() ?? "";

  const statusFiltered =
    selectedStatuses.length === 0
      ? MOCK_PERSONNEL
      : MOCK_PERSONNEL.filter((p) => selectedStatuses.includes(p.status));

  const filtered = rawQuery
    ? statusFiltered.filter((p) => matchesQuery(p, rawQuery))
    : statusFiltered;

  const activeCount = filtered.filter((p) => p.status === "active").length;
  const shownCount = filtered.length;

  return (
    <div className="p-6">
      <MilitaryFilterBar
        initialStatuses={selectedStatuses}
        initialQuery={rawQuery}
        activeCount={activeCount}
        shownCount={shownCount}
        totalDbCount={MOCK_TOTAL_DB_COUNT}
      />

      <MilitaryCardGrid personnel={filtered} />
    </div>
  );
}
