"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

interface Props {
  initialFrom: string;
  initialTo: string;
}

function toInputValue(dateStr: string): string {
  if (!dateStr) return "";
  const ddmmyyyy = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (ddmmyyyy) {
    return `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}`;
  }
  return dateStr;
}

export function BzvpDateFilter({ initialFrom, initialTo }: Props) {
  const router = useRouter();

  const fromValue = useMemo(() => toInputValue(initialFrom), [initialFrom]);
  const toValue = useMemo(() => toInputValue(initialTo), [initialTo]);

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      const target = params.size > 0 ? `/bzvp?${params.toString()}` : "/bzvp";
      router.replace(target);
    },
    [router],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="size-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Дата прибуття:</span>
      <label className="sr-only" htmlFor="arrivalFrom">Від</label>
      <input
        id="arrivalFrom"
        type="date"
        value={fromValue}
        onChange={(e) => update("arrivalFrom", e.target.value)}
        className="h-8 rounded-md border border-border bg-muted/50 px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors [color-scheme:dark]"
      />
      <span className="text-xs text-muted-foreground">—</span>
      <label className="sr-only" htmlFor="arrivalTo">До</label>
      <input
        id="arrivalTo"
        type="date"
        value={toValue}
        onChange={(e) => update("arrivalTo", e.target.value)}
        className="h-8 rounded-md border border-border bg-muted/50 px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors [color-scheme:dark]"
      />
    </div>
  );
}
