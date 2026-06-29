import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FUEL_TYPE_LABELS } from "./constants";
import type { FuelRecord } from "./types";

interface Props {
  records: FuelRecord[];
  canManage?: boolean;
  onDelete?: (id: number) => void;
}

export function FuelRecordsTable({ records, canManage, onDelete }: Props) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-muted-foreground">Заправок ще немає</p>
        <p className="text-sm text-muted-foreground/60">
          Додайте першу заправку
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Автомобіль</TableHead>
            <TableHead>Пальне</TableHead>
            <TableHead>Літри</TableHead>
            <TableHead>Ціна/л</TableHead>
            <TableHead>Вартість</TableHead>
            <TableHead>Пробіг</TableHead>
            <TableHead>Водій</TableHead>
            <TableHead>Призначення</TableHead>
            {canManage && <TableHead className="w-20">Дії</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="whitespace-nowrap">{r.date}</TableCell>
              <TableCell>
                {r.vehicle ? (
                  <Link href={`/fuel/vehicles/${r.vehicle.id}`} className="hover:underline font-medium">
                    {r.vehicle.brand} {r.vehicle.model}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {FUEL_TYPE_LABELS[r.fuelType as keyof typeof FUEL_TYPE_LABELS] ?? r.fuelType}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{r.liters.toFixed(1)}</TableCell>
              <TableCell>{r.pricePerLiter ? `${r.pricePerLiter.toFixed(2)} грн` : "—"}</TableCell>
              <TableCell>{r.totalCost ? `${r.totalCost.toFixed(2)} грн` : "—"}</TableCell>
              <TableCell>{r.mileage ? `${r.mileage.toLocaleString()} км` : "—"}</TableCell>
              <TableCell>{r.driverName}</TableCell>
              <TableCell className="max-w-[120px] truncate" title={r.purpose ?? ""}>
                {r.purpose ?? "—"}
              </TableCell>
              {canManage && (
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/fuel/records/${r.id}/edit`}>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Edit className="size-4" />
                      </Button>
                    </Link>
                    {onDelete && (
                      <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => onDelete(r.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
