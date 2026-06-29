import Link from "next/link";
import { Fuel, Gauge, Palette, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@root/lib/utils";
import { FUEL_TYPE_LABELS, VEHICLE_TYPE_LABELS } from "./constants";
import type { Vehicle } from "./types";

interface Props {
  vehicle: Vehicle;
  onDelete?: (id: number) => void;
  canManage?: boolean;
}

export function VehicleCard({ vehicle, onDelete, canManage }: Props) {
  const summary = vehicle._fuelSummary;

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Fuel className="size-5 text-primary" />
            </div>
            <div>
              <Link href={`/fuel/vehicles/${vehicle.id}`} className="font-semibold text-base hover:underline">
                {vehicle.brand} {vehicle.model}
              </Link>
              <p className="text-xs text-muted-foreground">{vehicle.licensePlate}</p>
            </div>
          </div>
          {canManage && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/fuel/vehicles/${vehicle.id}/edit`}>
                <Button variant="ghost" size="icon" className="size-8">
                  <Edit className="size-4" />
                </Button>
              </Link>
              {onDelete && (
                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => onDelete(vehicle.id)}>
                  <Trash2 className="size-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="secondary" className="text-xs">
            <Palette className="size-3 mr-1" />
            {VEHICLE_TYPE_LABELS[vehicle.type as keyof typeof VEHICLE_TYPE_LABELS] ?? vehicle.type}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Fuel className="size-3 mr-1" />
            {FUEL_TYPE_LABELS[vehicle.fuelType as keyof typeof FUEL_TYPE_LABELS] ?? vehicle.fuelType}
          </Badge>
          {vehicle.year && (
            <Badge variant="outline" className="text-xs">
              {vehicle.year}
            </Badge>
          )}
          {vehicle.tankCapacity && (
            <Badge variant="outline" className="text-xs">
              <Gauge className="size-3 mr-1" />
              {vehicle.tankCapacity} л
            </Badge>
          )}
        </div>
        {vehicle.unit && (
          <p className="text-xs text-muted-foreground">
            Підрозділ: {vehicle.unit}
          </p>
        )}
      </CardContent>

      {summary && summary.recordCount > 0 && (
        <CardFooter className={cn("flex justify-between border-t pt-3 text-xs text-muted-foreground")}>
          <span>Всього: <strong>{summary.totalLiters.toFixed(1)} л</strong></span>
          <span>Сума: <strong>{summary.totalCost.toFixed(0)} грн</strong></span>
          <span>Заправок: <strong>{summary.recordCount}</strong></span>
        </CardFooter>
      )}

      {(!summary || summary.recordCount === 0) && (
        <CardFooter className="border-t pt-3">
          <p className="text-xs text-muted-foreground">Немає заправок</p>
        </CardFooter>
      )}
    </Card>
  );
}
