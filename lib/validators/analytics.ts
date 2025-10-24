/**
 * Analytics API Validators
 * Zod schemas for analytics endpoint query parameters
 */

import { z } from "zod";

/**
 * Supported granularity for time-based analytics
 */
export const GranularitySchema = z.enum(["week", "month", "quarter"]);

/**
 * Supported currencies (ISO-4217)
 */
export const CurrencySchema = z.enum(["PEN", "USD", "EUR"]);

/**
 * Base analytics query parameters (shared across all endpoints)
 */
export const BaseAnalyticsQuerySchema = z.object({
  from: z.string().datetime().describe("Start date (ISO 8601)"),
  to: z.string().datetime().describe("End date (ISO 8601)"),
  account: z
    .string()
    .uuid()
    .optional()
    .describe("Optional card/account ID filter"),
  currency: CurrencySchema.describe("Target currency for conversion"),
});

/**
 * Spend by Category API query parameters
 * GET /api/analytics/spend-by-category
 */
export const SpendByCategoryQuerySchema = BaseAnalyticsQuerySchema;

export type SpendByCategoryQuery = z.infer<typeof SpendByCategoryQuerySchema>;

/**
 * Spend by Category API response
 */
export const SpendByCategoryResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      categoryId: z.string().uuid(),
      name: z.string(),
      color: z.string(),
      amount: z.number().describe("Amount in target currency (major units)"),
      pct: z.number().min(0).max(100).describe("Percentage of total spend"),
      deltaPctPrev: z.number().describe("% change vs previous period"),
      txCount: z.number().int().nonnegative(),
    })
  ),
});

export type SpendByCategoryResponse = z.infer<
  typeof SpendByCategoryResponseSchema
>;

/**
 * Spend Over Time API query parameters
 * GET /api/analytics/spend-over-time
 */
export const SpendOverTimeQuerySchema = BaseAnalyticsQuerySchema.extend({
  granularity: GranularitySchema.default("month"),
});

export type SpendOverTimeQuery = z.infer<typeof SpendOverTimeQuerySchema>;

/**
 * Spend Over Time API response
 */
export const SpendOverTimeResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      period: z.string().describe("ISO date for the period start"),
      amount: z
        .number()
        .describe("Total spend in target currency (major units)"),
      txCount: z.number().int().nonnegative(),
      topCategory: z
        .object({
          id: z.string().uuid(),
          name: z.string(),
          amount: z.number(),
        })
        .nullable(),
    })
  ),
});

export type SpendOverTimeResponse = z.infer<typeof SpendOverTimeResponseSchema>;

/**
 * Income vs Expenses API query parameters
 * GET /api/analytics/income-vs-expenses
 */
export const IncomeVsExpensesQuerySchema = BaseAnalyticsQuerySchema.extend({
  granularity: GranularitySchema.default("month"),
});

export type IncomeVsExpensesQuery = z.infer<typeof IncomeVsExpensesQuerySchema>;

/**
 * Income vs Expenses API response
 */
export const IncomeVsExpensesResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(
    z.object({
      period: z.string().describe("ISO date for the period start"),
      income: z
        .number()
        .describe("Total income in target currency (major units, positive)"),
      expenses: z
        .number()
        .describe("Total expenses in target currency (major units, positive)"),
      net: z.number().describe("Net cashflow (income - expenses)"),
    })
  ),
});

export type IncomeVsExpensesResponse = z.infer<
  typeof IncomeVsExpensesResponseSchema
>;

/**
 * Net Cashflow API query parameters
 * GET /api/analytics/net-cashflow
 */
export const NetCashflowQuerySchema = BaseAnalyticsQuerySchema;

export type NetCashflowQuery = z.infer<typeof NetCashflowQuerySchema>;

/**
 * Net Cashflow API response
 */
export const NetCashflowResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    net: z.number().describe("Net cashflow in target currency (major units)"),
    income: z
      .number()
      .describe("Total income in target currency (major units)"),
    expenses: z
      .number()
      .describe("Total expenses in target currency (major units)"),
    deltaPctPrev: z.number().describe("% change vs previous period"),
    sparkline: z.array(
      z.object({
        date: z.string().describe("ISO date"),
        net: z.number().describe("Net cashflow for this point"),
      })
    ),
  }),
});

export type NetCashflowResponse = z.infer<typeof NetCashflowResponseSchema>;
