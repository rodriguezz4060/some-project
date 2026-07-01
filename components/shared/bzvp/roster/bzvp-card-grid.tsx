"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@root/lib/utils";
import { getBzvpPage } from "@root/actions/bzvp";
import { BzvpCard } from "./bzvp-card";
import type { BzvpStatus, BzvpPersonnel } from "../types";

const ITEMS_PER_PAGE = 8;

interface Props {
  children: React.ReactNode;
  totalCount: number;
  statuses: BzvpStatus[];
  query: string;
  arrivalFrom: string;
  arrivalTo: string;
}

export function BzvpCardGrid({ children, totalCount, statuses, query, arrivalFrom, arrivalTo }: Props) {
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const [extraData, setExtraData] = useState<BzvpPersonnel[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const shownCount = ITEMS_PER_PAGE + extraData.length;
  const hasMore = shownCount < totalCount;

  async function loadMore() {
    setLoading(true);
    try {
      const data = await getBzvpPage(statuses, query, arrivalFrom, arrivalTo, page + 1);
      setExtraData((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    } finally {
      setLoading(false);
    }
  }

  if (totalCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Немає даних</p>
        <p className="text-base">За вказаними фільтрами нічого не знайдено</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3", isSidebarCollapsed && "xl:grid-cols-4")}>
        {children}
        {extraData.map((p) => (
          <BzvpCard key={p.id} {...p} />
        ))}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={loadMore}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-6 py-3 text-base font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:bg-muted disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ChevronDown className="size-4" />
            )}
            Завантажити ще
            <span className="text-xs text-muted-foreground/60">
              ({totalCount - shownCount})
            </span>
          </button>
          <span className="text-xs text-muted-foreground/50">
            Показано {shownCount} з {totalCount}
          </span>
        </div>
      )}

      {!hasMore && totalCount > ITEMS_PER_PAGE && (
        <div className="text-center pt-2">
          <span className="text-xs text-muted-foreground/50">
            Завантажено всі {totalCount} записів
          </span>
        </div>
      )}
    </div>
  );
}
