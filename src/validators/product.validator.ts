import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Product name must contain at least 2 characters")
    .max(100, "Product name cannot exceed 100 characters"),

  sku: z
    .string()
    .trim()
    .min(1, "SKU cannot be empty")
    .max(50, "SKU cannot exceed 50 characters")
    .optional()
    .nullable(),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .nullable(),

  price: z
    .number()
    .int("Price must be an integer in paise")
    .min(0, "Price cannot be negative"),

  costPrice: z
    .number()
    .int("Cost price must be an integer in paise")
    .min(0, "Cost price cannot be negative")
    .optional()
    .nullable(),

  stockQuantity: z
    .number()
    .int("Stock quantity must be an integer")
    .min(0, "Stock quantity cannot be negative")
    .default(0),

  lowStockLimit: z
    .number()
    .int("Low stock limit must be an integer")
    .min(0, "Low stock limit cannot be negative")
    .default(5),
});

export const updateProductSchema = z
  .object({
    name: createProductSchema.shape.name.optional(),
    sku: createProductSchema.shape.sku,
    description: createProductSchema.shape.description,
    price: createProductSchema.shape.price.optional(),
    costPrice: createProductSchema.shape.costPrice,
    stockQuantity: createProductSchema.shape.stockQuantity.optional(),
    lowStockLimit: createProductSchema.shape.lowStockLimit.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const productIdSchema = z.object({
  id: z.string().min(1, "Product ID is required"),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export type UpdateProductInput = z.infer<typeof updateProductSchema>;