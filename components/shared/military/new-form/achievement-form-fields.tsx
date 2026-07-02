"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { cn } from "@root/lib/utils";
import type { Control } from "react-hook-form";
import type { CreateMilitaryData } from "@root/lib/schemas/military";

interface Props {
  control: Control<CreateMilitaryData>;
  index: number;
}

export function AchievementFormFields({ control, index }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <FormField control={control} name={`achievements.${index}.name`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Назва</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="Орден «За мужність»" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`achievements.${index}.type`} render={({ field }) => (
        <FormItem><FormLabel>Тип</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Оберіть тип" /></SelectTrigger></FormControl><SelectContent><SelectItem value="medal">Медаль</SelectItem><SelectItem value="commendation">Відзнака</SelectItem><SelectItem value="certificate">Грамота</SelectItem></SelectContent></Select><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`achievements.${index}.date`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Дата</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ""} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`achievements.${index}.description`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Опис</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="..." className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  );
}
