import type { PositionEntry } from "../../types";

interface Props {
  history?: PositionEntry[];
}

export function ProfilePositionHistory({ history }: Props) {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="relative space-y-0">
      {history.map((entry, i) => {
        const isCurrent = !entry.endDate;
        return (
          <div key={i} className="relative flex gap-4 pb-4 last:pb-0">
            {/* Лінія таймлайну */}
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

            {/* Контент */}
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
  );
}
