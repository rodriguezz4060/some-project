import { BzvpFilterBar } from "@/components/shared/bzvp/roster/bzvp-filter-bar";
import { BzvpCardGrid } from "@/components/shared/bzvp/roster/bzvp-card-grid";
import { BZVP_MOCK } from "@/components/shared/bzvp/mock";
import type { BzvpStatus, BzvpPersonnel } from "@/components/shared/bzvp/types";

const ALLOWED_STATUSES: BzvpStatus[] = [
  "training",
  "graduated",
  "transferred",
  "failed",
];

const SEARCH_FIELDS: (keyof BzvpPersonnel)[] = [
  "fullName",
  "rank",
  "serviceUnit",
  "specialization",
  "phone",
  "education",
  "civilianJob",
];

function parseStatuses(value: string | undefined): BzvpStatus[] {
  if (!value) return [];
  return value
    .split(",")
    .filter((s): s is BzvpStatus => ALLOWED_STATUSES.includes(s as BzvpStatus));
}

function matchesQuery(person: BzvpPersonnel, query: string): boolean {
  const lower = query.toLowerCase();
  return SEARCH_FIELDS.some((field) => {
    const val = person[field];
    return val != null && String(val).toLowerCase().includes(lower);
  });
}

function normalizeDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const m = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  return value;
}

export default async function BzvpPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; arrivalFrom?: string; arrivalTo?: string }>;
}) {
  const { status, q, arrivalFrom, arrivalTo } = await searchParams;
  const selectedStatuses = parseStatuses(status);
  const rawQuery = q?.trim() ?? "";

  const statusFiltered =
    selectedStatuses.length === 0
      ? BZVP_MOCK
      : BZVP_MOCK.filter((p) => selectedStatuses.includes(p.status));

  const searched = rawQuery
    ? statusFiltered.filter((p) => matchesQuery(p, rawQuery))
    : statusFiltered;

  const filtered =
    arrivalFrom || arrivalTo
      ? searched.filter((p) => {
          const d = normalizeDate(p.arrivalDate);
          if (arrivalFrom && d < arrivalFrom) return false;
          if (arrivalTo && d > arrivalTo) return false;
          return true;
        })
      : searched;

  const shownCount = filtered.length;

  return (
    <div className="p-6">
      <BzvpFilterBar
        initialStatuses={selectedStatuses}
        initialQuery={rawQuery}
        initialArrivalFrom={arrivalFrom ?? ""}
        initialArrivalTo={arrivalTo ?? ""}
        shownCount={shownCount}
      />

      <BzvpCardGrid personnel={filtered} />
    </div>
  );
}
