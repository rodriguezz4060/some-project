import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver, FieldValues } from "react-hook-form"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createZodResolver<T extends FieldValues>(schema: any): Resolver<T> {
  return zodResolver(schema) as unknown as Resolver<T>;
}
