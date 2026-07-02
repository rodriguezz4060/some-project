"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { cn, createZodResolver } from "@root/lib/utils";
import { parseZodErrorMessages } from "@root/lib/form-utils";
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
import { TextField, NumberField, SelectField } from "@/components/shared/ui/form-fields";
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
    resolver: createZodResolver<CreateFuelRecordData>(createFuelRecordSchema),
    defaultValues: {
      vehicleId: initialData?.vehicleId ?? preselectedVehicleId ?? 0,
      date: initialData?.date ?? new Date().toISOString().split("T")[0],
      fuelType: initialData?.fuelType ?? undefined,
      liters: initialData?.liters ?? undefined,
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

  function autoCalculateTotal(liters: number, pricePerLiter: number) {
    if (liters > 0 && pricePerLiter > 0) {
      form.setValue("totalCost", Math.round(liters * pricePerLiter * 100) / 100, { shouldValidate: false });
    }
  }

  const handleServerError = (err: unknown) => {
    const msgs = parseZodErrorMessages(err);
    if (msgs) {
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
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? "Редагувати заправку" : "Нова заправка"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="vehicleId" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Автомобіль</FormLabel><FormControl><Select onValueChange={(v) => field.onChange(Number(v))} value={field.value ? String(field.value) : undefined}><SelectTrigger className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")}><SelectValue placeholder="Оберіть автомобіль" /></SelectTrigger><SelectContent>{vehicles.map((v) => (<SelectItem key={v.id} value={String(v.id)}>{v.brand} {v.model} — {v.licensePlate}</SelectItem>))}</SelectContent></Select></FormControl><FormMessage /></FormItem>
              )} />
              <TextField control={form.control} name="date" label="Дата" type="date" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField control={form.control} name="fuelType" label="Тип пального" options={FUEL_TYPE_OPTIONS} placeholder="Оберіть пальне" />
              <FormField control={form.control} name="liters" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Кількість літрів</FormLabel><FormControl><Input type="number" step="0.01" value={field.value ?? ""} onChange={(e) => { const val = e.target.value; if (val === "") { field.onChange(undefined); return; } const v = Number(val); field.onChange(v); autoCalculateTotal(v, watchedPpl ?? 0); }} placeholder="20.0" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="pricePerLiter" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Ціна за літр</FormLabel><FormControl><Input type="number" step="0.01" value={field.value ?? ""} onChange={(e) => { const val = e.target.value; if (val === "") { field.onChange(undefined); return; } const v = Number(val); field.onChange(v); autoCalculateTotal(watchedLiters ?? 0, v); }} placeholder="53.50" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
              <NumberField control={form.control} name="totalCost" label="Загальна вартість" placeholder="1070.00" step="0.01" />
              <NumberField control={form.control} name="mileage" label="Пробіг (км)" placeholder="125000" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="driverName" label="Водій" placeholder="ПІБ водія" />
              <SelectField control={form.control} name="purpose" label="Призначення" placeholder="Мета" options={[{ value: "combat", label: "Бойове завдання" }, { value: "rotation", label: "Планова заміна" }, { value: "logistics", label: "Господарчі потреби" }, { value: "training", label: "Навчання" }, { value: "other", label: "Інше" }]} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="invoiceNumber" label="Номер накладної" placeholder="" />
              <TextField control={form.control} name="supplier" label="Постачальник" placeholder="" />
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
