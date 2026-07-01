"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@root/lib/utils";
import { Save, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { TextField, NumberField, SelectField } from "@/components/shared/form-fields";
import { toast } from "sonner";
import { createMilitary, updateMilitary } from "@root/actions/military";
import { createMilitarySchema } from "@root/lib/schemas/military";
import { statusConfig } from "@/components/shared/military/constants";
import type { MilitaryPersonnel } from "@/components/shared/military/types";
import type { CreateMilitaryData } from "@root/lib/schemas/military";

const ALL_STATUSES = ["active", "on-mission", "wounded", "vacation", "reserve"] as const;
const RANK_OPTIONS = ["лейтенант", "старший лейтенант", "капітан", "майор", "полковник", "сержант"];

function ArraySection<T extends Record<string, unknown>>({ title, fields, onAdd, remove, renderItem }: { title: string; fields: { id: string }[]; onAdd: (value: T | T[]) => void; remove: (index: number) => void; renderItem: (index: number) => React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground/80">{title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={() => onAdd({} as T)} className="gap-1">
          <Plus className="size-3.5" /> Додати
        </Button>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="relative border border-border/40 rounded-lg p-4 pt-7">
          <button
            type="button"
            onClick={() => remove(index)}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X className="size-4" />
          </button>
          {renderItem(index)}
        </div>
      ))}
    </div>
  );
}

const DEFAULTS: CreateMilitaryData = {
  fullName: "", rank: "сержант", position: "", unit: "",
  status: "active", birthDate: "", photo: "",
  experience: undefined, missions: undefined, phone: "",
  email: "", lastActiveDays: undefined,
  medicalRecords: [], achievements: [], equipment: [],
  positionHistory: [],
  clothingSizes: { height: "", chest: "", waist: "", shoes: "", headgear: "", uniform: "" },
};

function getDefaultValues(person?: MilitaryPersonnel): CreateMilitaryData {
  if (!person) return { ...DEFAULTS };
  return {
    ...DEFAULTS,
    fullName: person.fullName,
    rank: person.rank,
    position: person.position,
    unit: person.unit,
    status: person.status,
    birthDate: person.birthDate,
    photo: person.photo ?? "",
    experience: person.experience ?? undefined,
    missions: person.missions ?? undefined,
    phone: person.phone ?? "",
    email: person.email ?? "",
    lastActiveDays: person.lastActiveDays ?? undefined,
    medicalRecords: person.medicalRecords?.map((r) => ({ ...r, notes: r.notes ?? "" })) ?? [],
    achievements: person.achievements?.map((a) => ({ ...a, description: a.description ?? "" })) ?? [],
    equipment: person.equipment?.map((e) => ({ ...e, serialNumber: e.serialNumber ?? "" })) ?? [],
    positionHistory: person.positionHistory?.map((p) => ({ ...p, endDate: p.endDate ?? "" })) ?? [],
    clothingSizes: person.clothingSizes
      ? { height: person.clothingSizes.height ?? "", chest: person.clothingSizes.chest ?? "", waist: person.clothingSizes.waist ?? "", shoes: person.clothingSizes.shoes ?? "", headgear: person.clothingSizes.headgear ?? "", uniform: person.clothingSizes.uniform ?? "" }
      : { height: "", chest: "", waist: "", shoes: "", headgear: "", uniform: "" },
  };
}

interface Props {
  initialData?: MilitaryPersonnel;
}

