import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Props {
  totalCount: number;
  activeCount: number;
  onMissionCount: number;
  woundedCount: number;
}

export function ReportStatCards({
  totalCount,
  activeCount,
  onMissionCount,
  woundedCount,
}: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader>
          <CardDescription>Загалом</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums">
            {totalCount}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Активні</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums text-emerald-500">
            {activeCount}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>На завданні</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums text-amber-500">
            {onMissionCount}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Поранені</CardDescription>
          <CardTitle className="text-3xl font-semibold tabular-nums text-rose-500">
            {woundedCount}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
