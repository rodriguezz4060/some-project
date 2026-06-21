"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@root/lib/utils";
import { BZVP_STATUS_CONFIG, BZVP_STATUSES } from "./constants";
import type { BzvpStatus } from "./types";

interface Props {
  selectedStatuses: BzvpStatus[];
  shownCount: number;
}

export function BzvpFilterBar({ selectedStatuses, shownCount }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const toggleStatus = useCallback(
    (status: BzvpStatus) => {
      const current = new Set(selectedStatuses);
      if (current.has(status)) {
        current.delete(status);
      } else {
        current.add(status);
      }
      const next = [...current].sort();
      const params = new URLSearchParams(searchParams.toString());
      if (next.length > 0) {
        params.set("status", next.join(","));
      } else {
        params.delete("status");
      }
      router.push(`/bzvp?${params.toString()}`);
    },
    [selectedStatuses, router, searchParams],
  );

  const resetFilters = useCallback(() => {
    router.push("/bzvp");
  }, [router]);

  const isAllMode = selectedStatuses.length === 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Статус:</span>
      <button
        type="button"
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
      {BZVP_STATUSES.map((status) => {
        const cfg = BZVP_STATUS_CONFIG[status];
        const isSelected = selectedStatuses.includes(status);
        return (
          <button
            key={status}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggleStatus(status)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.color)} />
            {cfg.label}
          </button>
        );
      })}
      <span className="ml-auto text-xs text-muted-foreground">
        Показано: {shownCount}
      </span>
    </div>
  );
}
