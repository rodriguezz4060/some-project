"use client";

import { type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@root/lib/utils";

interface BaseProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
}

interface TextFieldProps<T extends FieldValues> extends BaseProps<T> {
  placeholder?: string;
  type?: string;
}

export function TextField<T extends FieldValues>({ control, name, label, placeholder, type }: TextFieldProps<T>) {
  return (
    <FormField control={control} name={name} render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} value={field.value ?? ""} type={type ?? "text"} placeholder={placeholder}
            className={cn("placeholder:text-muted-foreground/40", fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

interface TextareaFieldProps<T extends FieldValues> extends BaseProps<T> {
  placeholder?: string;
}

export function TextareaField<T extends FieldValues>({ control, name, label, placeholder }: TextareaFieldProps<T>) {
  return (
    <FormField control={control} name={name} render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Textarea {...field} value={field.value ?? ""} placeholder={placeholder} rows={3}
            className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

interface NumberFieldProps<T extends FieldValues> extends BaseProps<T> {
  placeholder?: string;
  step?: string;
}

export function NumberField<T extends FieldValues>({ control, name, label, placeholder, step }: NumberFieldProps<T>) {
  return (
    <FormField control={control} name={name} render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input type="text" inputMode="numeric" step={step} value={field.value ?? ""}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={placeholder}
            className={cn("placeholder:text-muted-foreground/40", fieldState.invalid && "border-destructive ring-3 ring-destructive/20")} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

interface SelectFieldProps<T extends FieldValues> extends BaseProps<T> {
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder?: string;
}

function toItems(options: readonly string[] | readonly { value: string; label: string }[]): { value: string; label: string }[] {
  return options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

export function SelectField<T extends FieldValues>({ control, name, label, options, placeholder }: SelectFieldProps<T>) {
  const items = toItems(options);
  return (
    <FormField control={control} name={name} render={({ field, fieldState }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Select onValueChange={field.onChange} value={field.value ?? ""}>
            <SelectTrigger className={cn(fieldState.invalid && "border-destructive ring-3 ring-destructive/20")}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {items.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}
