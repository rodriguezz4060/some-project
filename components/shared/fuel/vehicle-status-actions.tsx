"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { setVehicleStatus } from "@root/actions/fuel";

const config: Record<string, { next: string; label: string; icon: React.ReactNode; className: string; description: string }> = {
  "active→repair": {
    next: "repair",
    label: "В ремонт",
    icon: <Wrench className="size-4 mr-1.5" />,
    className: "bg-warning/10 text-warning hover:bg-warning/20 border-warning/30",
    description: "Автомобіль буде переведено в статус «В ремонті». Заправки для нього стануть недоступні.",
  },
  "active→decommissioned": {
    next: "decommissioned",
    label: "Вивести",
    icon: <RotateCcw className="size-4 mr-1.5" />,
    className: "bg-muted text-muted-foreground hover:bg-border border-border",
    description: "Автомобіль буде виведено з експлуатації. Його можна буде відновити пізніше.",
  },
  "repair→decommissioned": {
    next: "decommissioned",
    label: "Вивести",
    icon: <RotateCcw className="size-4 mr-1.5" />,
    className: "bg-muted text-muted-foreground hover:bg-border border-border",
    description: "Автомобіль буде виведено з експлуатації. Його можна буде відновити пізніше.",
  },
  "repair→active": {
    next: "active",
    label: "Відновити",
    icon: <RotateCcw className="size-4 mr-1.5" />,
    className: "bg-success/10 text-success hover:bg-success/20 border-success/30",
    description: "Автомобіль буде повернено в експлуатацію.",
  },
  "decommissioned→active": {
    next: "active",
    label: "Відновити",
    icon: <RotateCcw className="size-4 mr-1.5" />,
    className: "bg-success/10 text-success hover:bg-success/20 border-success/30",
    description: "Автомобіль буде повернено в експлуатацію.",
  },
};

interface Props {
  vehicleId: number;
  actions: string[];
}

export function VehicleStatusActions({ vehicleId, actions }: Props) {
  const router = useRouter();
  const [confirm, setConfirm] = useState<{ next: string; label: string; description: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!confirm) return;
    setLoading(true);
    try {
      await setVehicleStatus(vehicleId, confirm.next);
      router.refresh();
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setConfirm(null);
    }
  }

  return (
    <>
      {actions.map((key) => {
        const cfg = config[key];
        if (!cfg) return null;
        return (
          <Button
            key={key}
            variant="outline"
            size="sm"
            className={cfg.className}
            onClick={() => setConfirm({ next: cfg.next, label: cfg.label, description: cfg.description })}
          >
            {cfg.icon}{cfg.label}
          </Button>
        );
      })}

      {confirm && (
        <AlertDialog open onOpenChange={() => !loading && setConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Підтвердження</AlertDialogTitle>
              <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Скасувати</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm} disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin mr-1" /> : null}
                {loading ? "Зачекайте..." : confirm.label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
