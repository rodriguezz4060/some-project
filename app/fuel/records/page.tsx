import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FuelRecordsTable } from "@/components/shared/fuel/records/fuel-records-table";
import { FuelDateFilter } from "@/components/shared/fuel/records/fuel-date-filter";
import { getFuelRecords } from "@root/lib/data/fuel";
import { auth } from "@root/lib/auth";

export default async function FuelRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ dateFrom?: string; dateTo?: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role;
  const canManage = role === "admin" || role === "moderator";

  const { dateFrom, dateTo } = await searchParams;

  const records = await getFuelRecords({
    dateFrom,
    dateTo,
  });

  const totalLiters = records.reduce((sum, r) => sum + r.liters, 0);
  const totalCost = records.reduce((sum, r) => sum + (r.totalCost ?? 0), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/fuel"
            className="inline-flex items-center gap-1.5 text-base text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            До списку
          </Link>
        </div>
        {canManage && (
          <Link href="/fuel/refuel">
            <Button size="sm">
              <Plus className="size-4 mr-1.5" />
              Нова заправка
            </Button>
          </Link>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Журнал заправок</h1>
          <p className="text-sm text-muted-foreground">
            {records.length > 0
              ? `Всього ${records.length} записів, ${totalLiters.toFixed(1)} л, ${totalCost.toFixed(0)} грн`
              : "Записів поки немає"}
          </p>
        </div>
        <FuelDateFilter initialFrom={dateFrom ?? ""} initialTo={dateTo ?? ""} />
      </div>

      <FuelRecordsTable records={records} canManage={canManage} />
    </div>
  );
}
