import { z } from "zod/v4";

export const createListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum(["plant", "cutting", "seed", "accessory"]),
  speciesId: z.string().optional(),
  conditionNotes: z.string().max(500).optional(),
  priceCents: z.int().min(0),
  currency: z.string().default("EUR"),
  isTradeable: z.boolean().default(false),
  quantityAvailable: z.int().min(1).default(1),
  quantityUnit: z.enum(["pieces", "grams", "ml"]).default("pieces"),
  plantAttributes: z
    .object({
      potSize: z.string().optional(),
      isRooted: z.boolean().optional(),
      variegationPct: z.number().min(0).max(100).optional(),
      ageMonths: z.number().min(0).optional(),
      height: z.string().optional(),
    })
    .optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const searchListingsSchema = z.object({
  q: z.string().optional(),
  category: z.enum(["plant", "cutting", "seed", "accessory"]).optional(),
  country: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/)
    .optional(),
  crossBorder: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  tradeable: z.coerce.boolean().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type SearchListingsInput = z.infer<typeof searchListingsSchema>;
