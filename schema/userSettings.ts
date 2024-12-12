import { currencies } from "@/lib/currencies";
import { z } from "zod";

export const UpdateUserCurrencySchema = z.object({
  currency: z
    .string({
      required_error: "Currency is required.",
      invalid_type_error: "Currency must be a string.",
    })
    .refine(
      (value) => currencies.some((currency) => currency.value === value),
      {
        message: "Invalid currency. Please select a valid option.",
      }
    ),
});
