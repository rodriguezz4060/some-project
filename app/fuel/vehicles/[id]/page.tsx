import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Fuel, Receipt, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FuelRecordsTable } from "@/components/shared/fuel/fuel-records-table";
import { getVehicleById } from "@root/lib/data/fuel";
import { FUEL_TYPE_LABELS, VEHICLE_TYPE_LABELS } from "@/components/shared/fuel/constants";
import { auth } from "@root/lib/auth";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vehicle = await getVehicleById(Number(id));
  if (!vehicle) notFound();

  const session = await auth();
  const role = session?.user?.role;
  const canManage = role === "admin" || role === "moderator";

  const summary = vehicle._fuelSummary;

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
          <div className="flex gap-2">
            <Link href={`/fuel/refuel?vehicleId=${vehicle.id}`}>
              <Button variant="outline" size="sm">
                <Plus className="size-4 mr-1.5" />
                Заправка
              </Button>
            </Link>
            <Link href={`/fuel/vehicles/${vehicle.id}/edit`}>
              <Button variant="outline" size="sm">
                Редагувати
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-muted-foreground">{vehicle.licensePlate}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="secondary">{VEHICLE_TYPE_LABELS[vehicle.type as keyof typeof VEHICLE_TYPE_LABELS] ?? vehicle.type}</Badge>
          <Badge variant="outline">{FUEL_TYPE_LABELS[vehicle.fuelType as keyof typeof FUEL_TYPE_LABELS] ?? vehicle.fuelType}</Badge>
          {vehicle.year && <Badge variant="outline">{vehicle.year} р.</Badge>}
          {vehicle.tankCapacity && <Badge variant="outline">Бак: {vehicle.tankCapacity} л</Badge>}
          {vehicle.vin && <Badge variant="outline" className="font-mono text-xs">VIN: {vehicle.vin}</Badge>}
          {vehicle.unit && <Badge variant="outline">Підрозділ: {vehicle.unit}</Badge>}
        </div>
        {vehicle.notes && (
          <p className="text-sm text-muted-foreground mt-2">{vehicle.notes}</p>
        )}
      </div>

      <Separator />

      {summary && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Статистика</h2>
          <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <Fuel className="size-4 inline mr-1.5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.totalLiters.toFixed(1)} л</p>
              <p className="text-xs text-muted-foreground">Всього пального</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <Receipt className="size-4 inline mr-1.5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.totalCost.toFixed(0)} грн</p>
              <p className="text-xs text-muted-foreground">Загальна вартість</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <Gauge className="size-4 inline mr-1.5" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{summary.recordCount}</p>
              <p className="text-xs text-muted-foreground">Кількість заправок</p>
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      <Separator />

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Історія заправок</h2>
        <FuelRecordsTable records={vehicle.fuelRecords ?? []} canManage={canManage} />
      </div>
    </div>
  );
}
