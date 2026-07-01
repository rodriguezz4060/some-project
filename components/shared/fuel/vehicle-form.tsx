"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import {
  FormProvider,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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
    resolver: zodResolver(createVehicleSchema) as unknown as Resolver<CreateVehicleData>,
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
              <FormField control={form.control} name="brand" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Марка</FormLabel><FormControl><Input {...field} placeholder="Наприклад: Ford" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="model" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Модель</FormLabel><FormControl><Input {...field} placeholder="Наприклад: Transit" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="licensePlate" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Держномер</FormLabel><FormControl><Input {...field} placeholder="Наприклад: АА1234ВВ" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="type" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Тип</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")}><SelectValue placeholder="Оберіть тип" /></SelectTrigger><SelectContent>{VEHICLE_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="fuelType" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Тип пального</FormLabel><FormControl><Select onValueChange={field.onChange} value={field.value}><SelectTrigger className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")}><SelectValue placeholder="Оберіть пальне" /></SelectTrigger><SelectContent>{FUEL_TYPE_OPTIONS.map((opt) => (<SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>))}</SelectContent></Select></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="unit" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Підрозділ</FormLabel><FormControl><Input {...field} placeholder="Назва роти/підрозділу" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField control={form.control} name="year" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Рік випуску</FormLabel><FormControl><Input type="number" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="2023" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="tankCapacity" render={({ field, fieldState }) => (
                <FormItem><FormLabel>Об&apos;єм баку (л)</FormLabel><FormControl><Input type="number" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} placeholder="80" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="vin" render={({ field, fieldState }) => (
                <FormItem><FormLabel>VIN-код</FormLabel><FormControl><Input {...field} value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value.toUpperCase())} placeholder="VIN" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="notes" render={({ field, fieldState }) => (
              <FormItem><FormLabel>Примітки</FormLabel><FormControl><Textarea {...field} value={field.value ?? ""} placeholder="Додаткова інформація..." rows={3} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
            )} />

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
