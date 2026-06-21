import type { StatusType } from "@/components/shared/military/types";
import {
  MOCK_PERSONNEL,
  MOCK_TOTAL_DB_COUNT,
} from "@/components/shared/military/personnel-mock";
import { ReportStatCards } from "@/components/shared/military/dashboard/report-stat-cards";
import { ReportStatusBreakdown } from "@/components/shared/military/dashboard/report-status-breakdown";
import { ReportLeaderboard } from "@/components/shared/military/dashboard/report-leaderboard";

const ALL_STATUSES: StatusType[] = [
  "active",
  "on-mission",
  "wounded",
  "vacation",
  "reserve",
];

export default async function ReportsPage() {
  const activeCount = MOCK_PERSONNEL.filter(
    (p) => p.status === "active",
  ).length;
  const onMissionCount = MOCK_PERSONNEL.filter(
    (p) => p.status === "on-mission",
  ).length;
  const woundedCount = MOCK_PERSONNEL.filter(
    (p) => p.status === "wounded",
  ).length;

  const distribution = Object.fromEntries(
    ALL_STATUSES.map((status) => [
      status,
      MOCK_PERSONNEL.filter((p) => p.status === status).length,
    ]),
  ) as Record<StatusType, number>;

  const contactCount = MOCK_PERSONNEL.filter((p) => p.phone).length;
  const emailCount = MOCK_PERSONNEL.filter((p) => p.email).length;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Звіти та аналітика</h1>
        <p className="text-sm text-muted-foreground">
          Статистика та аналіз особового складу
        </p>
      </div>

      <ReportStatCards
        totalCount={MOCK_TOTAL_DB_COUNT}
        activeCount={activeCount}
        onMissionCount={onMissionCount}
        woundedCount={woundedCount}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ReportStatusBreakdown
          distribution={distribution}
          totalCount={MOCK_TOTAL_DB_COUNT}
        />

        <ReportLeaderboard personnel={MOCK_PERSONNEL} />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">
          Повнота контактних даних
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-emerald-500"
                style={{
                  width: `${Math.round((contactCount / MOCK_PERSONNEL.length) * 100)}%`,
                }}
              />
            </div>
            <span className="text-sm tabular-nums">
              {contactCount}/{MOCK_PERSONNEL.length}
            </span>
            <span className="text-xs text-muted-foreground">тел.</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-sky-500"
                style={{
                  width: `${Math.round((emailCount / MOCK_PERSONNEL.length) * 100)}%`,
                }}
              />
            </div>
            <span className="text-sm tabular-nums">
              {emailCount}/{MOCK_PERSONNEL.length}
            </span>
            <span className="text-xs text-muted-foreground">email</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="bg-rose-500"
                style={{
                  width: `${Math.round(((MOCK_PERSONNEL.length - contactCount) / MOCK_PERSONNEL.length) * 100)}%`,
                }}
              />
            </div>
            <span className="text-sm tabular-nums">
              {MOCK_PERSONNEL.length - contactCount}/{MOCK_PERSONNEL.length}
            </span>
            <span className="text-xs text-muted-foreground">без зв&apos;язку</span>
          </div>
        </div>
      </div>
    </div>
  );
}
