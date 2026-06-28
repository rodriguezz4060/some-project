"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCallback } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@root/lib/utils";
import { useCollapsed } from "@/hooks/use-collapsed";
import { statusConfig, STATUS_SELECTED_CLASSES } from "../../constants";
import type { StatusType } from "../../types";
import { MilitarySearchInput } from "./military-search-input";
import { Button } from "@/components/ui/button";

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

const STORAGE_KEY = "military:filtersCollapsed";

interface Props {
  initialStatuses: StatusType[];
  initialQuery: string;
  activeCount: number;
  shownCount: number;
  totalDbCount: number;
}

export function MilitaryFilterBar({
  initialStatuses,
  initialQuery,
  activeCount,
  shownCount,
  totalDbCount,
}: Props) {
  const router = useRouter();
  const [collapsed, toggleCollapse] = useCollapsed(STORAGE_KEY);

  const buildUrl = useCallback(
    (nextStatuses: StatusType[]) => {
      const params = new URLSearchParams(window.location.search);
      if (
        nextStatuses.length > 0 &&
        nextStatuses.length < ALL_STATUSES.length
      ) {
        params.set("status", [...nextStatuses].sort().join(","));
      } else {
        params.delete("status");
      }
      const target =
        params.size > 0 ? `/military?${params.toString()}` : "/military";
      router.replace(target);
    },
    [router],
  );

  const toggleStatus = useCallback(
    (status: StatusType) => {
      const next = initialStatuses.includes(status)
        ? initialStatuses.filter((s) => s !== status)
        : [...initialStatuses, status];
      buildUrl(next);
    },
    [initialStatuses, buildUrl],
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("status");
    const target =
      params.size > 0 ? `/military?${params.toString()}` : "/military";
    router.replace(target);
  }, [router]);

  const isAllMode = initialStatuses.length === 0;
  const activeFiltersCount = initialStatuses.length;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Активний склад</h2>
          <p className="text-sm text-muted-foreground">
            Управління особовим складом підрозділу
          </p>
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <MilitarySearchInput initialQuery={initialQuery} />
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/military/new">
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
          <div
            className="mt-3 flex flex-wrap items-center gap-1.5"
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
              const isActive = initialStatuses.includes(status);
              const config = statusConfig[status];

              return (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                    isActive
                      ? STATUS_SELECTED_CLASSES[status]
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      isActive
                        ? `${chipDotColor[status]}/60`
                        : chipDotColor[status],
                    )}
                  />
                  {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
