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

export function MedicalFormFields({ control, index }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <FormField control={control} name={`medicalRecords.${index}.condition`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Діагноз</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="Захворювання / травма" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`medicalRecords.${index}.status`} render={({ field }) => (
        <FormItem><FormLabel>Статус</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Оберіть статус" /></SelectTrigger></FormControl><SelectContent><SelectItem value="active">Активний</SelectItem><SelectItem value="resolved">Вирішено</SelectItem></SelectContent></Select><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`medicalRecords.${index}.diagnosisDate`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Дата діагнозу</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ""} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`medicalRecords.${index}.notes`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Нотатки</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="..." className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  );
}
