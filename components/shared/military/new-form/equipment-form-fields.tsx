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

export function EquipmentFormFields({ control, index }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <FormField control={control} name={`equipment.${index}.name`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Назва</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="M4A1" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`equipment.${index}.type`} render={({ field }) => (
        <FormItem><FormLabel>Тип</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="weapon">Зброя</SelectItem><SelectItem value="armor">Броня</SelectItem><SelectItem value="gear">Спорядження</SelectItem></SelectContent></Select><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`equipment.${index}.serialNumber`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Серійний номер</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="SN-123456" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`equipment.${index}.issuedDate`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Дата видачі</FormLabel><FormControl><Input type="date" {...field} value={field.value ?? ""} className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  );
}
