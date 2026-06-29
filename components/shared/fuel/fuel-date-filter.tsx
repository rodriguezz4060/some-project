"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

function getMonthBounds(): { from: string; to: string } {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

function getYearBounds(): { from: string; to: string } {
  const now = new Date();
  return {
    from: `${now.getFullYear()}-01-01`,
    to: `${now.getFullYear()}-12-31`,
  };
}

interface Props {
  initialFrom: string;
  initialTo: string;
}

export function FuelDateFilter({ initialFrom, initialTo }: Props) {
  const router = useRouter();

  const update = useCallback(
    (from: string, to: string) => {
      const params = new URLSearchParams(window.location.search);
      if (from) params.set("dateFrom", from);
      else params.delete("dateFrom");
      if (to) params.set("dateTo", to);
      else params.delete("dateTo");
      const target = params.toString() ? `/fuel/records?${params.toString()}` : "/fuel/records";
      router.replace(target);
    },
    [router],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="size-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Період:</span>

      <button
        type="button"
        onClick={() => {
          const { from, to } = getMonthBounds();
          update(from, to);
        }}
        className="h-7 rounded-md border border-border bg-muted/50 px-2.5 text-xs text-foreground hover:bg-muted transition-colors"
      >
        Цей місяць
      </button>

      <button
        type="button"
        onClick={() => {
          const { from, to } = getYearBounds();
          update(from, to);
        }}
        className="h-7 rounded-md border border-border bg-muted/50 px-2.5 text-xs text-foreground hover:bg-muted transition-colors"
      >
        Цей рік
      </button>

      <button
        type="button"
        onClick={() => update("", "")}
        className="h-7 rounded-md border border-border bg-muted/50 px-2.5 text-xs text-foreground hover:bg-muted transition-colors"
      >
        Усі
      </button>

      <label className="sr-only" htmlFor="fuelDateFrom">Від</label>
      <input
        id="fuelDateFrom"
        type="date"
        value={initialFrom}
        onChange={(e) => update(e.target.value, initialTo)}
        className="h-7 rounded-md border border-border bg-muted/50 px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors [color-scheme:dark]"
      />
      <span className="text-xs text-muted-foreground">—</span>
      <label className="sr-only" htmlFor="fuelDateTo">До</label>
      <input
        id="fuelDateTo"
        type="date"
        value={initialTo}
        onChange={(e) => update(initialFrom, e.target.value)}
        className="h-7 rounded-md border border-border bg-muted/50 px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors [color-scheme:dark]"
      />
    </div>
  );
}
