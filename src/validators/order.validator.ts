import { z } from "zod";

export const createOrderSchema = z
  .object({
    customerId: z.string().min(1, "Customer ID is required"),

    items: z
      .array(
        z.object({
          productId: z.string().min(1, "Product ID is required"),

          quantity: z
            .number()
            .int("Quantity must be an integer")
            .positive("Quantity must be greater than zero"),
        }),
      )
      .min(1, "An order must contain at least one item"),

    taxAmount: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .default(0),

    discountAmount: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .default(0),

    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const updateOrderStatusSchema = z
  .object({
    status: z.enum([
      "CONFIRMED",
      "PROCESSING",
      "COMPLETED",
    ]),
  })
  .strict();

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export type UpdateOrderStatusInput = z.infer<
  typeof updateOrderStatusSchema
>;