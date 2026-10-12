import { z } from "zod";

const optionalEmail = z
  .union([
    z.string().trim().email("Please provide a valid email address").max(254),
    z.literal(""),
    z.null(),
  ])
  .optional()
  .transform((value) => (value === "" ? null : value));

const optionalPhone = z
  .string()
  .trim()
  .max(20, "Phone number cannot exceed 20 characters")
  .nullable()
  .optional()
  .transform((value) => (value === "" ? null : value));

const optionalAddress = z
  .string()
  .trim()
  .max(500, "Address cannot exceed 500 characters")
  .nullable()
  .optional()
  .transform((value) => (value === "" ? null : value));

export const createCustomerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Customer name is required")
      .max(100, "Customer name cannot exceed 100 characters"),

    email: optionalEmail,
    phone: optionalPhone,
    address: optionalAddress,
  })
  .strict();

export const updateCustomerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Customer name cannot be empty")
      .max(100, "Customer name cannot exceed 100 characters")
      .optional(),

    email: optionalEmail,
    phone: optionalPhone,
    address: optionalAddress,
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for an update",
  });

export const customerIdSchema = z.object({
  id: z.string().trim().min(1, "Customer ID is required"),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;