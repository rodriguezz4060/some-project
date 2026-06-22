import { Card } from "@/components/ui/card";

interface StatItem {
  label: string;
  value: number;
  color: string;
}

interface Props {
  totalCount: number;
  readyCount: number;
  replacementCount: number;
  woundedCount: number;
}

export function ReportQuickCards({
  totalCount,
  readyCount,
  replacementCount,
  woundedCount,
}: Props) {
  const items: StatItem[] = [
    { label: "Всього", value: totalCount, color: "text-foreground" },
    {
      label: "Готові до ротації",
      value: readyCount,
      color: "text-emerald-500",
    },
    {
      label: "Потребують заміни",
      value: replacementCount,
      color: "text-amber-500",
    },
    { label: "Поранені", value: woundedCount, color: "text-rose-500" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} size="sm" className="py-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
          <div className="space-y-0.5 text-center">
            <div className={`text-2xl font-bold tabular-nums ${item.color}`}>
              {item.value}
            </div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
