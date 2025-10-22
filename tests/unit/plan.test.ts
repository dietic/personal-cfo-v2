import { describe, it, expect } from "vitest"
import {
  getPlanEntitlements,
  canCreateCard,
  canUploadStatement,
  canCreateCategory,
  canCreateBudget,
  canCreateAlert,
  getRemainingCount,
  type Plan,
} from "@/lib/plan"

describe("Plan Entitlements", () => {
  describe("getPlanEntitlements", () => {
    it("should return free plan entitlements", () => {
      const entitlements = getPlanEntitlements("free")
      expect(entitlements).toEqual({
        cards: 1,
        statementsPerMonth: 2,
        categories: 6,
        alerts: 2,
        budgets: 2,
        keywordCategorization: true,
      })
    })

    it("should return plus plan entitlements", () => {
      const entitlements = getPlanEntitlements("plus")
      expect(entitlements).toEqual({
        cards: 5,
        statementsPerMonth: Infinity,
        categories: 25,
        alerts: 6,
        budgets: 10,
        keywordCategorization: true,
      })
    })

    it("should return pro plan entitlements", () => {
      const entitlements = getPlanEntitlements("pro")
      expect(entitlements).toEqual({
        cards: Infinity,
        statementsPerMonth: Infinity,
        categories: Infinity,
        alerts: 10,
        budgets: 15,
        keywordCategorization: true,
      })
    })

    it("should return admin plan entitlements", () => {
      const entitlements = getPlanEntitlements("admin")
      expect(entitlements).toEqual({
        cards: Infinity,
        statementsPerMonth: Infinity,
        categories: Infinity,
        alerts: Infinity,
        budgets: Infinity,
        keywordCategorization: true,
      })
    })
  })

  describe("canCreateCard", () => {
    it("should allow free user to create first card", () => {
      expect(canCreateCard("free", 0)).toBe(true)
    })

    it("should prevent free user from creating second card", () => {
      expect(canCreateCard("free", 1)).toBe(false)
    })

    it("should allow plus user to create up to 5 cards", () => {
      expect(canCreateCard("plus", 0)).toBe(true)
      expect(canCreateCard("plus", 4)).toBe(true)
      expect(canCreateCard("plus", 5)).toBe(false)
    })

    it("should allow pro user to create unlimited cards", () => {
      expect(canCreateCard("pro", 100)).toBe(true)
      expect(canCreateCard("pro", 1000)).toBe(true)
    })

    it("should allow admin to create unlimited cards", () => {
      expect(canCreateCard("admin", 999)).toBe(true)
    })
  })

  describe("canUploadStatement", () => {
    it("should allow free user to upload up to 2 statements per month", () => {
      expect(canUploadStatement("free", 0)).toBe(true)
      expect(canUploadStatement("free", 1)).toBe(true)
      expect(canUploadStatement("free", 2)).toBe(false)
    })

    it("should allow plus user to upload unlimited statements", () => {
      expect(canUploadStatement("plus", 100)).toBe(true)
      expect(canUploadStatement("plus", 1000)).toBe(true)
    })

    it("should allow pro user to upload unlimited statements", () => {
      expect(canUploadStatement("pro", 500)).toBe(true)
    })

    it("should allow admin to upload unlimited statements", () => {
      expect(canUploadStatement("admin", 999)).toBe(true)
    })
  })

  describe("canCreateCategory", () => {
    it("should prevent free user from creating any custom categories", () => {
      // free users have 6 system categories only
      expect(canCreateCategory("free", 0)).toBe(false)
      expect(canCreateCategory("free", 6)).toBe(false)
    })

    it("should allow plus user to create up to 19 custom categories (6 system + 19 custom = 25 total)", () => {
      expect(canCreateCategory("plus", 0)).toBe(true)
      expect(canCreateCategory("plus", 10)).toBe(true)
      expect(canCreateCategory("plus", 18)).toBe(true)
      expect(canCreateCategory("plus", 19)).toBe(false)
      expect(canCreateCategory("plus", 20)).toBe(false)
    })

    it("should allow pro user to create unlimited custom categories", () => {
      expect(canCreateCategory("pro", 0)).toBe(true)
      expect(canCreateCategory("pro", 100)).toBe(true)
      expect(canCreateCategory("pro", 1000)).toBe(true)
    })

    it("should allow admin to create unlimited categories", () => {
      expect(canCreateCategory("admin", 999)).toBe(true)
    })
  })

  describe("canCreateBudget", () => {
    it("should allow free user to create up to 2 budgets", () => {
      expect(canCreateBudget("free", 0)).toBe(true)
      expect(canCreateBudget("free", 1)).toBe(true)
      expect(canCreateBudget("free", 2)).toBe(false)
    })

    it("should allow plus user to create up to 10 budgets", () => {
      expect(canCreateBudget("plus", 0)).toBe(true)
      expect(canCreateBudget("plus", 9)).toBe(true)
      expect(canCreateBudget("plus", 10)).toBe(false)
    })

    it("should allow pro user to create up to 15 budgets", () => {
      expect(canCreateBudget("pro", 0)).toBe(true)
      expect(canCreateBudget("pro", 14)).toBe(true)
      expect(canCreateBudget("pro", 15)).toBe(false)
    })

    it("should allow admin to create unlimited budgets", () => {
      expect(canCreateBudget("admin", 999)).toBe(true)
    })
  })

  describe("canCreateAlert", () => {
    it("should allow free user to create up to 2 alerts", () => {
      expect(canCreateAlert("free", 0)).toBe(true)
      expect(canCreateAlert("free", 1)).toBe(true)
      expect(canCreateAlert("free", 2)).toBe(false)
    })

    it("should allow plus user to create up to 6 alerts", () => {
      expect(canCreateAlert("plus", 0)).toBe(true)
      expect(canCreateAlert("plus", 5)).toBe(true)
      expect(canCreateAlert("plus", 6)).toBe(false)
    })

    it("should allow pro user to create up to 10 alerts", () => {
      expect(canCreateAlert("pro", 0)).toBe(true)
      expect(canCreateAlert("pro", 9)).toBe(true)
      expect(canCreateAlert("pro", 10)).toBe(false)
    })

    it("should allow admin to create unlimited alerts", () => {
      expect(canCreateAlert("admin", 999)).toBe(true)
    })
  })

  describe("getRemainingCount", () => {
    it("should calculate remaining cards for free plan", () => {
      expect(getRemainingCount("free", "cards", 0)).toBe(1)
      expect(getRemainingCount("free", "cards", 1)).toBe(0)
    })

    it("should return Infinity for unlimited resources", () => {
      expect(getRemainingCount("pro", "cards", 100)).toBe(Infinity)
      expect(getRemainingCount("admin", "budgets", 50)).toBe(Infinity)
    })

    it("should calculate remaining budgets for plus plan", () => {
      expect(getRemainingCount("plus", "budgets", 5)).toBe(5)
      expect(getRemainingCount("plus", "budgets", 10)).toBe(0)
    })

    it("should never return negative values", () => {
      expect(getRemainingCount("free", "cards", 10)).toBe(0)
      expect(getRemainingCount("plus", "budgets", 20)).toBe(0)
    })

    it("should handle alerts correctly for different plans", () => {
      expect(getRemainingCount("free", "alerts", 1)).toBe(1)
      expect(getRemainingCount("plus", "alerts", 3)).toBe(3)
      expect(getRemainingCount("pro", "alerts", 8)).toBe(2)
    })
  })

  describe("Plan comparison and upgrade paths", () => {
    it("should show free plan has most restrictive limits", () => {
      const freeLimits = getPlanEntitlements("free")
      const plusLimits = getPlanEntitlements("plus")
      const proLimits = getPlanEntitlements("pro")

      expect(freeLimits.cards).toBeLessThan(plusLimits.cards)
      expect(freeLimits.budgets).toBeLessThan(plusLimits.budgets)
      expect(plusLimits.budgets).toBeLessThan(proLimits.budgets)
    })

    it("should show admin has no limits", () => {
      const adminLimits = getPlanEntitlements("admin")

      expect(adminLimits.cards).toBe(Infinity)
      expect(adminLimits.statementsPerMonth).toBe(Infinity)
      expect(adminLimits.categories).toBe(Infinity)
      expect(adminLimits.alerts).toBe(Infinity)
      expect(adminLimits.budgets).toBe(Infinity)
    })

    it("should show all plans have keyword categorization enabled", () => {
      const plans: Plan[] = ["free", "plus", "pro", "admin"]
      plans.forEach((plan) => {
        expect(getPlanEntitlements(plan).keywordCategorization).toBe(true)
      })
    })
  })
})
