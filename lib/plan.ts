/**
 * Plan Entitlements & Enforcement
 * Enforces plan limits on cards, statements, categories, alerts, and budgets
 */

export type Plan = "free" | "plus" | "pro" | "admin";

export interface PlanEntitlements {
  cards: number;
  statementsPerMonth: number;
  categories: number;
  alerts: number;
  budgets: number;
  keywordCategorization: boolean;
}

const PLAN_ENTITLEMENTS: Record<Plan, PlanEntitlements> = {
  free: {
    cards: 1,
    statementsPerMonth: 2,
    categories: 6,
    alerts: 2,
    budgets: 2,
    keywordCategorization: true,
  },
  plus: {
    cards: 5,
    statementsPerMonth: Infinity,
    categories: 25,
    alerts: 6,
    budgets: 10,
    keywordCategorization: true,
  },
  pro: {
    cards: Infinity,
    statementsPerMonth: Infinity,
    categories: Infinity,
    alerts: 10,
    budgets: 15,
    keywordCategorization: true,
  },
  admin: {
    cards: Infinity,
    statementsPerMonth: Infinity,
    categories: Infinity,
    alerts: Infinity,
    budgets: Infinity,
    keywordCategorization: true,
  },
};

/**
 * Get entitlements for a given plan
 */
export function getPlanEntitlements(plan: Plan): PlanEntitlements {
  return PLAN_ENTITLEMENTS[plan];
}

/**
 * Check if user can create a card based on current count and plan
 */
export function canCreateCard(plan: Plan, currentCount: number): boolean {
  const entitlements = getPlanEntitlements(plan);
  return currentCount < entitlements.cards;
}

/**
 * Check if user can upload a statement based on current month count and plan
 */
export function canUploadStatement(
  plan: Plan,
  currentMonthCount: number
): boolean {
  const entitlements = getPlanEntitlements(plan);
  return currentMonthCount < entitlements.statementsPerMonth;
}

/**
 * Check if user can create a category based on current count and plan
 * Note: System categories (is_preset = true) do not count toward the limit
 */
export function canCreateCategory(
  plan: Plan,
  currentUserCategoriesCount: number
): boolean {
  // free plan: 6 system categories only, cannot add more
  if (plan === "free") {
    return false;
  }
  // plus plan: 6 system + up to 19 user-created = 25 total
  if (plan === "plus") {
    return currentUserCategoriesCount < 19;
  }
  // pro/admin: unlimited user categories
  return true;
}

/**
 * Check if user can create a budget based on current count and plan
 */
export function canCreateBudget(plan: Plan, currentCount: number): boolean {
  const entitlements = getPlanEntitlements(plan);
  return currentCount < entitlements.budgets;
}

/**
 * Check if user can create an alert based on current count and plan
 */
export function canCreateAlert(plan: Plan, currentCount: number): boolean {
  const entitlements = getPlanEntitlements(plan);
  return currentCount < entitlements.alerts;
}

/**
 * Get remaining count for a resource based on plan and current usage
 */
export function getRemainingCount(
  plan: Plan,
  resource: keyof PlanEntitlements,
  currentCount: number
): number {
  const entitlements = getPlanEntitlements(plan);
  const limit = entitlements[resource];
  if (typeof limit !== "number") return 0;
  if (!isFinite(limit)) return Infinity;
  return Math.max(0, limit - currentCount);
}
