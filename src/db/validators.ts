import { z } from 'zod';

export const productInsertSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  description: z.string().optional().nullable(),
  price: z.union([z.string(), z.number()])
    .transform(v => Number(v))
    .refine(v => v >= 0, "Price cannot be negative"),
    
  specs: z.record(z.any()).default({}),
  tags: z.array(z.string()).default([]),
  
  isVisible: z.boolean().default(true),
  stockStatus: z.enum(['in_stock', 'sold_out', 'pre_order']).default('in_stock'),
  stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative").default(0),
  
  sku: z.string().max(100).optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

export const productUpdateSchema = productInsertSchema.partial().extend({
  id: z.string().uuid("Invalid UUID"),
});

export type ProductInsert = z.input<typeof productInsertSchema>;
export type ProductUpdate = z.input<typeof productUpdateSchema>;
