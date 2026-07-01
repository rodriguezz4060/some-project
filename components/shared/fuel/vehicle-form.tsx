"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { cn, createZodResolver } from "@root/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormProvider, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { TextField, NumberField, SelectField, TextareaField } from "@/components/shared/form-fields";
import { toast } from "sonner";
import { createVehicle, updateVehicle } from "@root/actions/fuel";
import { createVehicleSchema } from "@root/lib/schemas/fuel";
import { VEHICLE_TYPE_OPTIONS, FUEL_TYPE_OPTIONS } from "./constants";
import type { Vehicle } from "./types";
import type { CreateVehicleData } from "@root/lib/schemas/fuel";

interface Props {
  initialData?: Vehicle;
}

export function VehicleForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateVehicleData>({
    resolver: createZodResolver(createVehicleSchema),
    defaultValues: {
      brand: initialData?.brand ?? "",
      model: initialData?.model ?? "",
      licensePlate: initialData?.licensePlate ?? "",
      type: initialData?.type ?? undefined,
      year: initialData?.year ?? undefined,
      vin: initialData?.vin ?? undefined,
      fuelType: initialData?.fuelType ?? undefined,
      tankCapacity: initialData?.tankCapacity ?? undefined,
      unit: initialData?.unit ?? "",
      notes: initialData?.notes ?? undefined,
    },
  });

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

  async function onSubmit(data: CreateVehicleData) {
    setLoading(true);
    try {
      if (isEdit && initialData) {
        await updateVehicle(initialData.id, data);
        toast.success("Автомобіль оновлено");
      } else {
        await createVehicle(data);
        toast.success("Автомобіль додано");
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
            <CardTitle>{isEdit ? "Редагувати автомобіль" : "Новий автомобіль"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="brand" label="Марка" placeholder="Наприклад: Ford" />
              <TextField control={form.control} name="model" label="Модель" placeholder="Наприклад: Transit" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextField control={form.control} name="licensePlate" label="Держномер" placeholder="Наприклад: АА1234ВВ" />
              <SelectField control={form.control} name="type" label="Тип" options={VEHICLE_TYPE_OPTIONS} placeholder="Оберіть тип" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField control={form.control} name="fuelType" label="Тип пального" options={FUEL_TYPE_OPTIONS} placeholder="Оберіть пальне" />
              <TextField control={form.control} name="unit" label="Підрозділ" placeholder="Назва роти/підрозділу" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <NumberField control={form.control} name="year" label="Рік випуску" placeholder="2023" />
              <NumberField control={form.control} name="tankCapacity" label="Об'єм баку (л)" placeholder="80" />
            </div>

            <FormField control={form.control} name="vin" render={({ field, fieldState }) => (
              <FormItem><FormLabel>VIN-код</FormLabel><FormControl><Input {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value.toUpperCase())} placeholder="VIN" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
            )} />
            <TextareaField control={form.control} name="notes" label="Примітки" placeholder="Додаткова інформація..." />

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Збереження..." : isEdit ? "Зберегти зміни" : "Додати автомобіль"}
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
