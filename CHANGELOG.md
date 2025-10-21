# Changelog

All notable changes to Personal CFO will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added (2025-10-21)

- Next.js 15 project scaffold with TypeScript, App Router
- Tailwind CSS configuration with design tokens
- Theme system with light/dark mode support (next-themes)
- CSS variables for comprehensive color palette (light/dark)
  - Primary, secondary, muted, accent colors
  - Success, warning, destructive, info, soft-destructive states
  - Sidebar-specific tokens
  - Chart colors for analytics
- shadcn/ui components: Button, Card with multiple variants
- Icon library (lucide-react) for UI elements
- i18n foundation (en/es) with translation hook
- Landing page with conversion-focused design:
  - Hero section with gradient headline, dual CTAs, trust indicators
  - Features section with emoji icons and hover animations (6 features)
  - Pricing section with 3 tiers (Free/Plus/Pro) and "most popular" badge
  - CTA section with urgency messaging and social proof
  - Footer with brand, social links, product/legal navigation
- Navbar with brand logo, ES/EN language toggle, theme toggle (Sun/Moon icons)
- Environment configuration (.env, .env.local.example)
- .gitignore with comprehensive rules
- React Compiler support (babel-plugin-react-compiler)
- TypeScript strict mode with proper type definitions

### Planned for v1.0.0

- User authentication with email verification
- Cards management (create, edit, delete)
- PDF statement upload with AI extraction
- Transactions management (manual add, edit, delete, filters)
- Categories with keywords and excluded keywords
- Budgets with monthly progress tracking
- Analytics with 3 charts and currency toggle (PEN/USD/EUR)
- Alerts (Budget Overrun, Unusual Spike)
- Settings (appearance, profile, language, timezone)
- Admin panel (user management, system health, banks management)
- Plan enforcement (free, plus, pro, admin)
- i18n (English/Spanish)
- Light/dark theme

---

## Version History

<!-- Release versions will be added here as they are deployed -->

<!-- Example format:

## [1.0.0] - 2025-01-15

### Added
- Initial release
- User authentication with Supabase Auth
- Cards module with CRUD operations
- PDF statement upload and AI extraction
- Transactions table with filters and sorting
- Categories, keywords, and excluded keywords
- Monthly budgets with progress bars
- Analytics dashboard with 3 charts
- Alerts system (Budget Overrun, Unusual Spike)
- Admin panel for user and system management
- Three pricing plans: Free, Plus, Pro
- Bilingual support (English/Spanish)
- Light and dark themes

### Fixed
- N/A (initial release)

### Changed
- N/A (initial release)

### Removed
- N/A (initial release)

-->

---

## Legend

- **Added**: New features
- **Changed**: Changes in existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Now removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements or vulnerability patches
