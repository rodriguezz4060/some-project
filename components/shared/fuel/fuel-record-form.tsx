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
import { createFuelRecord, updateFuelRecord } from "@root/actions/fuel";
import { FUEL_TYPE_OPTIONS } from "./constants";
import type { FuelRecord, Vehicle } from "./types";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}{required && " *"}</Label>
      {children}
    </div>
  );
}

interface Props {
  vehicles: Pick<Vehicle, "id" | "brand" | "model" | "licensePlate">[];
  initialData?: FuelRecord;
  preselectedVehicleId?: number;
}

export function FuelRecordForm({ vehicles, initialData, preselectedVehicleId }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [loading, setLoading] = useState(false);

  const [vehicleId, setVehicleId] = useState(String(initialData?.vehicleId ?? preselectedVehicleId ?? ""));
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().split("T")[0]);
  const [fuelType, setFuelType] = useState(initialData?.fuelType ?? "");
  const [liters, setLiters] = useState(initialData?.liters ? String(initialData.liters) : "");
  const [pricePerLiter, setPricePerLiter] = useState(
    initialData?.pricePerLiter ? String(initialData.pricePerLiter) : "",
  );
  const [totalCost, setTotalCost] = useState(initialData?.totalCost ? String(initialData.totalCost) : "");
  const [mileage, setMileage] = useState(initialData?.mileage ? String(initialData.mileage) : "");
  const [driverName, setDriverName] = useState(initialData?.driverName ?? "");
  const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoiceNumber ?? "");
  const [supplier, setSupplier] = useState(initialData?.supplier ?? "");
  const [purpose, setPurpose] = useState(initialData?.purpose ?? "");

  function autoCalculateTotal(litersVal: string, priceVal: string) {
    const l = parseFloat(litersVal);
    const ppl = parseFloat(priceVal);
    if (l && ppl) {
      setTotalCost(String(Math.round(l * ppl * 100) / 100));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        vehicleId: Number(vehicleId),
        date,
        fuelType,
        liters: Number(liters),
        pricePerLiter: pricePerLiter ? Number(pricePerLiter) : undefined,
        totalCost: totalCost ? Number(totalCost) : undefined,
        mileage: mileage ? Number(mileage) : undefined,
        driverName: driverName.trim(),
        invoiceNumber: invoiceNumber.trim() || undefined,
        supplier: supplier.trim() || undefined,
        purpose: purpose.trim() || undefined,
      };

      if (!payload.vehicleId || !payload.date || !payload.fuelType || !payload.liters || !payload.driverName) {
        toast.error("Заповніть обов'язкові поля");
        setLoading(false);
        return;
      }

      if (isEdit && initialData) {
        await updateFuelRecord(initialData.id, payload);
        toast.success("Заправку оновлено");
      } else {
        await createFuelRecord(payload);
        toast.success("Заправку додано");
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
          <CardTitle>{isEdit ? "Редагувати заправку" : "Нова заправка"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Автомобіль" required>
              <Select value={vehicleId} onValueChange={setVehicleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть авто" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={String(v.id)}>
                      {v.brand} {v.model} — {v.licensePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Дата" required>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Тип пального" required>
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
            <Field label="Кількість літрів" required>
              <Input
                type="number"
                step="0.01"
                value={liters}
                onChange={(e) => { const v = e.target.value; setLiters(v); autoCalculateTotal(v, pricePerLiter); }}
                placeholder="20.0"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Ціна за літр">
              <Input
                type="number"
                step="0.01"
                value={pricePerLiter}
                onChange={(e) => { const v = e.target.value; setPricePerLiter(v); autoCalculateTotal(liters, v); }}
                placeholder="53.50"
              />
            </Field>
            <Field label="Загальна вартість">
              <Input
                type="number"
                step="0.01"
                value={totalCost}
                onChange={(e) => setTotalCost(e.target.value)}
                placeholder="1070.00"
              />
            </Field>
            <Field label="Пробіг (км)">
              <Input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="125000" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Водій" required>
              <Input value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder="ПІБ водія" />
            </Field>
            <Field label="Призначення">
              <Select value={purpose} onValueChange={setPurpose}>
                <SelectTrigger>
                  <SelectValue placeholder="Мета" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="combat">Бойове завдання</SelectItem>
                  <SelectItem value="rotation">Планова заміна</SelectItem>
                  <SelectItem value="logistics">Господарчі потреби</SelectItem>
                  <SelectItem value="training">Навчання</SelectItem>
                  <SelectItem value="other">Інше</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Номер накладної">
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} placeholder="" />
            </Field>
            <Field label="Постачальник">
              <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="" />
            </Field>
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
  );
}
