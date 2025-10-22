/**
 * Currency Utilities
 * Handles currency conversion, formatting, and minor unit operations
 */

export type Currency = "PEN" | "USD" | "EUR"

export interface ExchangeRates {
  base: Currency
  rates: Record<string, number>
  timestamp: number
}

/**
 * Convert amount from minor units (cents) to major units (dollars)
 */
export function fromMinorUnits(amountCents: number, currency: Currency): number {
  // All supported currencies use 2 decimal places
  return amountCents / 100
}

/**
 * Convert amount from major units (dollars) to minor units (cents)
 */
export function toMinorUnits(amount: number, currency: Currency): number {
  // All supported currencies use 2 decimal places
  return Math.round(amount * 100)
}

/**
 * Format currency amount with locale-aware formatting
 * Always uses 1,000.00 format (thousands separator with 2 decimals)
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format currency amount from minor units
 */
export function formatCurrencyFromMinorUnits(
  amountCents: number,
  currency: Currency,
  locale: string = "en-US"
): string {
  const amount = fromMinorUnits(amountCents, currency)
  return formatCurrency(amount, currency, locale)
}

/**
 * Convert amount between currencies using exchange rates
 * @param amount Amount in source currency (major units)
 * @param from Source currency
 * @param to Target currency
 * @param rates Exchange rates object
 * @returns Converted amount in target currency
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates
): number {
  if (from === to) return amount

  // If base currency matches source, use rate directly
  if (rates.base === from) {
    const rate = rates.rates[to]
    if (!rate) throw new Error(`No exchange rate found for ${to}`)
    return amount * rate
  }

  // If base currency matches target, divide by rate
  if (rates.base === to) {
    const rate = rates.rates[from]
    if (!rate) throw new Error(`No exchange rate found for ${from}`)
    return amount / rate
  }

  // Otherwise, convert through base currency
  const fromRate = rates.rates[from]
  const toRate = rates.rates[to]
  if (!fromRate || !toRate) {
    throw new Error(`Missing exchange rates for ${from} or ${to}`)
  }

  // Convert from source to base, then base to target
  const amountInBase = amount / fromRate
  return amountInBase * toRate
}

/**
 * Convert amount between currencies from minor units
 */
export function convertCurrencyFromMinorUnits(
  amountCents: number,
  from: Currency,
  to: Currency,
  rates: ExchangeRates
): number {
  const amount = fromMinorUnits(amountCents, from)
  const converted = convertCurrency(amount, from, to, rates)
  return toMinorUnits(converted, to)
}

/**
 * Validate currency code
 */
export function isSupportedCurrency(currency: string): currency is Currency {
  return ["PEN", "USD", "EUR"].includes(currency)
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    PEN: "S/",
    USD: "$",
    EUR: "€",
  }
  return symbols[currency]
}
