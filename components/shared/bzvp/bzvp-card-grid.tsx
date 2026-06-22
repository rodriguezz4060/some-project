"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { BzvpPersonnel } from "./types";
import { BzvpCard } from "./bzvp-card";

const ITEMS_PER_PAGE = 8;

interface Props {
  personnel: BzvpPersonnel[];
}

export function BzvpCardGrid({ personnel }: Props) {
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const hasMore = visibleCount < personnel.length;
  const visibleItems = personnel.slice(0, visibleCount);

  if (personnel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg font-medium">Немає даних</p>
        <p className="text-sm">За вказаними фільтрами нічого не знайдено</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleItems.map((person) => (
          <BzvpCard key={person.id} {...person} />
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
