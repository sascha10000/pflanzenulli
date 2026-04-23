import { z } from "zod/v4";

export const updateProfileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  countryCode: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/)
    .optional(),
  preferredLanguage: z.enum(["en", "de"]).optional(),
  locationGeohash: z.string().min(4).max(12).optional(),
  postalCode: z.string().max(10).optional(),
  bio: z.string().max(500).optional(),
});

export const onboardingSchema = z.object({
  displayName: z.string().min(2).max(50),
  accountType: z.enum(["private", "commercial"]),
  countryCode: z
    .string()
    .length(2)
    .regex(/^[A-Z]{2}$/),
  preferredLanguage: z.enum(["en", "de"]),
  gdprConsent: z.literal(true),
  tosAccepted: z.literal(true),
});

export const commercialProfileSchema = z.object({
  legalName: z.string().min(2).max(200),
  legalForm: z.string().max(50).optional(),
  registeredAddress: z.string().min(10).max(500),
  vatId: z
    .string()
    .regex(/^[A-Z]{2}[0-9A-Z]+$/)
    .optional(),
  revocationPolicyHtml: z.string().max(10000).optional(),
  companyRegisterId: z.string().max(50).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type CommercialProfileInput = z.infer<typeof commercialProfileSchema>;
