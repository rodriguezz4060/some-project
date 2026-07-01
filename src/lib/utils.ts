import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { zodResolver as baseResolver } from "@hookform/resolvers/zod"
import type { Resolver, FieldValues } from "react-hook-form"
import type { $ZodType } from "zod/v4/core"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function createZodResolver<T extends FieldValues>(schema: $ZodType<T, FieldValues>): Resolver<T> {
  return baseResolver(schema) as unknown as Resolver<T>;
}
