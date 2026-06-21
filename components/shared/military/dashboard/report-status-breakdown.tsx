import type { StatusType } from "../types";
import { statusConfig } from "../constants";

const STATUS_ORDER: StatusType[] = [
  "active",
  "on-mission",
  "wounded",
  "vacation",
  "reserve",
];

const statusBgColors: Record<StatusType, string> = {
  active: "bg-emerald-500",
  "on-mission": "bg-amber-500",
  wounded: "bg-rose-500",
  vacation: "bg-sky-500",
  reserve: "bg-gray-500",
};

interface Props {
  distribution: Record<StatusType, number>;
  totalCount: number;
}

export function ReportStatusBreakdown({
  distribution,
  totalCount,
}: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Розподіл за статусами
      </h3>

      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {STATUS_ORDER.map((status) => {
          const count = distribution[status];
          if (count === 0) return null;
          return (
            <div
              key={status}
              className={statusBgColors[status]}
              style={{ width: `${(count / totalCount) * 100}%` }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {STATUS_ORDER.map((status) => {
          const count = distribution[status];
          const config = statusConfig[status];
          const percent = totalCount > 0
            ? Math.round((count / totalCount) * 100)
            : 0;

          return (
            <div
              key={status}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span
                  className={`h-2 w-2 rounded-full ${statusBgColors[status]}`}
                />
                {config.label}
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-semibold">{count}</span>
                <span className="text-xs text-muted-foreground">
                  {percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