export function MilitaryForm({ initialData }: Props) {
  const router = useRouter();
  const isEdit = !!initialData;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateMilitaryData>({
    resolver: zodResolver(createMilitarySchema) as unknown as Resolver<CreateMilitaryData>,
    defaultValues: getDefaultValues(initialData),
  });

  const medField = useFieldArray({ control: form.control, name: "medicalRecords" });
  const achField = useFieldArray({ control: form.control, name: "achievements" });
  const eqField = useFieldArray({ control: form.control, name: "equipment" });
  const posField = useFieldArray({ control: form.control, name: "positionHistory" });

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

  async function onSubmit(data: CreateMilitaryData) {
    setIsLoading(true);
    try {
      if (isEdit) {
        await updateMilitary(initialData.id!, data);
        toast.success("Профіль оновлено", {
          description: `${data.fullName} — зміни збережено`,
        });
        router.push(`/military/${initialData.id!}`);
      } else {
        const result = await createMilitary(data);
        toast.success("Анкету збережено", {
          description: `${result.fullName} додано до списку`,
        });
        router.push("/military");
      }
    } catch (err) {
      handleServerError(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Основна інформація</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <SelectField control={form.control} name="rank" label="Військове звання" options={RANK_OPTIONS} />
            <TextField control={form.control} name="fullName" label="ПІБ" placeholder="Ковальчук Андрій Петрович" />
            <TextField control={form.control} name="position" label="Посада" placeholder="Командир взводу" />
            <TextField control={form.control} name="unit" label="Підрозділ" placeholder="72 ОМБр" />
            <SelectField control={form.control} name="status" label="Статус" options={ALL_STATUSES.map((s) => ({ value: s, label: statusConfig[s]?.label ?? s }))} />
            <TextField control={form.control} name="birthDate" label="Дата народження" type="date" />
            <TextField control={form.control} name="photo" label="Фото (URL)" placeholder="https://example.com/photo.jpg" />
            <TextField control={form.control} name="phone" label="Номер телефону" placeholder="+380 50 111 22 33" type="tel" />
            <TextField control={form.control} name="email" label="Email" placeholder="andriy@example.com" type="email" />
            <NumberField control={form.control} name="missions" label="Кількість місій" />
            <NumberField control={form.control} name="experience" label="Досвід (років)" />
            <NumberField control={form.control} name="lastActiveDays" label="Днів з останньої активності" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Позиції</CardTitle>
          </CardHeader>
          <CardContent>
            <ArraySection
              title="Історія посад"
              fields={posField.fields}
              onAdd={posField.prepend}
              remove={posField.remove}
              renderItem={(i) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <FormField control={form.control} name={`positionHistory.${i}.position`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Посада</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="Командир взводу" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`positionHistory.${i}.unit`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Підрозділ</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="72 ОМБр" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`positionHistory.${i}.startDate`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Дата початку</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="ММ.РРРР" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`positionHistory.${i}.endDate`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Дата закінчення</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="ММ.РРРР" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Медицина</CardTitle>
          </CardHeader>
          <CardContent>
            <ArraySection
              title="Медичні записи"
              fields={medField.fields}
              onAdd={medField.append}
              remove={medField.remove}
              renderItem={(i) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <FormField control={form.control} name={`medicalRecords.${i}.condition`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Діагноз</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="Захворювання / травма" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`medicalRecords.${i}.status`} render={({ field }) => (
                    <FormItem><FormLabel>Статус</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Активний</SelectItem><SelectItem value="resolved">Вирішено</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`medicalRecords.${i}.diagnosisDate`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Дата діагнозу</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ""} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`medicalRecords.${i}.notes`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Нотатки</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="..." className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Нагороди</CardTitle>
          </CardHeader>
          <CardContent>
            <ArraySection
              title="Нагороди та відзнаки"
              fields={achField.fields}
              onAdd={achField.append}
              remove={achField.remove}
              renderItem={(i) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <FormField control={form.control} name={`achievements.${i}.name`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Назва</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="Орден «За мужність»" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`achievements.${i}.type`} render={({ field }) => (
                    <FormItem><FormLabel>Тип</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="medal">Медаль</SelectItem><SelectItem value="commendation">Відзнака</SelectItem><SelectItem value="certificate">Грамота</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`achievements.${i}.date`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Дата</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ""} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`achievements.${i}.description`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Опис</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="..." className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Майно</CardTitle>
          </CardHeader>
          <CardContent>
            <ArraySection
              title="Спорядження та зброя"
              fields={eqField.fields}
              onAdd={eqField.append}
              remove={eqField.remove}
              renderItem={(i) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  <FormField control={form.control} name={`equipment.${i}.name`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Назва</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="M4A1" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`equipment.${i}.type`} render={({ field }) => (
                    <FormItem><FormLabel>Тип</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="weapon">Зброя</SelectItem><SelectItem value="armor">Броня</SelectItem><SelectItem value="gear">Спорядження</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`equipment.${i}.serialNumber`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Серійний номер</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="SN-123456" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name={`equipment.${i}.issuedDate`} render={({ field, fieldState }) => (
                    <FormItem><FormLabel>Дата видачі</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ""} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Розміри</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
            <FormField control={form.control} name="clothingSizes.height" render={({ field, fieldState }) => (
              <FormItem><FormLabel>Зріст (см)</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="180" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="clothingSizes.chest" render={({ field, fieldState }) => (
              <FormItem><FormLabel>Обхват грудей (см)</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="96" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="clothingSizes.waist" render={({ field, fieldState }) => (
              <FormItem><FormLabel>Обхват талії (см)</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="80" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="clothingSizes.shoes" render={({ field, fieldState }) => (
              <FormItem><FormLabel>Розмір взуття</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="43" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="clothingSizes.headgear" render={({ field, fieldState }) => (
              <FormItem><FormLabel>Головний убір</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="56" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="clothingSizes.uniform" render={({ field, fieldState }) => (
              <FormItem><FormLabel>Форма одягу</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="48/4" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" size="lg" disabled={isLoading} className="gap-2">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isLoading ? "Збереження..." : (isEdit ? "Зберегти зміни" : "Зберегти анкету")}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => router.push(isEdit ? `/military/${initialData.id!}` : "/military")}
            disabled={isLoading}
          >
            Скасувати
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
