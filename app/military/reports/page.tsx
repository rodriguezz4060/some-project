import type { StatusType } from "@/components/shared/military/types";
import { getMilitaryStats } from "@root/lib/data/military";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportRadarWrapper as ReportRadar } from "@/components/shared/military/dashboard/reports/report-radar-wrapper";
import { ReportRotationTable } from "@/components/shared/military/dashboard/reports/report-rotation-table";
import { ReportQuickCards } from "@/components/shared/military/dashboard/reports/report-quick-cards";

const ALL_STATUSES: StatusType[] = [
  "active",
  "on-mission",
  "wounded",
  "vacation",
  "reserve",
];

const STATUS_LABELS: Record<StatusType, string> = {
  active: "Активні",
  "on-mission": "На завданні",
  wounded: "Поранені",
  vacation: "Відпустка",
  reserve: "Резерв",
};

export default async function ReportsPage() {
  const { statusCounts, replacementCount, totalCount, personnel } =
    await getMilitaryStats();

  const distribution = Object.fromEntries(
    ALL_STATUSES.map((status) => [
      status,
      statusCounts.find((g) => g.status === status)?._count.id ?? 0,
    ]),
  ) as Record<StatusType, number>;

  const radarData = ALL_STATUSES.map((status) => ({
    status: STATUS_LABELS[status],
    value: distribution[status],
  }));

  const readyCount = distribution.active;
  const woundedCount = distribution.wounded;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Звіти та аналітика</h1>
        <p className="text-sm text-muted-foreground">
          Ротація та резерв особового складу
        </p>
      </div>

      <ReportQuickCards
        totalCount={totalCount}
        readyCount={readyCount}
        replacementCount={replacementCount}
        woundedCount={woundedCount}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Розподіл за статусами</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportRadar
              data={radarData}
              maxValue={totalCount}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ротація — хто потребує заміни</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportRotationTable personnel={personnel} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
