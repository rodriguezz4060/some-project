import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BzvpFilterBar } from "@/components/shared/military/dashboard/bzvp/bzvp-filter-bar";
import { BzvpCardGrid } from "@/components/shared/military/dashboard/bzvp/bzvp-card-grid";
import { BZVP_MOCK } from "@/components/shared/military/bzvp-mock";
import type { BzvpStatus } from "@/components/shared/military/types";

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
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const selectedStatuses = parseStatuses(status);

  const filtered =
    selectedStatuses.length === 0
      ? BZVP_MOCK
      : BZVP_MOCK.filter((p) => selectedStatuses.includes(p.status));

  const shownCount = filtered.length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <BzvpFilterBar
          selectedStatuses={selectedStatuses}
          shownCount={shownCount}
        />
        <Link href="/bzvp/new" className="cursor-pointer">
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Нова анкета
          </Button>
        </Link>
      </div>

      <BzvpCardGrid personnel={filtered} />
    </div>
  );
}
