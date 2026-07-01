"use client";

import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { cn } from "@root/lib/utils";
import type { Control } from "react-hook-form";
import type { CreateMilitaryData } from "@root/lib/schemas/military";

interface Props {
  control: Control<CreateMilitaryData>;
}

export function ClothingSizesFields({ control }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
      <FormField control={control} name="clothingSizes.height" render={({ field, fieldState }) => (
        <FormItem><FormLabel>Зріст (см)</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="180" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="clothingSizes.chest" render={({ field, fieldState }) => (
        <FormItem><FormLabel>Обхват грудей (см)</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="96" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="clothingSizes.waist" render={({ field, fieldState }) => (
        <FormItem><FormLabel>Обхват талії (см)</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="80" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="clothingSizes.shoes" render={({ field, fieldState }) => (
        <FormItem><FormLabel>Розмір взуття</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="43" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="clothingSizes.headgear" render={({ field, fieldState }) => (
        <FormItem><FormLabel>Головний убір</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="56" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
      <FormField control={control} name="clothingSizes.uniform" render={({ field, fieldState }) => (
        <FormItem><FormLabel>Форма одягу</FormLabel><FormControl><Input {...field} value={field.value ?? ""} placeholder="48/4" className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} /></FormControl><FormMessage /></FormItem>
      )} />
    </div>
  );
}
