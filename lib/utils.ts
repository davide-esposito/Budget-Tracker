import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @param schema - The Zod schema to validate against
 * @param form - The form data to validate
 */
export function validateForm<T>(schema: z.ZodSchema<T>, form: unknown): T {
  const parsed = schema.safeParse(form);
  if (!parsed.success) {
    throw new Error("Invalid form data");
  }
  return parsed.data;
}
