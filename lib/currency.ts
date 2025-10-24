/**
 * Currency Utilities
 * Handles currency conversion, formatting, and minor unit operations
 */

export type Currency = "PEN" | "USD" | "EUR";

export interface ExchangeRates {
  base: Currency;
  rates: Record<string, number>;
  timestamp: number;
}

/**
 * Convert amount from minor units (cents) to major units (dollars)
 */
export function fromMinorUnits(amountCents: number): number {
  // All supported currencies use 2 decimal places
  return amountCents / 100;
}

/**
 * Convert amount from major units (dollars) to minor units (cents)
 */
export function toMinorUnits(amount: number): number {
  // All supported currencies use 2 decimal places
  return Math.round(amount * 100);
}

/**
 * Format currency amount with locale-aware formatting
 * Always uses 1,000.00 format (thousands separator with 2 decimals)
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  options?: { locale?: string; compact?: boolean }
): string {
  const locale = options?.locale || "en-US";

  if (options?.compact) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format currency amount from minor units
 */
export function formatCurrencyFromMinorUnits(
  amountCents: number,
  currency: Currency,
  options?: { locale?: string; compact?: boolean }
): string {
  const amount = fromMinorUnits(amountCents);
  return formatCurrency(amount, currency, options);
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
  if (from === to) return amount;

  // If base currency matches source, use rate directly
  if (rates.base === from) {
    const rate = rates.rates[to];
    if (!rate) throw new Error(`No exchange rate found for ${to}`);
    return amount * rate;
  }

  // If base currency matches target, divide by rate
  if (rates.base === to) {
    const rate = rates.rates[from];
    if (!rate) throw new Error(`No exchange rate found for ${from}`);
    return amount / rate;
  }

  // Otherwise, convert through base currency
  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];
  if (!fromRate || !toRate) {
    throw new Error(`Missing exchange rates for ${from} or ${to}`);
  }

  // Convert from source to base, then base to target
  const amountInBase = amount / fromRate;
  return amountInBase * toRate;
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
  const amount = fromMinorUnits(amountCents);
  const converted = convertCurrency(amount, from, to, rates);
  return toMinorUnits(converted);
}

/**
 * Validate currency code
 */
export function isSupportedCurrency(currency: string): currency is Currency {
  return ["PEN", "USD", "EUR"].includes(currency);
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    PEN: "S/",
    USD: "$",
    EUR: "€",
  };
  return symbols[currency];
}

/**
 * Exchange rate cache
 * Format: { rates: ExchangeRates, fetchedAt: timestamp }
 */
let exchangeRateCache: {
  rates: ExchangeRates | null;
  fetchedAt: number;
} = {
  rates: null,
  fetchedAt: 0,
};

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch exchange rates from primary API
 * Primary: https://v6.exchangerate-api.com/v6/${API_KEY}/latest/PEN
 */
async function fetchFromPrimaryAPI(): Promise<ExchangeRates> {
  const apiKey = process.env["NEXT_PUBLIC_EXCHANGERATE_API_KEY"];
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_EXCHANGERATE_API_KEY not configured");
  }

  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/PEN`;
  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
  });

  if (!response.ok) {
    throw new Error(
      `Primary API failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.result !== "success") {
    throw new Error(
      `Primary API returned error: ${data["error-type"] || "unknown"}`
    );
  }

  return {
    base: "PEN",
    rates: data.conversion_rates,
    timestamp: Date.now(),
  };
}

/**
 * Fetch exchange rates from fallback API
 * Fallback: https://api.exchangerate.fun/latest?base=PEN
 */
async function fetchFromFallbackAPI(): Promise<ExchangeRates> {
  const url = "https://api.exchangerate.fun/latest?base=PEN";
  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(
      `Fallback API failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.rates) {
    throw new Error("Fallback API returned invalid data");
  }

  return {
    base: "PEN",
    rates: data.rates,
    timestamp: Date.now(),
  };
}

/**
 * Get exchange rates with caching and fallback logic
 * @returns ExchangeRates object with PEN as base currency
 * @throws Error if both primary and fallback APIs fail
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();

  // Check cache validity (1-hour TTL)
  if (
    exchangeRateCache.rates &&
    now - exchangeRateCache.fetchedAt < CACHE_TTL_MS
  ) {
    return exchangeRateCache.rates;
  }

  // Try primary API first
  try {
    const rates = await fetchFromPrimaryAPI();
    exchangeRateCache = { rates, fetchedAt: now };
    return rates;
  } catch (primaryError) {
    console.error("Primary exchange rate API failed:", primaryError);

    // Try fallback API
    try {
      const rates = await fetchFromFallbackAPI();
      exchangeRateCache = { rates, fetchedAt: now };
      return rates;
    } catch (fallbackError) {
      console.error("Fallback exchange rate API failed:", fallbackError);

      // If we have stale cache, return it as last resort
      if (exchangeRateCache.rates) {
        console.warn("Using stale exchange rate cache");
        return exchangeRateCache.rates;
      }

      // Both APIs failed and no cache available
      throw new Error(
        "Failed to fetch exchange rates from all sources. Please try again later."
      );
    }
  }
}

/**
 * Get exchange rate for a specific currency pair
 * @param from Source currency
 * @param to Target currency
 * @returns Exchange rate multiplier
 */
export async function getExchangeRate(
  from: Currency,
  to: Currency
): Promise<number> {
  if (from === to) return 1;

  const rates = await getExchangeRates();

  // If base currency matches source, use rate directly
  if (rates.base === from) {
    const rate = rates.rates[to];
    if (!rate) throw new Error(`No exchange rate found for ${to}`);
    return rate;
  }

  // If base currency matches target, divide by rate
  if (rates.base === to) {
    const rate = rates.rates[from];
    if (!rate) throw new Error(`No exchange rate found for ${from}`);
    return 1 / rate;
  }

  // Otherwise, convert through base currency
  const fromRate = rates.rates[from];
  const toRate = rates.rates[to];
  if (!fromRate || !toRate) {
    throw new Error(`Missing exchange rates for ${from} or ${to}`);
  }

  return toRate / fromRate;
}
