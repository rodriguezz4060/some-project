"use client";

import { Calendar, X } from "lucide-react";

interface Props {
  createdFrom: string;
  createdTo: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onReset: () => void;
}

export function ExportDateFilter({ createdFrom, createdTo, onFromChange, onToChange, onReset }: Props) {
  const hasFilter = createdFrom || createdTo;

  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Calendar className="size-3.5" />
          Фільтр за датою створення
        </span>
        {hasFilter && (
          <button type="button" onClick={onReset}
            className="flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-foreground transition-colors cursor-pointer">
            <X className="size-3" />Скинути
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="date" value={createdFrom} onChange={(e) => onFromChange(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground [color-scheme:dark]" />
        <input type="date" value={createdTo} onChange={(e) => onToChange(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-background px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 text-foreground [color-scheme:dark]" />
      </div>
    </div>
  );
}
