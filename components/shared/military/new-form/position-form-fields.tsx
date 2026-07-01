"use client";

import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { cn } from "@root/lib/utils";
import { toDateInput, fromDateInput } from "@root/lib/utils/dates";
import { X } from "lucide-react";
import type { Control } from "react-hook-form";
import type { CreateMilitaryData } from "@root/lib/schemas/military";

interface Props {
  control: Control<CreateMilitaryData>;
  index: number;
}

export function PositionFormFields({ control, index }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
      <FormField control={control} name={`positionHistory.${index}.position`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Посада</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="Командир взводу" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`positionHistory.${index}.unit`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Підрозділ</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="72 ОМБр" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`positionHistory.${index}.startDate`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Дата початку</FormLabel><FormControl><div className="flex items-center gap-1.5"><Input type="date" {...field} value={toDateInput(field.value ?? "")} onChange={(e) => field.onChange(fromDateInput(e.target.value))} className={cn("flex-1", fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} />{field.value && <button type="button" onClick={() => field.onChange("")} className="flex items-center justify-center size-7 shrink-0 rounded-md border border-input bg-background hover:bg-muted transition-colors cursor-pointer"><X className="size-3.5 text-muted-foreground/60" /></button>}</div></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name={`positionHistory.${index}.endDate`} render={({ field, fieldState }) => (
        <FormItem><FormLabel>Дата закінчення</FormLabel><FormControl><div className="flex items-center gap-1.5"><Input type="date" {...field} value={toDateInput(field.value ?? "")} onChange={(e) => field.onChange(fromDateInput(e.target.value))} className={cn("flex-1", fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} />{field.value && <button type="button" onClick={() => field.onChange("")} className="flex items-center justify-center size-7 shrink-0 rounded-md border border-input bg-background hover:bg-muted transition-colors cursor-pointer"><X className="size-3.5 text-muted-foreground/60" /></button>}</div></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  );
}
