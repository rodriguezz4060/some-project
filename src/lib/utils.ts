import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { zodResolver } from "@hookform/resolvers/zod"
import type { Resolver, FieldValues } from "react-hook-form"
import type { ZodSchema } from "zod"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createZodResolver<T extends FieldValues>(schema: ZodSchema): Resolver<T> {
  return zodResolver(schema) as unknown as Resolver<T>;
}
