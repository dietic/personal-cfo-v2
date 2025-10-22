import { describe, it, expect } from "vitest"
import { t } from "@/lib/i18n"

describe("i18n translation utility", () => {
  describe("English translations", () => {
    it("should return translation for valid path", () => {
      expect(t("en", "landing.hero.headline1")).toBe("Take control of")
    })

    it("should return nested translation", () => {
      expect(t("en", "landing.pricing.title")).toBe(
        "Simple, transparent pricing"
      )
    })

    it("should return deep nested translation", () => {
      expect(t("en", "landing.features.fast.title")).toBe("Lightning Fast")
    })
  })

  describe("Spanish translations", () => {
    it("should return translation for valid path", () => {
      expect(t("es", "landing.hero.headline1")).toBe("Toma el control de")
    })

    it("should return nested translation", () => {
      expect(t("es", "landing.pricing.title")).toBe(
        "Precios simples y transparentes"
      )
    })

    it("should return deep nested translation", () => {
      expect(t("es", "landing.features.fast.title")).toBe("Súper Rápido")
    })
  })

  describe("Error handling", () => {
    it("should return path when translation not found", () => {
      expect(t("en", "nonexistent.path")).toBe("nonexistent.path")
    })

    it("should return path when partial path exists but not complete", () => {
      expect(t("en", "landing.nonexistent")).toBe("landing.nonexistent")
    })

    it("should handle empty path gracefully", () => {
      expect(t("en", "")).toBe("")
    })

    it("should return path when locale has translation but path is too deep", () => {
      expect(t("en", "landing.hero.headline1.extra.deep")).toBe(
        "landing.hero.headline1.extra.deep"
      )
    })
  })

  describe("Locale switching", () => {
    it("should return different translations for different locales", () => {
      const enTitle = t("en", "landing.pricing.title")
      const esTitle = t("es", "landing.pricing.title")

      expect(enTitle).toBe("Simple, transparent pricing")
      expect(esTitle).toBe("Precios simples y transparentes")
      expect(enTitle).not.toBe(esTitle)
    })

    it("should handle same path across locales", () => {
      const enButton = t("en", "landing.cta.button")
      const esButton = t("es", "landing.cta.button")

      expect(enButton).toBe("Join the waiting list")
      expect(esButton).toBe("Únete a la lista de espera")
    })
  })

  describe("Common translations", () => {
    it("should access common section", () => {
      expect(t("en", "common.loading")).toBe("Loading...")
      expect(t("en", "common.save")).toBe("Save")
      expect(t("en", "common.cancel")).toBe("Cancel")
    })

    it("should access common section in Spanish", () => {
      expect(t("es", "common.loading")).toBe("Cargando...")
      expect(t("es", "common.save")).toBe("Guardar")
      expect(t("es", "common.cancel")).toBe("Cancelar")
    })
  })
})
