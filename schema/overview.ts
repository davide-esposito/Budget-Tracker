import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays } from "date-fns";
import { z } from "zod";

export const OverviewQuerySchema = z
  .object({
    from: z.coerce.date({
      invalid_type_error: "The 'from' field must be a valid date.",
    }),
    to: z.coerce.date({
      invalid_type_error: "The 'to' field must be a valid date.",
    }),
  })
  .refine(
    (args) => {
      const { from, to } = args;
      const days = differenceInDays(to, from);

      return days >= 0 && days <= MAX_DATE_RANGE_DAYS;
    },
    {
      message: `The date range must be between 0 and ${MAX_DATE_RANGE_DAYS} days.`,
    }
  );
