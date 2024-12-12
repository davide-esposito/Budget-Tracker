import { z } from "zod";

const nameValidation = z
  .string()
  .min(3, "Name must be at least 3 characters long")
  .max(20, "Name must not exceed 20 characters");
const typeValidation = z.enum(["income", "expense"], {
  errorMap: () => ({ message: "Type must be 'income' or 'expense'" }),
});
const iconValidation = z.string().max(20, "Icon must not exceed 20 characters");

export const CreateCategorySchema = z.object({
  name: nameValidation,
  icon: iconValidation,
  type: typeValidation,
});
export type CreateCategorySchemaType = z.infer<typeof CreateCategorySchema>;

export const DeleteCategorySchema = z.object({
  name: nameValidation,
  type: typeValidation,
});
export type DeleteCategorySchemaType = z.infer<typeof DeleteCategorySchema>;
