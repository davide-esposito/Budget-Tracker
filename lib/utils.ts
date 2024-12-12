import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

/**
 * @param inputs - A list of class values to combine
 * @returns A merged string of class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * @template T - The expected type of the parsed form data
 * @param schema - The Zod schema to validate against
 * @param form - The form data to validate
 * @returns The validated and typed form data
 * @throws An error if the form data is invalid
 */
export function validateForm<T>(schema: z.ZodSchema<T>, form: unknown): T {
  const parsed = schema.safeParse(form);

  if (!parsed.success) {
    const errorDetails = JSON.stringify(parsed.error.format(), null, 2);
    throw new Error(`Invalid form data: ${errorDetails}`);
  }

  return parsed.data;
}
