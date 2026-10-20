import { z } from "zod";

export const createExpenseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  amount: z.number().int().positive(),
  category: z.string().optional(),
  expenseDate: z.string().datetime().transform((date) => new Date(date)),
});

export const updateExpenseSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  amount: z.number().int().positive().optional(),
  category: z.string().nullable().optional(),
  expenseDate: z.string().datetime().transform((date) => new Date(date)).optional(),
}).refine((data) => Object.keys(data).length > 0);