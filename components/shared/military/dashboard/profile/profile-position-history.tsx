import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseDate } from "@root/lib/utils/dates";
import type { PositionEntry } from "../../types";

interface Props {
  history?: PositionEntry[];
}

export function ProfilePositionHistory({ history }: Props) {
  if (!history || history.length === 0) {
    return null;
  }

  const sorted = [...history].sort(
    (a, b) => parseDate(b.startDate) - parseDate(a.startDate),
  );

  return (
    <ScrollArea className="h-[320px] pr-4">
      <div className="space-y-0">
      {sorted.map((entry, i) => {
        const isCurrent = !entry.endDate;
        return (
          <div key={entry.position + entry.startDate} className="relative flex gap-4 pb-4 last:pb-0">
            <div className="flex flex-col items-center">
              <div
                className={`relative z-10 size-3 shrink-0 rounded-full border-2 ${
                  isCurrent
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30 bg-background"
                }`}
              />
              {i < history.length - 1 && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>

            <div className="flex-1 pb-2">
              <p className="text-base font-medium">{entry.position}</p>
              <p className="text-xs text-muted-foreground">{entry.unit}</p>
              <p className="text-xs text-muted-foreground/60 tabular-nums">
                {entry.startDate}
                {entry.endDate ? ` — ${entry.endDate}` : " — зараз"}
              </p>
            </div>
          </div>
        );
      })}
      </div>
    </ScrollArea>
  );
}
