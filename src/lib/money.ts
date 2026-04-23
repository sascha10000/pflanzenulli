import { z } from "zod/v4";

/**
 * Money is always represented as integer cents with an ISO 4217 currency code.
 * Never use floating point for monetary values.
 */
export interface Money {
  readonly cents: number;
  readonly currency: string;
}

export const currencySchema = z.enum(["EUR"]);

export const moneySchema = z.object({
  cents: z.int().min(0),
  currency: currencySchema,
});

export function formatMoney(money: Money, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
  }).format(money.cents / 100);
}

export function centsToMajor(cents: number): number {
  return cents / 100;
}

export function majorToCents(major: number): number {
  return Math.round(major * 100);
}
