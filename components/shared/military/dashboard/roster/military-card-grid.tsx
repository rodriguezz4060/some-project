"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@root/lib/utils";
import type { MilitaryPersonnel } from "../../types";
import { MilitaryCard } from "./military-card";

const ITEMS_PER_PAGE = 8;

interface Props {
  personnel: MilitaryPersonnel[];
}

export function MilitaryCardGrid({ personnel }: Props) {
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const hasMore = visibleCount < personnel.length;
  const visibleItems = personnel.slice(0, visibleCount);

  if (personnel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4 mb-4" />
        <p className="text-lg font-medium">Картки не знайдено</p>
        <p className="text-sm text-muted-foreground">
          Спробуйте змінити параметри фільтрації
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cn("grid gap-6 auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3", isSidebarCollapsed && "xl:grid-cols-4")}>
        {visibleItems.map((person) => (
          <MilitaryCard key={person.id} {...person} />
        ))}
      </div>

      {hasMore && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() =>
              setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
            }
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-6 py-3 text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:bg-muted"
          >
            <ChevronDown className="size-4" />
            Завантажити ще
            <span className="text-xs text-muted-foreground/60">
              ({personnel.length - visibleCount})
            </span>
          </button>
          <span className="text-xs text-muted-foreground/50">
            Показано {visibleCount} з {personnel.length}
          </span>
        </div>
      )}

      {!hasMore && personnel.length > ITEMS_PER_PAGE && (
        <div className="text-center pt-2">
          <span className="text-xs text-muted-foreground/50">
            Завантажено всі {personnel.length} записів
          </span>
        </div>
      )}
    </div>
  );
}
