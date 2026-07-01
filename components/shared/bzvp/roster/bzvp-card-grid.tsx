"use client";

import { useState, useMemo, Children } from "react";
import { ChevronDown } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@root/lib/utils";

const ITEMS_PER_PAGE = 8;

interface Props {
  children: React.ReactNode;
}

export function BzvpCardGrid({ children }: Props) {
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const items = useMemo(() => Children.toArray(children), [children]);
  const hasMore = visibleCount < items.length;
  const visibleItems = items.slice(0, visibleCount);

  if (items.length === 0) {
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
        {visibleItems}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
            }
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-6 py-3 text-base font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:bg-muted"
          >
            <ChevronDown className="size-4" />
            Завантажити ще
            <span className="text-xs text-muted-foreground/60">
              ({items.length - visibleCount})
            </span>
          </button>
          <span className="text-xs text-muted-foreground/50">
            Показано {visibleCount} з {items.length}
          </span>
        </div>
      )}

      {!hasMore && items.length > ITEMS_PER_PAGE && (
        <div className="text-center pt-2">
          <span className="text-xs text-muted-foreground/50">
            Завантажено всі {items.length} записів
          </span>
        </div>
      )}
    </div>
  );
}
