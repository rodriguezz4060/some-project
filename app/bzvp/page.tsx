import { BzvpFilterBar } from "@/components/shared/bzvp/roster/bzvp-filter-bar";
import { BzvpCardGrid } from "@/components/shared/bzvp/roster/bzvp-card-grid";
import { BzvpCard } from "@/components/shared/bzvp/roster/bzvp-card";
import { getFilteredBzvp } from "@root/lib/data/bzvp";
import type { BzvpStatus } from "@/components/shared/bzvp/types";

const ALLOWED_STATUSES: BzvpStatus[] = [
  "training",
  "graduated",
  "transferred",
  "failed",
];

function parseStatuses(value: string | undefined): BzvpStatus[] {
  if (!value) return [];
  return value
    .split(",")
    .filter((s): s is BzvpStatus => ALLOWED_STATUSES.includes(s as BzvpStatus));
}

export default async function BzvpPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; arrivalFrom?: string; arrivalTo?: string }>;
}) {
  const { status, q, arrivalFrom, arrivalTo } = await searchParams;
  const selectedStatuses = parseStatuses(status);
  const rawQuery = q?.trim() ?? "";

  const { personnel: filtered, count: shownCount } = await getFilteredBzvp(
    selectedStatuses,
    rawQuery,
    arrivalFrom ?? "",
    arrivalTo ?? "",
  );

  return (
    <div className="p-6">
      <BzvpFilterBar
        initialStatuses={selectedStatuses}
        initialQuery={rawQuery}
        initialArrivalFrom={arrivalFrom ?? ""}
        initialArrivalTo={arrivalTo ?? ""}
        shownCount={shownCount}
      />

      <BzvpCardGrid>
        {filtered.map((person) => (
          <BzvpCard key={person.id} {...person} />
        ))}
      </BzvpCardGrid>
    </div>
  );
}
