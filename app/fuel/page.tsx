import Link from "next/link";
import { Plus, Fuel, Receipt, BarChart3, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleCard } from "@/components/shared/fuel/vehicle-card";
import { getVehicles, getVehicleStats } from "@root/lib/data/fuel";
import { auth } from "@root/lib/auth";

export default async function FuelMain() {
  const session = await auth();
  const role = session?.user?.role;
  const canManage = role === "admin" || role === "moderator";

  const vehicles = await getVehicles();
  const stats = await getVehicleStats();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Автомобілі роти</h2>
          <p className="text-sm text-muted-foreground">
            {stats.totalVehicles} авто · {stats.totalRecords} заправок
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/fuel/records">
            <Button variant="ghost" size="sm">
              <ListOrdered className="size-4 mr-1.5" />
              Журнал
            </Button>
          </Link>
          {canManage && (
            <>
              <Link href="/fuel/refuel">
                <Button variant="outline" size="sm">
                  <Plus className="size-4 mr-1.5" />
                  Заправка
                </Button>
              </Link>
              <Link href="/fuel/vehicles/new">
                <Button size="sm">
                  <Plus className="size-4 mr-1.5" />
                  Додати авто
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Загальна статистика</h2>
        <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Fuel className="size-4 inline mr-1.5" />
              Всього пального
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalLiters.toFixed(1)} л</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Receipt className="size-4 inline mr-1.5" />
              Загальна вартість
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalCost.toFixed(0)} грн</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <BarChart3 className="size-4 inline mr-1.5" />
              Кількість заправок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalRecords}</p>
          </CardContent>
        </Card>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-4">Автомобілі</h2>
        {vehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Fuel className="size-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium">Автомобілів ще немає</p>
          <p className="text-sm text-muted-foreground mb-4">
            Додайте перший автомобіль роти
          </p>
          {canManage && (
            <Link href="/fuel/vehicles/new">
              <Button>
                <Plus className="size-4 mr-1.5" />
                Додати автомобіль
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-6 auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} canManage={canManage} />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
