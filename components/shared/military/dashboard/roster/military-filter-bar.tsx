"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { cn } from "@root/lib/utils";
import { statusConfig } from "../../constants";
import type { StatusType } from "../../types";

const ALL_STATUSES: StatusType[] = [
  "active",
  "on-mission",
  "wounded",
  "vacation",
  "reserve",
];

const chipDotColor: Record<StatusType, string> = {
  active: "bg-emerald-500",
  "on-mission": "bg-amber-500",
  wounded: "bg-rose-500",
  vacation: "bg-sky-500",
  reserve: "bg-gray-500",
};

interface Props {
  selectedStatuses: StatusType[];
  activeCount: number;
  shownCount: number;
  totalDbCount: number;
}

export function MilitaryFilterBar({
  selectedStatuses,
  activeCount,
  shownCount,
  totalDbCount,
}: Props) {
  const router = useRouter();

  const toggleStatus = useCallback(
    (status: StatusType) => {
      const next = selectedStatuses.includes(status)
        ? selectedStatuses.filter((s) => s !== status)
        : [...selectedStatuses, status];

      if (next.length === 0 || next.length === ALL_STATUSES.length) {
        router.replace("/military");
      } else {
        router.replace(`/military?status=${next.sort().join(",")}`);
      }
    },
    [router, selectedStatuses],
  );

  const resetFilters = useCallback(() => {
    router.replace("/military");
  }, [router]);

  const isAllMode = selectedStatuses.length === 0;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold">Активний склад</h2>
        <p className="text-sm text-muted-foreground">
          Управління особовим складом підрозділу
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Фільтр за статусом"
        >
          <button
            onClick={resetFilters}
            aria-pressed={isAllMode}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
              isAllMode
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
            )}
          >
            Усі
          </button>

          {ALL_STATUSES.map((status) => {
            const isActive = selectedStatuses.includes(status);
            const config = statusConfig[status];

            return (
              <button
                key={status}
                onClick={() => toggleStatus(status)}
                aria-pressed={isActive}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  className={cn("h-1.5 w-1.5 rounded-full", chipDotColor[status])}
                />
                {config.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-muted-foreground">
              Активних:{" "}
              <span className="font-medium text-foreground">{activeCount}</span>
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Показано:{" "}
            <span className="font-medium text-foreground">{shownCount}</span> з{" "}
            {totalDbCount}
          </div>
        </div>
      </div>
    </div>
  );
}
