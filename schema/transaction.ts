import { z } from "zod";

export const CreateTransactionSchema = z.object({
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero.")
    .multipleOf(0.01, "Amount must be in increments of 0.01."),

  description: z
    .string()
    .max(100, "Description must not exceed 255 characters.")
    .optional(),
  date: z.coerce.date({
    invalid_type_error: "Date must be a valid date.",
  }),

  category: z
    .string({
      required_error: "Category is required.",
    })
    .max(50, "Category must not exceed 50 characters."),

  type: z.enum(["income", "expense"], {
    invalid_type_error: "Type must be 'income' or 'expense'.",
  }),
});

export type CreateTransactionSchemaType = z.infer<
  typeof CreateTransactionSchema
>;
