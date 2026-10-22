import { z } from "zod";

export const aiQuerySchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, "Question is required")
    .max(1000, "Question must not exceed 1000 characters"),
});

export type AiQueryInput = z.infer<typeof aiQuerySchema>;