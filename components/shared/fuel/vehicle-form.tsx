"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createVehicle, updateVehicle } from "@root/actions/fuel";
import { VEHICLE_TYPE_OPTIONS, FUEL_TYPE_OPTIONS } from "./constants";
import type { Vehicle } from "./types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

interface Props {
  initialData?: Vehicle;
}

export function VehicleForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);

  const [brand, setBrand] = useState(initialData?.brand ?? "");
  const [model, setModel] = useState(initialData?.model ?? "");
  const [licensePlate, setLicensePlate] = useState(initialData?.licensePlate ?? "");
  const [type, setType] = useState(initialData?.type ?? "");
  const [year, setYear] = useState(initialData?.year ? String(initialData.year) : "");
  const [vin, setVin] = useState(initialData?.vin ?? "");
  const [fuelType, setFuelType] = useState(initialData?.fuelType ?? "");
  const [tankCapacity, setTankCapacity] = useState(
    initialData?.tankCapacity ? String(initialData.tankCapacity) : "",
  );
  const [unit, setUnit] = useState(initialData?.unit ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        brand: brand.trim(),
        model: model.trim(),
        licensePlate: licensePlate.trim(),
        type,
        year: year ? Number(year) : undefined,
        vin: vin.trim() || undefined,
        fuelType,
        tankCapacity: tankCapacity ? Number(tankCapacity) : undefined,
        unit: unit.trim(),
        notes: notes.trim() || undefined,
      };

      if (!payload.brand || !payload.model || !payload.licensePlate || !payload.type || !payload.fuelType || !payload.unit) {
        toast.error("Заповніть обов'язкові поля");
        setLoading(false);
        return;
      }

      if (isEdit && initialData) {
        await updateVehicle(initialData.id, payload);
        toast.success("Автомобіль оновлено");
      } else {
        await createVehicle(payload);
        toast.success("Автомобіль додано");
      }

      router.push("/fuel");
      router.refresh();
    } catch {
      toast.error("Помилка при збереженні");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Редагувати автомобіль" : "Новий автомобіль"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Марка *">
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Наприклад: Ford" />
            </Field>
            <Field label="Модель *">
              <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Наприклад: Transit" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Держномер *">
              <Input value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} placeholder="Наприклад: АА1234ВВ" />
            </Field>
            <Field label="Тип *">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть тип" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Тип пального *">
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть пальне" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Підрозділ *">
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Назва роти/підрозділу" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Рік випуску">
              <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2023" />
            </Field>
            <Field label="Об'єм баку (л)">
              <Input type="number" value={tankCapacity} onChange={(e) => setTankCapacity(e.target.value)} placeholder="80" />
            </Field>
            <Field label="VIN-код">
              <Input value={vin} onChange={(e) => setVin(e.target.value.toUpperCase())} placeholder="VIN" />
            </Field>
          </div>

          <Field label="Примітки">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Додаткова інформація..."
              rows={3}
            />
          </Field>

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
  );
}
