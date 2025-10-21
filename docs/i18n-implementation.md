# i18n Implementation Guide

## Overview

Personal CFO supports **English (en)** and **Spanish (es)** localization through a custom i18n system built on React Context and localStorage persistence.

## Architecture

### Core Files

1. **`lib/i18n.ts`** - Translation function and type definitions
2. **`contexts/locale-context.tsx`** - React Context provider for locale management
3. **`hooks/use-translation.ts`** - Convenience hook (wraps useLocale)
4. **`locales/en.json`** - English translations
5. **`locales/es.json`** - Spanish translations

### Flow

```
App Layout
  └─ ThemeProvider
      └─ LocaleProvider (manages locale state + localStorage)
          └─ Navbar (ES/EN toggle buttons)
          └─ Page Components (use useTranslation() hook)
```

## Usage

### In Components

```tsx
import { useTranslation } from "@/hooks/use-translation";

export function MyComponent() {
  const { t, locale, setLocale } = useTranslation();

  return (
    <div>
      <h1>{t("landing.hero.headline1")}</h1>
      <button onClick={() => setLocale("es")}>Español</button>
    </div>
  );
}
```

### Translation Keys

All translation keys use **dot notation** to access nested objects:

```typescript
t("landing.hero.headline1")  // → "Take control of"
t("landing.features.title")  // → "Everything you need to"
t("common.save")             // → "Save"
```

### Key Structure

```
landing
  ├─ hero (badge, headline1, headline2, subheadline, ctas, trust indicators)
  ├─ features (title, subtitle, description, 6 feature cards)
  ├─ pricing (title, subtitle, 3 plans with 6-8 features each)
  ├─ cta (title, subtitle, description, button, guarantee)
  └─ footer (brand, tagline, navigation sections)

common
  ├─ loading, error, save, cancel, delete, edit, etc.
```

## Features

### ✅ Locale Persistence

- Saved to `localStorage` under key `personal-cfo-locale`
- Restored on page reload
- Fallback to browser language detection (`navigator.language`)

### ✅ Browser Language Detection

On first visit (no stored preference):
- Detects browser language via `navigator.language`
- Sets to `"es"` if browser language starts with "es"
- Otherwise defaults to `"en"`

### ✅ Hydration Safety

- `LocaleProvider` delays rendering until client-side mount
- Prevents hydration mismatches between server/client
- Returns `null` during SSR to avoid flicker

### ✅ Type Safety

```typescript
export type Locale = "en" | "es";

type DeepRecord = { [key: string]: string | DeepRecord };
```

Translation function properly typed to prevent `any` usage.

## Adding New Translations

### 1. Add to JSON Files

**`locales/en.json`**:
```json
{
  "myFeature": {
    "title": "My Feature",
    "description": "Feature description"
  }
}
```

**`locales/es.json`**:
```json
{
  "myFeature": {
    "title": "Mi Funcionalidad",
    "description": "Descripción de la funcionalidad"
  }
}
```

### 2. Use in Components

```tsx
const { t } = useTranslation();

return <h1>{t("myFeature.title")}</h1>;
```

## Current Coverage

### Fully Translated Components

- ✅ **Hero** - Badge, headlines, CTAs, trust indicators
- ✅ **Features** - Section header, 6 feature cards
- ✅ **Pricing** - Section header, 3 pricing tiers with features
- ✅ **CTA** - Title, subtitle, description, button
- ✅ **Footer** - Brand, navigation links, social
- ✅ **Navbar** - ES/EN toggle buttons

### To Be Added

- 🔴 Auth pages (Login, Register, Reset Password)
- 🔴 Dashboard
- 🔴 Settings pages
- 🔴 Admin panel
- 🔴 Error messages
- 🔴 Form validation messages
- 🔴 Toast notifications

## Best Practices

### ✅ DO

- Use descriptive, hierarchical keys (`landing.hero.headline1`)
- Keep translations close to their structure in the UI
- Always provide both EN and ES translations simultaneously
- Use `t()` for all user-facing text (no hardcoded strings)
- Test language toggle on every new feature

### ❌ DON'T

- Hardcode user-facing text in components
- Use generic keys like `text1`, `label2`
- Skip translations for "obvious" English text
- Use inline translations (keep all in JSON files)
- Forget to update both `en.json` and `es.json`

## Migration Path (Future)

If migrating to a library like `next-intl` or `react-i18next`:

1. Current structure maps directly to most i18n libraries
2. Translation keys follow industry-standard dot notation
3. Context pattern is compatible with library providers
4. JSON files are standard format (no conversion needed)

## Testing

```bash
# Lint check
pnpm run lint

# Build check
pnpm build

# Manual testing
1. Toggle EN/ES in navbar
2. Reload page → locale should persist
3. Clear localStorage → should detect browser language
4. Check all landing sections for correct translations
```

## Performance

- Translation files loaded statically at build time
- No runtime fetching or lazy loading
- Context prevents prop drilling
- Minimal re-renders (context only changes on locale change)

## Accessibility

- `lang` attribute in `<html>` set to `"en"` by default
- TODO: Update `lang` dynamically based on locale
- All translated text maintains semantic HTML structure

---

**Last Updated:** 2025-10-21  
**Status:** ✅ Production Ready (Phase 0.4 Complete)
