"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@root/lib/utils";
import { useCollapsed } from "@/hooks/use-collapsed";
import {
  BZVP_STATUS_CONFIG,
  BZVP_STATUSES,
  STATUS_SELECTED_CLASSES,
} from "../constants";
import type { BzvpStatus } from "../types";
import { BzvpSearchInput } from "./bzvp-search-input";
import { BzvpDateFilter } from "./bzvp-date-filter";

const STORAGE_KEY = "bzvp:filtersCollapsed";

interface Props {
  initialStatuses: BzvpStatus[];
  initialQuery: string;
  initialArrivalFrom: string;
  initialArrivalTo: string;
  shownCount: number;
}

export function BzvpFilterBar({
  initialStatuses,
  initialQuery,
  initialArrivalFrom,
  initialArrivalTo,
  shownCount,
}: Props) {
  const router = useRouter();
  const [collapsed, toggleCollapse] = useCollapsed(STORAGE_KEY);

  const toggleStatus = useCallback(
    (status: BzvpStatus) => {
      const current = new Set(initialStatuses);
      if (current.has(status)) {
        current.delete(status);
      } else {
        current.add(status);
      }
      const next = [...current].sort();
      const params = new URLSearchParams(window.location.search);
      if (next.length > 0) {
        params.set("status", next.join(","));
      } else {
        params.delete("status");
      }
      router.replace(`/bzvp?${params.toString()}`);
    },
    [initialStatuses, router],
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("status");
    const target = params.size > 0 ? `/bzvp?${params.toString()}` : "/bzvp";
    router.replace(target);
  }, [router]);

  const isAllMode = initialStatuses.length === 0;
  const statusActiveCount = initialStatuses.length;
  const dateActive = initialArrivalFrom || initialArrivalTo ? 1 : 0;
  const activeFiltersCount = statusActiveCount + dateActive;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <BzvpSearchInput initialQuery={initialQuery} />
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/bzvp/new">
            <Plus className="size-4" />
            Нова анкета
          </Link>
        </Button>
      </div>

      <div>
        <button
          type="button"
          onClick={toggleCollapse}
          className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              collapsed && "-rotate-90",
            )}
          />
          <span className="text-sm">Фільтри</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {!collapsed && (
          <div className="mt-3 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground mr-1">
                Статус:
              </span>
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
                const isSelected = initialStatuses.includes(status);
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggleStatus(status)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                      isSelected
                        ? STATUS_SELECTED_CLASSES[status]
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected ? `${cfg.color}/60` : cfg.color,
                      )}
                    />
                    {cfg.label}
                  </button>
                );
              })}
              <span className="ml-auto text-xs text-muted-foreground">
                Показано: {shownCount}
              </span>
            </div>

            <BzvpDateFilter
              initialFrom={initialArrivalFrom}
              initialTo={initialArrivalTo}
            />
          </div>
        )}
      </div>
    </div>
  );
}
