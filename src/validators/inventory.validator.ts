import { z } from "zod";

export const adjustStockSchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be greater than zero"),

  type: z.enum([
    "INCREASE",
    "DECREASE",
    "RESTOCK",
    "RETURN",
    "ADJUSTMENT",
  ]),

  reason: z
    .string()
    .trim()
    .max(500, "Reason cannot exceed 500 characters")
    .optional(),
});

export type AdjustStockInput = z.infer<typeof adjustStockSchema>;