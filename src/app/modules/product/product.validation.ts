import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  thumbnail: z.string().url("Thumbnail must be a valid URL").optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
