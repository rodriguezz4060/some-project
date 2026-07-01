"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/shared/fuel/vehicle-card";
import { setVehicleStatus } from "@root/actions/fuel";
import { VEHICLE_STATUS_LABELS } from "@/components/shared/fuel/constants";
import type { Vehicle } from "@/components/shared/fuel/types";
import type { VehicleStatus } from "@/components/shared/fuel/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PER_PAGE = 12;

const NORMALIZE: Record<string, string> = {
  а: "a", в: "b", е: "e", і: "i", к: "k", м: "m",
  н: "h", о: "o", р: "p", с: "c", т: "t", х: "x",
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[авеікмнорстх]/g, (c) => NORMALIZE[c]);
}

interface Props {
  vehicles: Vehicle[];
  canManage: boolean;
}

export function VehicleListClient({ vehicles, canManage }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(PER_PAGE);
  const [statusTarget, setStatusTarget] = useState<{ id: number; status: VehicleStatus } | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return vehicles;
    const q = normalize(search);
    return vehicles.filter((v) =>
      normalize(`${v.brand} ${v.model} ${v.licensePlate}`).includes(q),
    );
  }, [vehicles, search]);

  const displayed = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  async function handleStatusChange(id: number, newStatus: VehicleStatus) {
    setLoading(true);
    try {
      await setVehicleStatus(id, newStatus);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setStatusTarget(null);
    }
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium">Автомобілів ще немає</p>
        <p className="text-sm text-muted-foreground mb-4">
          Додайте перший автомобіль роти
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Пошук за маркою, моделлю або номером..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setVisible(PER_PAGE);
          }}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          Нічого не знайдено
        </div>
      ) : (
        <>
          <div className="grid gap-6 auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {displayed.map((v) => (
              <VehicleCard key={v.id} vehicle={v} canManage={canManage} onStatusChange={(id, s) => setStatusTarget({ id, status: s })} />
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => setVisible((p) => p + PER_PAGE)}
              >
                Показати ще ({filtered.length - visible})
              </Button>
            </div>
          )}
        </>
      )}
      {statusTarget && (
        <AlertDialog open onOpenChange={() => !loading && setStatusTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Змінити статус автомобіля</AlertDialogTitle>
              <AlertDialogDescription>
                Авто буде переведено в статус «{VEHICLE_STATUS_LABELS[statusTarget.status]}».
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Скасувати</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleStatusChange(statusTarget.id, statusTarget.status)} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
                {loading ? "Збереження..." : "Підтвердити"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
