import { memo } from "react";
import Link from "next/link";
import { Fuel, Gauge, Palette, Edit, Wrench, Archive, RotateCcw } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@root/lib/utils";
import { FUEL_TYPE_LABELS, VEHICLE_TYPE_LABELS, VEHICLE_STATUS_LABELS } from "./constants";
import type { Vehicle } from "./types";
import type { VehicleStatus } from "./constants";

interface Props {
  vehicle: Vehicle;
  onStatusChange?: (id: number, status: VehicleStatus) => void;
  canManage?: boolean;
}

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  repair: "bg-warning/10 text-warning border-warning/20",
  decommissioned: "bg-muted text-muted-foreground border-border",
};

const statusIcons: Record<string, React.ReactNode> = {
  active: null,
  repair: <Wrench className="size-3 mr-1" />,
  decommissioned: <Archive className="size-3 mr-1" />,
};

const nextStatus: Record<string, VehicleStatus> = {
  active: "repair",
  repair: "active",
  decommissioned: "active",
};

export const VehicleCard = memo(function VehicleCard({ vehicle, onStatusChange, canManage }: Props) {
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
          {vehicle.status !== "active" && (
            <Badge variant="outline" className={cn("text-xs", statusStyles[vehicle.status])}>
              {statusIcons[vehicle.status]}
              {VEHICLE_STATUS_LABELS[vehicle.status as keyof typeof VEHICLE_STATUS_LABELS] ?? vehicle.status}
            </Badge>
          )}
          {canManage && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Link href={`/fuel/vehicles/${vehicle.id}/edit`}>
                <Button variant="ghost" size="icon" className="size-8">
                  <Edit className="size-4" />
                </Button>
              </Link>
              {onStatusChange && (
                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground" onClick={() => onStatusChange(vehicle.id, nextStatus[vehicle.status])}>
                  {vehicle.status === "active" ? <Wrench className="size-4" /> : <RotateCcw className="size-4" />}
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
});
