import {
  convertCurrency,
  convertCurrencyFromMinorUnits,
  formatCurrency,
  formatCurrencyFromMinorUnits,
  fromMinorUnits,
  getCurrencySymbol,
  isSupportedCurrency,
  toMinorUnits,
  type ExchangeRates,
} from "@/lib/currency";
import { describe, expect, it } from "vitest";

describe("Currency Utilities", () => {
  const mockRates: ExchangeRates = {
    base: "PEN",
    rates: {
      USD: 0.27,
      EUR: 0.25,
      PEN: 1.0,
    },
    timestamp: Date.now(),
  };

  describe("fromMinorUnits", () => {
    it("should convert cents to dollars", () => {
      expect(fromMinorUnits(10000)).toBe(100);
      expect(fromMinorUnits(2550)).toBe(25.5);
      expect(fromMinorUnits(99)).toBe(0.99);
    });

    it("should convert centimos to soles", () => {
      expect(fromMinorUnits(10000)).toBe(100);
      expect(fromMinorUnits(3750)).toBe(37.5);
    });

    it("should handle zero", () => {
      expect(fromMinorUnits(0)).toBe(0);
    });

    it("should handle negative amounts", () => {
      expect(fromMinorUnits(-1000)).toBe(-10);
      expect(fromMinorUnits(-5500)).toBe(-55);
    });
  });

  describe("toMinorUnits", () => {
    it("should convert dollars to cents", () => {
      expect(toMinorUnits(100)).toBe(10000);
      expect(toMinorUnits(25.5)).toBe(2550);
      expect(toMinorUnits(0.99)).toBe(99);
    });

    it("should convert soles to centimos", () => {
      expect(toMinorUnits(100)).toBe(10000);
      expect(toMinorUnits(37.5)).toBe(3750);
    });

    it("should round to nearest cent", () => {
      expect(toMinorUnits(10.555)).toBe(1056);
      expect(toMinorUnits(10.554)).toBe(1055);
      expect(toMinorUnits(10.545)).toBe(1055);
    });

    it("should handle zero", () => {
      expect(toMinorUnits(0)).toBe(0);
    });

    it("should handle negative amounts", () => {
      expect(toMinorUnits(-10)).toBe(-1000);
      expect(toMinorUnits(-55)).toBe(-5500);
    });
  });

  describe("formatCurrency", () => {
    it("should format USD with symbol and decimals", () => {
      const formatted = formatCurrency(1000, "USD");
      expect(formatted).toContain("1,000");
      expect(formatted).toContain(".00");
    });

    it("should format PEN with symbol and decimals", () => {
      const formatted = formatCurrency(1234.56, "PEN");
      expect(formatted).toContain("1,234");
      expect(formatted).toContain(".56");
    });

    it("should format EUR with symbol and decimals", () => {
      const formatted = formatCurrency(999.99, "EUR");
      expect(formatted).toContain("999");
      expect(formatted).toContain(".99");
    });

    it("should always show 2 decimal places", () => {
      const formatted = formatCurrency(100, "USD");
      expect(formatted).toMatch(/\.00$|,00$/);
    });

    it("should handle zero", () => {
      const formatted = formatCurrency(0, "USD");
      expect(formatted).toContain("0");
      expect(formatted).toContain(".00");
    });

    it("should handle negative amounts", () => {
      const formatted = formatCurrency(-50, "USD");
      expect(formatted).toContain("50");
    });
  });

  describe("formatCurrencyFromMinorUnits", () => {
    it("should format cents as dollars", () => {
      const formatted = formatCurrencyFromMinorUnits(100000, "USD");
      expect(formatted).toContain("1,000");
      expect(formatted).toContain(".00");
    });

    it("should format centimos as soles", () => {
      const formatted = formatCurrencyFromMinorUnits(123456, "PEN");
      expect(formatted).toContain("1,234");
      expect(formatted).toContain(".56");
    });

    it("should handle zero cents", () => {
      const formatted = formatCurrencyFromMinorUnits(0, "USD");
      expect(formatted).toContain("0");
    });
  });

  describe("convertCurrency", () => {
    it("should return same amount when converting to same currency", () => {
      expect(convertCurrency(100, "USD", "USD", mockRates)).toBe(100);
      expect(convertCurrency(50, "PEN", "PEN", mockRates)).toBe(50);
    });

    it("should convert from base currency to target", () => {
      // 100 PEN * 0.27 = 27 USD
      expect(convertCurrency(100, "PEN", "USD", mockRates)).toBeCloseTo(27, 2);
      // 100 PEN * 0.25 = 25 EUR
      expect(convertCurrency(100, "PEN", "EUR", mockRates)).toBeCloseTo(25, 2);
    });

    it("should convert from target currency to base", () => {
      // 27 USD / 0.27 = 100 PEN
      expect(convertCurrency(27, "USD", "PEN", mockRates)).toBeCloseTo(100, 2);
      // 25 EUR / 0.25 = 100 PEN
      expect(convertCurrency(25, "EUR", "PEN", mockRates)).toBeCloseTo(100, 2);
    });

    it("should convert between non-base currencies", () => {
      // 27 USD → PEN → EUR
      // 27 / 0.27 = 100 PEN
      // 100 * 0.25 = 25 EUR
      expect(convertCurrency(27, "USD", "EUR", mockRates)).toBeCloseTo(25, 2);

      // 25 EUR → PEN → USD
      // 25 / 0.25 = 100 PEN
      // 100 * 0.27 = 27 USD
      expect(convertCurrency(25, "EUR", "USD", mockRates)).toBeCloseTo(27, 2);
    });

    it("should handle zero amounts", () => {
      expect(convertCurrency(0, "USD", "EUR", mockRates)).toBe(0);
    });

    it("should throw error when rate is missing", () => {
      const incompleteRates: ExchangeRates = {
        base: "PEN",
        rates: { USD: 0.27 },
        timestamp: Date.now(),
      };

      expect(() => {
        convertCurrency(100, "PEN", "EUR", incompleteRates);
      }).toThrow("No exchange rate found");
    });
  });

  describe("convertCurrencyFromMinorUnits", () => {
    it("should convert and return result in minor units", () => {
      // 10000 cents (100 USD) → PEN
      // 100 / 0.27 ≈ 370.37 PEN
      // 370.37 * 100 = 37037 centimos
      const result = convertCurrencyFromMinorUnits(
        10000,
        "USD",
        "PEN",
        mockRates
      );
      expect(result).toBeCloseTo(37037, 0);
    });

    it("should handle zero amounts in minor units", () => {
      expect(convertCurrencyFromMinorUnits(0, "USD", "EUR", mockRates)).toBe(0);
    });

    it("should round to nearest minor unit", () => {
      const result = convertCurrencyFromMinorUnits(
        10050,
        "PEN",
        "USD",
        mockRates
      );
      // 100.50 PEN * 0.27 = 27.135 USD = 2714 cents (rounded)
      expect(result).toBeCloseTo(2714, 0);
    });
  });

  describe("isSupportedCurrency", () => {
    it("should return true for supported currencies", () => {
      expect(isSupportedCurrency("PEN")).toBe(true);
      expect(isSupportedCurrency("USD")).toBe(true);
      expect(isSupportedCurrency("EUR")).toBe(true);
    });

    it("should return false for unsupported currencies", () => {
      expect(isSupportedCurrency("GBP")).toBe(false);
      expect(isSupportedCurrency("JPY")).toBe(false);
      expect(isSupportedCurrency("BTC")).toBe(false);
      expect(isSupportedCurrency("")).toBe(false);
    });

    it("should be case-sensitive", () => {
      expect(isSupportedCurrency("usd")).toBe(false);
      expect(isSupportedCurrency("pen")).toBe(false);
    });
  });

  describe("getCurrencySymbol", () => {
    it("should return correct symbol for PEN", () => {
      expect(getCurrencySymbol("PEN")).toBe("S/");
    });

    it("should return correct symbol for USD", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
    });

    it("should return correct symbol for EUR", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
    });
  });

  describe("Rounding and precision", () => {
    it("should maintain precision through conversion chain", () => {
      const original = 12345;
      const converted = convertCurrencyFromMinorUnits(
        original,
        "PEN",
        "USD",
        mockRates
      );
      const backConverted = convertCurrencyFromMinorUnits(
        converted,
        "USD",
        "PEN",
        mockRates
      );

      // Should be close but may have minor rounding differences
      expect(Math.abs(backConverted - original)).toBeLessThan(2);
    });

    it("should round consistently", () => {
      expect(toMinorUnits(10.505)).toBe(1051);
      expect(toMinorUnits(10.504)).toBe(1050);
    });
  });
});
