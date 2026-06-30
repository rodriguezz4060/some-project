"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@root/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormProvider,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { createFuelRecord, updateFuelRecord } from "@root/actions/fuel";
import { createFuelRecordSchema } from "@root/lib/schemas/fuel";
import { FUEL_TYPE_OPTIONS } from "./constants";
import type { FuelRecord, Vehicle } from "./types";
import type { CreateFuelRecordData } from "@root/lib/schemas/fuel";

interface Props {
  vehicles: Pick<Vehicle, "id" | "brand" | "model" | "licensePlate">[];
  initialData?: FuelRecord;
  preselectedVehicleId?: number;
}

export function FuelRecordForm({ vehicles, initialData, preselectedVehicleId }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateFuelRecordData>({
    resolver: zodResolver(createFuelRecordSchema),
    defaultValues: {
      vehicleId: initialData?.vehicleId ?? preselectedVehicleId ?? 0,
      date: initialData?.date ?? new Date().toISOString().split("T")[0],
      fuelType: initialData?.fuelType ?? "",
      liters: initialData?.liters ?? 0,
      pricePerLiter: initialData?.pricePerLiter ?? undefined,
      totalCost: initialData?.totalCost ?? undefined,
      mileage: initialData?.mileage ?? undefined,
      driverName: initialData?.driverName ?? "",
      invoiceNumber: initialData?.invoiceNumber ?? undefined,
      supplier: initialData?.supplier ?? undefined,
      purpose: initialData?.purpose ?? undefined,
    },
  });

  const watchedPpl = useWatch({ control: form.control, name: "pricePerLiter" });
  const watchedLiters = useWatch({ control: form.control, name: "liters" });

  function autoCalculateTotal(litersVal: string, priceVal: string) {
    const l = parseFloat(litersVal);
    const ppl = parseFloat(priceVal);
    if (l && ppl) {
      form.setValue("totalCost", Math.round(l * ppl * 100) / 100, { shouldValidate: false });
    }
  }

  const handleServerError = (err: unknown) => {
    const message = err instanceof Error ? err.message : "";
    if (message) {
      const parts = message.split("; ");
      const msgs = parts.map((p) => {
        const colonIdx = p.indexOf(": ");
        return colonIdx > 0 ? p.slice(colonIdx + 2) : p;
      });
      toast.error(
        <div className="flex flex-col gap-0.5">
          {msgs.map((m, i) => <span key={i}>{m}</span>)}
        </div>,
      );
    } else {
      toast.error("Помилка при збереженні");
    }
  };

  async function onSubmit(data: CreateFuelRecordData) {
    setLoading(true);
    try {
      if (isEdit && initialData) {
        await updateFuelRecord(initialData.id, data);
        toast.success("Заправку оновлено");
      } else {
        await createFuelRecord(data);
        toast.success("Заправку додано");
      }
      router.push("/fuel");
      router.refresh();
    } catch (err) {
      handleServerError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Редагувати заправку" : "Нова заправка"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="vehicleId" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Автомобіль</FormLabel><FormControl><Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}><SelectTrigger className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")}><SelectValue placeholder="Оберіть автомобіль" /></SelectTrigger><SelectContent>{vehicles.map((v) => (<SelectItem key={v.id} value={String(v.id)}>{v.brand} {v.model} — {v.licensePlate}</SelectItem>))}</SelectContent></Select></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="date" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Дата</FormLabel><FormControl><Input type="date" {...field} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="fuelType" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Тип пального</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")}><SelectValue placeholder="Оберіть пальне" /></SelectTrigger><SelectContent>{FUEL_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="liters" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Кількість літрів</FormLabel><FormControl><Input type="number" step="0.01" value={field.value ?? ""} onChange={(e) => { const v = e.target.value; field.onChange(v ? Number(v) : undefined); autoCalculateTotal(v, String(watchedPpl ?? "")); }} placeholder="20.0" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="pricePerLiter" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Ціна за літр</FormLabel><FormControl><Input type="number" step="0.01" value={field.value ?? ""} onChange={(e) => { const v = e.target.value; field.onChange(v ? Number(v) : undefined); autoCalculateTotal(String(watchedLiters ?? ""), v); }} placeholder="53.50" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="totalCost" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Загальна вартість</FormLabel><FormControl><Input type="number" step="0.01" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="1070.00" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="mileage" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Пробіг (км)</FormLabel><FormControl><Input type="number" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="125000" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="driverName" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Водій</FormLabel><FormControl><Input {...field} placeholder="ПІБ водія" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="purpose" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Призначення</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value ?? ""}><SelectTrigger className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")}><SelectValue placeholder="Мета" /></SelectTrigger><SelectContent><SelectItem value="combat">Бойове завдання</SelectItem><SelectItem value="rotation">Планова заміна</SelectItem><SelectItem value="logistics">Господарчі потреби</SelectItem><SelectItem value="training">Навчання</SelectItem><SelectItem value="other">Інше</SelectItem></SelectContent></Select></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="invoiceNumber" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Номер накладної</FormLabel><FormControl><Input {...field} value={field.value ?? ""} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="supplier" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Постачальник</FormLabel><FormControl><Input {...field} value={field.value ?? ""} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Збереження..." : isEdit ? "Зберегти зміни" : "Додати заправку"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/fuel")}>
                Скасувати
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </FormProvider>
  );
}
