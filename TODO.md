# Personal CFO - Development TODO

This document is the **single source of truth** for all features, tasks, and milestones. Update this file as you complete tasks.

**Status Legend:**

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏸️ Blocked/Paused

---

## Phase 0: Project Setup & Foundation

### 0.1 Repository & Environment Setup

- 🟢 Initialize Next.js 15 project with TypeScript
- 🟢 Configure Tailwind CSS with shadcn/ui
- 🟢 Install and configure shadcn/ui components
- 🟢 Set up ESLint with strict TypeScript rules
- 🔴 Configure Prettier for code formatting
- 🔴 Set up environment variables structure (`.env.local.example`)
- 🟢 Create `.gitignore` (exclude `.env.local`, `node_modules`, `.next`, etc.)
- 🟢 Initialize Git repository with proper branching strategy

### 0.2 Supabase Setup

- 🟢 Create Supabase project
- 🟢 Configure Supabase client libraries (`lib/supabase.ts`, `lib/supabase-browser.ts`)
- 🔴 Set up Supabase environment variables (`.env.local.example` + docs)
- ⏸️ Configure Supabase Storage bucket for temp uploads (v1 processes PDFs in memory; no storage needed)
- 🟢 Set up RLS policies scaffold (implemented in migrations)
- 🔴 Enable email verification in Supabase Auth settings

### 0.3 Core Infrastructure

- 🔴 Create `lib/env.ts` for environment variable validation
- 🟢 Create `lib/logger.ts` for structured logging
- 🔴 Create `lib/errors.ts` for error handling utilities
- 🟢 Create `lib/validators/` folder with base Zod schemas
- 🟢 Set up `middleware.ts` for route protection
- 🟢 Configure Next.js (`next.config.ts`) (App Router + settings)
- 🟢 Create `components/landing/hero.tsx`
- 🟢 Create `components/landing/features.tsx`
- 🟢 Create `components/landing/pricing.tsx` (show Free/Plus/Pro plans)
- 🟢 Create `components/landing/cta.tsx` ("Join Waiting List" CTA)
- 🟢 Create `components/landing/footer.tsx` (links, social, copyright)
- 🟢 Add responsive design (mobile-first)
- 🔴 Add micro-animations (scroll reveals, hover effects)

### 14.2 Public Navigation

- 🟢 Create `components/landing/navbar.tsx` (with language toggle, theme toggle, brand)
- 🔴 Create `components/nav/auth-nav.tsx` (Dashboard, Logout, User menu)
- 🟢 Fix landing navbar mobile overflow by adding responsive mobile menu (Sheet) and hiding desktop actions under md
- 🔴 Change mobile menu isotype to white variant (use white asset in dark theme or ensure contrast in mobile sheet)
- 🟢 Create `lib/validators/` folder with base Zod schemas
- 🟢 Set up `middleware.ts` for route protection
- 🟢 Configure Next.js (`next.config.ts`) (App Router + settings)ument is the **single source of truth** for all features, tasks, and milestones. Update this file as you complete tasks.

**Status Legend:**

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏸️ Blocked/Paused

---

## Phase 0: Project Setup & Foundation

### 0.1 Repository & Environment Setup

- 🟢 Initialize Next.js 15 project with TypeScript
- 🟢 Configure Tailwind CSS with shadcn/ui
- 🟢 Install and configure shadcn/ui components
- 🟢 Set up ESLint with strict TypeScript rules
- 🔴 Configure Prettier for code formatting
- 🔴 Set up environment variables structure (`.env.local.example`)
- 🟢 Create `.gitignore` (exclude `.env.local`, `node_modules`, `.next`, etc.)
- 🟢 Initialize Git repository with proper branching strategy

### 0.2 Supabase Setup

- 🟢 Create Supabase project
- 🟢 Configure Supabase client libraries (`lib/supabase.ts`, `lib/supabase-browser.ts`)
- 🟢 Set up Supabase environment variables (`.env.local.example` + docs)
- ⏸️ Configure Supabase Storage bucket for temp uploads (v1 processes PDFs in memory; no storage needed)
- 🟢 Set up RLS policies scaffold (implemented in migrations)
- 🔴 Enable email verification in Supabase Auth settings

### 0.3 Core Infrastructure

- 🔴 Create `lib/env.ts` for environment variable validation
- 🟢 Create `lib/logger.ts` for structured logging
- 🔴 Create `lib/errors.ts` for error handling utilities
- 🟢 Create `lib/validators/` folder with base Zod schemas
- 🟢 Set up `middleware.ts` for route protection
- 🟢 Configure Next.js (`next.config.ts`) (App Router + settings)

### 0.4 i18n Setup

- 🟢 Create `locales/en.json` with English strings
- 🟢 Create `locales/es.json` with Spanish strings
- 🟢 Create `lib/i18n.ts` for translation utilities
- 🟢 Create `hooks/use-translation.ts` hook
- 🟢 Create `contexts/locale-context.tsx` with LocaleProvider
- 🟢 Add language toggle component (Navbar)
- 🟢 Integrate LocaleProvider in root layout
- 🟢 Update all landing page components with translations (Hero, Features, Pricing, CTA, Footer)
- 🟢 Implement localStorage persistence for locale preference
- 🟢 Add browser language detection on first visit

### 0.5 Theme & Design System

- 🟢 Set up CSS variables for theme tokens in `globals.css`
- 🟢 Create `components/theme-provider.tsx`
- 🟢 Create `components/theme-toggle.tsx`
- 🟢 Configure light/dark mode switching
- 🟢 Test theme tokens across shadcn/ui components

---

## Phase 1: Database Schema & Migrations

### 1.1 Core Tables Migration

- 🟢 Create migration: `profiles` table with timezone, primary_currency, plan (Applied via 20251021000001)
- 🟢 Create migration: `banks` table (Applied via 20251021000001)
- 🟢 Create migration: `cards` table with foreign keys (Applied via 20251021000002)
- 🟢 Create migration: `statements` table (NO file_path, add retry_count) (Applied via 20251021000002)
- 🟢 Create migration: `transactions` table (statement_id nullable, updated_at) (Applied via 20251021000004)
- 🟢 Create migration: `categories` table (is_preset, status enum) (Applied via 20251021000003)
- 🟢 Create migration: `category_keywords` table (Applied via 20251021000003)
- 🟢 Create migration: `excluded_keywords` table (Applied via 20251021000003)
- 🟢 Create migration: `budgets` table (period_start, period_end) (Applied via 20251021000005)
- 🟢 Create migration: `alerts` table (Applied via 20251021000005)
- 🟢 Create migration: `alert_notifications` table (Applied via 20251021000005)
- ⏸️ Create migration: `plans` table (optional, if not using static config)

### 1.2 RLS Policies

- 🟢 Add RLS policy: `profiles` (auth.uid() = id)
- 🟢 Add RLS policy: `cards` (auth.uid() = user_id)
- 🟢 Add RLS policy: `statements` (auth.uid() = user_id)
- 🟢 Add RLS policy: `transactions` (auth.uid() = user_id)
- 🟢 Add RLS policy: `categories` (auth.uid() = user_id)
- 🟢 Add RLS policy: `category_keywords` (auth.uid() = user_id)
- 🟢 Add RLS policy: `excluded_keywords` (auth.uid() = user_id)
- 🟢 Add RLS policy: `budgets` (auth.uid() = user_id)
- 🟢 Add RLS policy: `alerts` (auth.uid() = user_id)
- 🟢 Add RLS policy: `alert_notifications` (auth.uid() = user_id)
- 🟢 Add RLS policy: `banks` (public read, admin write)

### 1.3 Database Indexes

- 🟢 Add index: `transactions(user_id, transaction_date)`
- 🟢 Add index: `transactions(user_id, category_id)`
- 🟢 Add index: `transactions(statement_id)`
- 🟢 Add index: `statements(user_id, uploaded_at)`
- 🟢 Add index: `categories(user_id, status)`
- 🟢 Add index: `budgets(user_id, category_id)`

### 1.4 Database Functions & Views

- 🔴 Create function: `get_monthly_statement_usage(user_id)` for free plan limit
- 🔴 Create materialized view: `statements_monthly_usage` (optional optimization)
- 🔴 Create function: `get_category_spend(user_id, category_id, start_date, end_date)`
- 🔴 Create function: `get_monthly_budget_progress(user_id)`

### 1.5 Seeds

- 🟢 Seed banks: BCP, Interbank, BBVA, Scotiabank, Diners, Mibanco, Caja Piura, Caja Arequipa, Caja Huancayo, Banco Pichincha, Other
- ⏸️ Seed admin user: `admin@personal-cfo.io` with plan=admin, is_admin=true (awaiting Auth user creation)
- 🟢 Create trigger/function: Auto-create 6 system categories on user signup (Food, Housing, Transportation, Income, Entertainment, Shopping)
- 🔴 Seed plans table (if using): free, plus, pro, admin with entitlements JSON

> Note: All migrations and seeds above were applied to the SUPABASE-CFO project on 2025-10-22 UTC. Banks count verified = 11. Profiles table currently has 0 rows; default categories will be created on first profile insert via trigger.

---

## Phase 2: Authentication & User Management

### 2.1 Auth Pages

- 🔴 Create `/login` page with email/password form
- 🔴 Create `/register` page with email/password/name fields + "Join Waiting List" CTA
- 🔴 Create `/forgot-password` page
- 🔴 Create `/reset-password` page
- 🔴 Add email verification flow messaging (check inbox, resend verification)
- 🔴 Add redirect after login/register to dashboard

### 2.2 Auth Logic

- 🟢 Create `lib/auth.ts` with `requireAuth()` server helper
- 🟢 Create `hooks/use-auth.ts` client hook
- 🟢 Implement session management with Supabase Auth
- 🟢 Add logout functionality
- 🔴 Handle email verification status checks

### 2.3 Middleware

- 🟢 Protect routes: `/dashboard`, `/cards`, `/transactions`, `/statements`, `/analytics`, `/budgets`, `/settings`, `/admin`
- 🟢 Redirect unauthenticated users to `/login?redirect=<path>`
- 🟢 Redirect authenticated users from `/login` to `/dashboard`
- 🔴 Check email verification status on protected routes

### 2.4 Profile Management

- 🔴 Create profile on user signup (trigger or manual)
- 🔴 Set default timezone to "America/Lima"
- 🔴 Set default primary_currency to "PEN"
- 🔴 Set default plan to "free"

---

## Phase 3: Plan Enforcement & Entitlements

### 3.1 Plan Utilities

- 🟢 Create `lib/plan.ts` with plan entitlement constants
- 🟢 Create `getPlanEntitlements(plan)` function
- 🟢 Create `canCreateCard(userId)` check
- 🟢 Create `canUploadStatement(userId)` check (monthly limit for free)
- 🔴 Create `canCreateCategory(userId)` check
- 🔴 Create `canCreateBudget(userId)` check
- 🔴 Create `canCreateAlert(userId)` check

### 3.2 Plan Enforcement in APIs

- 🟢 Add plan checks to `POST /api/cards`
- 🟢 Add plan checks to `POST /api/statements`
- 🔴 Add plan checks to `POST /api/settings/categories`
- 🔴 Add plan checks to `POST /api/budgets`
- 🔴 Add plan checks to `POST /api/alerts`

### 3.3 Plan Upgrade/Downgrade Logic

- 🔴 Create `lib/plan-migration.ts` for plan change handling
- 🔴 Implement category deactivation on downgrade (keep system categories active, deactivate user categories beyond limit)
- 🔴 Add warning messages when user reaches plan limits
- 🔴 Add upgrade CTA modals/toasts when limits hit

---

## Phase 4: Cards Module

### 4.1 Cards API

- 🟢 Create `app/api/cards/route.ts` (GET all, POST create)
- 🟢 Create `app/api/cards/[id]/route.ts` (GET one, PATCH update, DELETE)
- 🟢 Create `lib/validators/cards.ts` with Zod schemas
- 🟢 Implement plan checks in POST handler
- 🟢 Add RLS validation

### 4.2 Cards UI

- 🟢 Create `/cards` page with table/grid view
- 🟢 Create `components/cards/cards-list.tsx` (card grid view)
- 🟢 Create `components/cards/card-form.tsx` (modal or drawer)
- 🟢 Create `components/cards/delete-card-dialog.tsx`
- 🟢 Add bank dropdown (populated from `banks` table)
- 🟢 Add due date picker (optional field)
- 🟢 Add loading/error/empty states
- 🟢 Create `hooks/use-cards.ts` for data fetching

### 4.3 Cards Tests

- 🔴 Unit test: card validator schemas
- 🔴 Integration test: POST /api/cards (success, plan limit exceeded)
- 🔴 Integration test: PATCH /api/cards/[id]
- 🔴 Integration test: DELETE /api/cards/[id] (check cascade behavior)

---

## Phase 5: Transactions Module

### 5.1 Transactions API

- 🟢 Create `app/api/transactions/route.ts` (GET with filters, POST create)
- 🟢 Create `app/api/transactions/[id]/route.ts` (GET one, PATCH update, DELETE)
- 🟢 Create `app/api/transactions/bulk-delete/route.ts` (DELETE multiple by ids) - basic delete implemented, bulk endpoint pending
- 🔴 Create `app/api/transactions/recategorize/route.ts` (PATCH bulk re-categorize)
- 🟢 Create `lib/validators/transactions.ts` with Zod schemas

### 5.2 Transactions UI

- 🟢 Create `/transactions` page with table view
- 🟢 Create `components/transactions/transactions-table.tsx`
- 🟢 Create `components/transactions/transaction-form.tsx` (manual add/edit)
- 🟢 Create `components/transactions/filters-dialog.tsx` (date range, category, card, currency)
- 🟢 Create `components/transactions/transactions-toolbar.tsx` (select, delete, re-categorize)
- 🟢 Add sortable columns (date, amount, category, card)
- 🟢 Add pagination
- 🟢 Create `hooks/use-transactions.ts` for data fetching
- 🟢 Ensure full i18n coverage for transactions (placeholders, loading states, row actions)

### 5.3 Transactions Tests

- 🔴 Unit test: transaction validator schemas
- 🔴 Integration test: POST /api/transactions (manual transaction with statement_id=null)
- 🔴 Integration test: GET /api/transactions with filters
- 🔴 Integration test: PATCH /api/transactions/[id]
- 🔴 Integration test: DELETE /api/transactions/bulk-delete

---

## Phase 6: Categories, Keywords & Excluded Keywords

### 6.1 Categories API

- 🔴 Create `app/api/settings/categories/route.ts` (GET all, POST create)
- 🔴 Create `app/api/settings/categories/[id]/route.ts` (GET one, PATCH update, DELETE)
- 🔴 Create `lib/validators/categories.ts` with Zod schemas
- 🔴 Implement plan checks (free users cannot add/delete system categories)
- 🔴 Block deletion of system categories (`is_preset = true`)

### 6.2 Categories UI

- 🔴 Create `/settings/categories` page with table view
- 🔴 Create `components/settings/categories-table.tsx`
- 🔴 Create `components/settings/category-form.tsx` (modal/drawer)
- 🔴 Create `components/settings/category-delete-dialog.tsx`
- 🔴 Add emoji picker
- 🔴 Add color picker
- 🔴 Show status (active/inactive)
- 🔴 Create `hooks/use-categories.ts`

### 6.3 Keywords API

- 🔴 Create `app/api/settings/keywords/route.ts` (GET by category_id, POST create, POST bulk create)
- 🔴 Create `app/api/settings/keywords/[id]/route.ts` (PATCH update, DELETE)
- 🔴 Create `app/api/settings/keywords/bulk-delete/route.ts`
- 🔴 Create `lib/validators/keywords.ts` with Zod schemas

### 6.4 Keywords UI

- 🔴 Create `/settings/keywords` page with category selector
- 🔴 Create `components/settings/keywords-table.tsx`
- 🔴 Create `components/settings/keyword-form.tsx` (inline add + bulk comma-separated input)
- 🔴 Add search/filter for keywords
- 🔴 Create `hooks/use-keywords.ts`

### 6.5 Excluded Keywords API

- 🔴 Create `app/api/settings/excluded-keywords/route.ts` (GET all, POST create, POST bulk create)
- 🔴 Create `app/api/settings/excluded-keywords/[id]/route.ts` (DELETE)
- 🔴 Create `app/api/settings/excluded-keywords/bulk-delete/route.ts`
- 🔴 Create `lib/validators/excluded-keywords.ts` with Zod schemas

### 6.6 Excluded Keywords UI

- 🔴 Create `/settings/excluded-keywords` page with list view
- 🔴 Create `components/settings/excluded-keywords-list.tsx`
- 🔴 Create `components/settings/excluded-keyword-form.tsx` (bulk add)
- 🔴 Add bulk delete with confirmation
- 🔴 Create `hooks/use-excluded-keywords.ts`

### 6.7 Categorization Engine

- 🔴 Create `lib/categorization.ts` with categorization logic
- 🔴 Implement text normalization (lowercase, strip accents, remove prefixes)
- 🔴 Implement excluded keyword matching (mark as Uncategorized if matched)
- 🔴 Implement category keyword matching (first match wins)
- 🔴 Implement fallback to Uncategorized if no match

### 6.8 Tests

- 🔴 Unit test: categorization engine (various scenarios)
- 🔴 Unit test: text normalization
- 🔴 Unit test: excluded keyword matching
- 🔴 Integration test: POST /api/settings/categories (plan limits)
- 🔴 Integration test: bulk keyword create

---

## Phase 7: Statements & PDF Processing

### 7.1 Statements API

- 🟢 Create `app/api/statements/route.ts` (GET all, POST upload)
- 🟢 Create `app/api/statements/[id]/route.ts` (GET one, DELETE)
- 🔴 Create `app/api/statements/[id]/retry/route.ts` (POST retry extraction)
- 🔴 Create `app/api/statements/[id]/recategorize/route.ts` (POST re-categorize transactions)
- 🟢 Create `app/api/statements/bulk-delete/route.ts`
- 🟢 Create `lib/validators/statements.ts` with Zod schemas
- 🟢 Implement plan checks (free: 2/month limit)
- 🔴 Implement rate limiting (10 uploads/minute per user)

### 7.2 PDF Processing Infrastructure

- 🟢 Create `lib/pdf/extract.ts` for PDF text extraction
- 🟢 Add PDF encryption/lock detection
- 🟢 Add text prefix artifact stripping
- 🟢 Implement MIME type validation (`application/pdf`)
- 🟢 Create temp file handling (process in memory, delete immediately)
- 🟢 Add retry logic (max 2 retries)

### 7.3 AI Extraction (OpenAI)

- 🟢 Create `lib/ai/parse-statement.ts` (prompt implemented)
- 🟢 Integrate OpenAI API for transaction extraction
- 🟢 Parse JSON response from AI
- 🟢 Validate extracted transactions
- 🟢 Handle low-confidence extractions (mark as failed)

### 7.4 Background Jobs Setup

- 🟢 Choose queue system (Inngest with dev fallback to inline processing)
- ⏸️ Set up Redis (not needed; using Inngest)
- 🟢 Create background processing infrastructure via `lib/inngest/`
- 🟢 Create statement extraction task (`lib/inngest/functions/process-statement.ts`)
- 🔴 Create re-categorization task
- 🟢 Add job status updates (processing → completed/failed)
- 🟢 Add retry mechanism with backoff (Inngest retry count tracked)

### 7.5 Statements UI

- 🟢 Create `/statements` page with table view
- 🟢 Create `components/statements/statements-table.tsx`
- 🟢 Create `components/statements/statement-upload-dialog.tsx` (drag-and-drop + click to browse)
  - **File validation:** PDF only (application/pdf MIME type)
  - **Upload methods:** Drag-and-drop zone + click to browse file picker
  - **User guidance:** Show helpful notes about file requirements and processing expectations
  - **Card selection:** Dropdown to associate statement with a card
  - **Password protection:** Prompt for password if PDF is locked
- 🟢 Create `components/statements/statements-toolbar.tsx` with status badges
- 🔴 Add retry button for failed statements
- 🟢 Add bulk delete with confirmation (`components/statements/delete-statement-dialog.tsx`)
- 🔴 Add re-categorize button (single/bulk)
- 🟢 Create `hooks/use-statements.ts`
- 🟢 Show upload progress indicator (toasts and realtime updates)
- 🟢 Show helpful error messages for locked PDFs
- 🟢 Create `components/statements/statement-realtime-listener.tsx` for realtime status updates

### 7.6 Tests

- 🔴 Unit test: PDF extraction (mock PDFs)
- 🔴 Unit test: AI parsing (mock OpenAI responses)
- 🔴 Unit test: categorization of extracted transactions
- 🔴 Integration test: POST /api/statements (upload → extract → persist)
- 🔴 Integration test: rate limiting (exceed 10 uploads/minute)
- 🔴 Integration test: plan limit (free user exceeds 2/month)
- 🔴 Integration test: retry failed statement

---

## Phase 8: Budgets Module

### 8.1 Budgets API

- 🔴 Create `app/api/budgets/route.ts` (GET all, POST create)
- 🔴 Create `app/api/budgets/[id]/route.ts` (GET one, PATCH update, DELETE)
- 🔴 Create `app/api/budgets/progress/route.ts` (GET current month progress for all budgets)
- 🔴 Create `lib/validators/budgets.ts` with Zod schemas
- 🔴 Implement plan checks (max budgets per plan)

### 8.2 Budgets Logic

- 🔴 Create `lib/budgets.ts` with budget calculation utilities
- 🔴 Implement current month calculation (calendar month, resets on 1st)
- 🔴 Calculate spent amount per category for current month
- 🔴 Calculate remaining amount and percentage
- 🔴 Handle multiple currencies (budget in PEN, transactions in USD → convert)

### 8.3 Budgets UI

- 🔴 Create `/budgets` page with card grid view
- 🔴 Create `components/budgets/budget-card.tsx` (shows progress bar, category, spent/remaining)
- 🔴 Create `components/budgets/budget-form.tsx` (modal/drawer)
- 🔴 Create `components/budgets/budget-delete-dialog.tsx`
- 🔴 Add category selector (only active categories)
- 🔴 Add currency selector
- 🔴 Show visual progress (progress bar, colors for warning/danger thresholds)
- 🔴 Create `hooks/use-budgets.ts`

### 8.4 Tests

- 🔴 Unit test: budget progress calculation
- 🔴 Unit test: currency conversion in budgets
- 🔴 Integration test: POST /api/budgets (plan limits)
- 🔴 Integration test: GET /api/budgets/progress

---

## Phase 9: Analytics Module

### 9.1 Exchange Rate Integration

- 🔴 Research free exchange rate APIs (exchangerate-api.io, currencyapi.com, etc.)
- 🟢 Create `lib/currency.ts` with exchange rate utilities
- 🟢 Implement `getExchangeRate(from, to)` function (basic implementation exists)
- 🔴 Add caching for exchange rates (1-hour TTL)
- 🔴 Handle API errors gracefully (fallback to cached rates)

### 9.2 Spending by Category API

- 🔴 Create `app/api/analytics/spend-by-category/route.ts`
- 🔴 Query params: `from`, `to`, `account` (optional card filter), `currency`
- 🔴 Response: Array of `{ categoryId, name, color, amount, pct, deltaPctPrev, txCount }`
- 🔴 Pre-aggregate `SUM(amount)` by `category_id` with index on `(user_id, transaction_date, category_id)`
- 🔴 Implement server-side currency conversion (convert to `primary_currency`)
- 🔴 Calculate previous period comparison (same length window immediately preceding `from/to`)
- 🔴 Handle deleted categories: attribute historic spend to "Deleted Category (date)"
- 🔴 Add `lib/validators/analytics.ts` with Zod schemas for query params

### 9.3 Spending Over Time API

- 🔴 Create `app/api/analytics/spend-over-time/route.ts`
- 🔴 Query params: `granularity` (month|week), `from`, `to`, `account`, `currency`
- 🔴 Response: Array of `{ period, amount, txCount, topCategory: { id, name, amount } }`
- 🔴 Group by `date_trunc(granularity, transaction_date at time zone profile.tz)` with covering index
- 🔴 Respect user timezone (store UTC, render in `profile.timezone`)
- 🔴 Gaps (no spend) render as zero; don't interpolate
- 🔴 Apply currency conversion to all calculations

### 9.4 Income vs Expenses API

- 🔴 Create `app/api/analytics/income-vs-expenses/route.ts`
- 🔴 Query params: `granularity` (month|week), `from`, `to`, `account`, `currency`
- 🔴 Response: Array of `{ period, income, expenses, net }`
- 🔴 Classify transactions: Income (amount > 0 or category family "Income"), Expense (amount < 0 or all non-income)
- 🔴 Normalize sign server-side to positive magnitudes in response
- 🔴 Handle refunds: Detect negative expense next to positive charge and annotate in response
- 🔴 Convert currencies using daily FX at transaction date (cache table or hourly FX cache)

### 9.5 Net Cashflow API

- 🔴 Create `app/api/analytics/net-cashflow/route.ts`
- 🔴 Query params: `from`, `to`, `account`, `currency`
- 🔴 Response: `{ net, income, expenses, deltaPctPrev, sparkline: [{ date, net }] }`
- 🔴 If `from/to` spans <7 days, use daily sparkline; otherwise weekly bins
- 🔴 Single aggregation query; sparkline grouped by day/week with index on `(user_id, transaction_date)`
- 🔴 Show info banner if income or expenses are zero for period

### 9.6 Analytics Logic & Utilities

- 🔴 Create `lib/analytics.ts` with aggregation utilities
- 🔴 Implement spending by category calculation (pre-aggregation with SQL, category color from design tokens)
- 🔴 Implement spending over time calculation (weekly/monthly/quarterly granularity)
- 🔴 Implement income vs expenses classification and net calculation
- 🔴 Implement net cashflow with sparkline generation
- 🔴 Apply currency conversion to all calculations (use `lib/currency.ts`)
- 🔴 Implement dynamic insights generation (optional, future enhancement):
  - Top 3 categories % of total
  - MoM growth trends
  - Spike detection for spending over time
  - Consecutive negative months warning

### 9.7 Analytics UI - Spending by Category

- 🔴 Create `/analytics` page with 4 card tiles
- 🔴 Create `components/analytics/spend-by-category.tsx`
- 🔴 Tile layout: Card with header actions (Date Range, Account, Currency) + Donut chart + Legend table
- 🔴 Legend table columns: Category • Amount • % of total • Δ vs previous period
- 🔴 Use category brand colors from design tokens; consistent across app
- 🔴 Interactions:
  - Hover chart slice: Tooltip with category, amount, %, delta; slice expands 2-3px (a11y focus ring)
  - Click slice or legend row: Cross-filter page to that category (show removable chip in header)
  - Legend toggle: Hide/show category (recalculate % of total for visible set)
  - Keyboard: Arrow keys cycle slices; Enter locks filter; Esc clears selection
- 🔴 Empty/sparse states: No transactions → CTA to upload; Single category → meter (progress bar) + info banner
- 🔴 Dynamic insights (optional): Top 3 categories % message, category delta alerts
- 🔴 A11y: Donut slices tabbable; tooltips mirrored into `aria-live="polite"`; legend rows have `aria-controls`

### 9.8 Analytics UI - Spending Over Time

- 🔴 Create `components/analytics/spend-over-time.tsx`
- 🔴 Tile layout: Card with multi-period Line chart (Monthly default; toggle Weekly/Monthly/Quarterly)
- 🔴 Overlay: Optional 3-month moving average line (toggle)
- 🔴 Summary chips: Current period total, Δ vs previous, Top category this period
- 🔴 Interactions:
  - Hover data point: Tooltip with period, amount, top category, tx count
  - Click data point: Cross-filter page to that period (locks `from/to`)
  - Brush selection (drag): Set custom date range, updates header filters
  - Legend category mini-toggle: Optional "By Category" sub-view (stacked area)
  - Double-click canvas: Reset zoom/range
- 🔴 Empty/sparse states: <10 transactions → suggest 90 days for clearer trend
- 🔴 Dynamic insights (optional): MoM growth %, notable spikes with dates
- 🔴 A11y: Every point accessible via keyboard; tooltip content mirrored to invisible table with caption

### 9.9 Analytics UI - Income vs Expenses

- 🔴 Create `components/analytics/income-vs-expenses.tsx`
- 🔴 Tile layout: Card with stacked bar chart per period (Income top, Expenses below baseline) + Net line overlay
- 🔴 View toggles: Periodicity (Week/Month), "Absolute" vs "Normalized per day"
- 🔴 Interactions:
  - Hover bar segment: Tooltip with period, income, expenses, net
  - Click bar: Cross-filter page to that period
  - Shift+Click bar: Open detail drawer (top income sources, top expense categories, last 10 transactions)
  - Toggle chip "Show Categories": Convert expense segment to stacked sub-bars by top 3 + "Other"
- 🔴 Empty/sparse states: No data messages with guidance
- 🔴 Dynamic insights (optional): Positive net X/Y months (median), net turning negative alerts
- 🔴 A11y: Bar stacks have `role="img"` + data table fallback with caption

### 9.10 Analytics UI - Net Cashflow

- 🔴 Create `components/analytics/net-cashflow.tsx`
- 🔴 Tile layout: Large KPI number with delta pill + 7-30 day sparkline beneath
- 🔴 KPI: Net Cashflow (Selected Range): +S/ X,XXX; Delta pill: +/- % vs previous period (green/red)
- 🔴 Secondary stats: Income S/ X,XXX • Expenses S/ X,XXX
- 🔴 Color logic: Green if net ≥ 0; Red if < 0
- 🔴 Interactions:
  - Hover sparkline point: Tooltip with date, net, top transaction
  - Click sparkline point: Filter page to that day/week
  - Click KPI: Toggle comparison This period ↔ Previous period (animate number roll-up)
  - 2+ consecutive negative months: Show CTA "See drivers →" with side panel (top 3 categories/merchants, quick budget links)
- 🔴 Empty/sparse states: Info banner if income or expenses zero
- 🔴 A11y: KPI announced with `aria-live="polite"`; sparkline has offscreen table for screen readers

### 9.11 Analytics UI - Shared Components & Logic

- 🔴 Create `components/analytics/currency-toggle.tsx` (PEN/USD/EUR minimum, shared across all tiles)
- 🔴 Create `components/analytics/date-range-picker.tsx` (shared header control: Last 30/90 days, Custom)
- 🔴 Create `components/analytics/account-filter.tsx` (optional card/account filter dropdown)
- 🔴 Create `hooks/use-analytics.ts` for data fetching (spend-by-category, spend-over-time, income-vs-expenses, net-cashflow)
- 🔴 Add loading states (use Skeleton loaders, set `aria-busy` on cards)
- 🔴 Add empty states (no data messages with CTAs)
- 🔴 Implement cross-filtering: Any click selection updates all tiles and URL (`?from&to&category&period`) within ~150ms (debounced)
- 🔴 Persistent filters: State restored on refresh, shareable as link
- 🔴 Error handling: Non-blocking toasts; card-level retry button (`onRetry` refetches endpoint)
- 🔴 i18n & Formats: Use locale for dates/numbers; respect `profiles.primary_currency`; show currency code in tooltips
- 🔴 Performance: Pre-aggregate queries with SQL indexes; p95 < 150ms for ≤100k transactions

### 9.12 Tests

- 🔴 Unit test: exchange rate utilities (cache, fallback)
- 🔴 Unit test: analytics calculations (spend-by-category, spend-over-time, income-vs-expenses, net-cashflow)
- 🔴 Unit test: currency conversion in analytics
- 🔴 Integration test: GET /api/analytics/spend-by-category (with filters, currency toggle)
- 🔴 Integration test: GET /api/analytics/spend-over-time (granularity, timezone handling)
- 🔴 Integration test: GET /api/analytics/income-vs-expenses (income/expense classification)
- 🔴 Integration test: GET /api/analytics/net-cashflow (sparkline generation)

---

## Phase 10: Alerts Module

### 10.1 Alerts API

- 🔴 Create `app/api/alerts/route.ts` (GET all, POST create)
- 🔴 Create `app/api/alerts/[id]/route.ts` (GET one, PATCH update, DELETE)
- 🔴 Create `app/api/alerts/notifications/route.ts` (GET recent notifications)
- 🔴 Create `lib/validators/alerts.ts` with Zod schemas
- 🔴 Implement plan checks (max alerts per plan)

### 10.2 Alerts Logic

- 🔴 Create `lib/alerts.ts` with alert evaluation logic
- 🔴 Implement Budget Overrun rule (category monthly spend ≥ threshold)
- 🔴 Implement Unusual Spike rule (daily spend > rolling avg × factor)
- 🔴 Create alert evaluation function (called on transaction create/update)
- 🔴 Store triggered alerts in `alert_notifications` table

### 10.3 Alerts UI

- 🔴 Create `/settings/alerts` page (alert management)
- 🔴 Create `components/alerts/alerts-table.tsx`
- 🔴 Create `components/alerts/alert-form.tsx` (modal/drawer)
- 🔴 Create `components/alerts/alert-delete-dialog.tsx`
- 🔴 Create `components/dashboard/alert-notification-card.tsx` (displays on dashboard)
- 🔴 Add rule type selector (Budget Overrun, Unusual Spike)
- 🔴 Add params input (threshold, factor, category)
- 🔴 Add enable/disable toggle
- 🔴 Create `hooks/use-alerts.ts`

### 10.4 Real-Time Alert Evaluation

- 🔴 Add alert evaluation to transaction creation flow
- 🔴 Add alert evaluation to transaction update flow
- 🔴 Create background job for periodic alert checks (optional, if not real-time)
- 🔴 Send alert notifications to `alert_notifications` table
- 🔴 Update `last_triggered_at` timestamp on alerts

### 10.5 Tests

- 🔴 Unit test: Budget Overrun rule
- 🔴 Unit test: Unusual Spike rule
- 🔴 Integration test: POST /api/alerts (plan limits)
- 🔴 Integration test: alert triggers on transaction create

---

## Phase 11: Dashboard

### 11.1 Dashboard API

- 🔴 Create `app/api/dashboard/summary/route.ts` (cards count, recent transactions, budget snapshot, monthly expenses)
- 🔴 Create `app/api/dashboard/alerts/route.ts` (recent alert notifications)
- 🔴 Optimize queries for performance (use indexes, joins)

### 11.2 Dashboard UI

- 🟢 Create `/dashboard` page (main landing after login)
- 🟢 Create `components/dashboard/welcome-header.tsx`
- 🟢 Create `components/dashboard/cards-summary.tsx` (count, quick add CTA)
- 🟢 Create `components/dashboard/alerts-summary.tsx` (notification cards)
- 🟢 Create `components/dashboard/budgets-snapshot.tsx` (top 3 budgets with progress)
- 🟢 Create `components/dashboard/monthly-expenses-summary.tsx` (current month total)
- 🟢 Create `components/dashboard/recurrent-services-summary.tsx` (optional, detect recurring transactions)
- 🟢 Create `components/dashboard/recent-transactions.tsx` (last 5-10)
- 🟢 Add loading/empty states (Skeleton loaders implemented)
- 🔴 Create `hooks/use-dashboard.ts` (currently components fetch their own data)

---

## Phase 12: Settings & Profile

### 12.1 Appearance Settings

- 🔴 Create `/settings/appearance` page
- 🔴 Create `components/settings/appearance-form.tsx`
- 🔴 Add card color style toggle (default palette vs bank colors)
- 🔴 Add theme toggle (light/dark)
- 🔴 Persist settings in `profiles` table or local storage

### 12.2 Profile Settings

- 🔴 Create `/settings/profile` page
- 🔴 Create `components/settings/profile-form.tsx`
- 🔴 Add name/last name fields
- 🔴 Add timezone selector (dropdown with common timezones, default America/Lima)
- 🔴 Add primary currency selector (default PEN)
- 🔴 Add password reset flow (Supabase Auth)

### 12.3 i18n Settings

- 🔴 Create `/settings/language` page
- 🔴 Create `components/settings/language-toggle.tsx`
- 🔴 Add language selector (en/es)
- 🔴 Persist locale in `profiles.locale`
- 🔴 Apply translations across entire app

### 12.4 Settings Layout

- 🔴 Create `/settings/layout.tsx` with tabbed navigation
- 🔴 Add tabs: Appearance, Categories, Keywords, Excluded Keywords, Profile, Language, Alerts

---

## Phase 13: Admin Panel

### 13.1 Admin Middleware & Access Control

- 🔴 Add admin route protection in `middleware.ts`
- 🔴 Create `lib/admin.ts` with `requireAdmin()` helper
- 🔴 Check `profiles.is_admin = true` AND `plan = 'admin'`

### 13.2 User Management

- 🔴 Create `/admin/users` page with table
- 🔴 Create `components/admin/users-table.tsx`
- 🔴 Add columns: email, plan, created_at, status (active/inactive)
- 🔴 Add reset password action (to default `PersonalCFO2025!`)
- 🔴 Add deactivate/activate account actions
- 🔴 Create `app/api/admin/users/[id]/reset-password/route.ts`
- 🔴 Create `app/api/admin/users/[id]/toggle-status/route.ts`

### 13.3 System Health

- 🔴 Create `/admin/system` page
- 🔴 Create `components/admin/job-queue-stats.tsx` (pending, processing, completed, failed counts)
- 🔴 Create `components/admin/failed-jobs-table.tsx`
- 🔴 Add retry button for failed statement extraction jobs
- 🔴 Show job details (statement_id, user, failure reason, retry count)
- 🔴 Create `app/api/admin/jobs/[id]/retry/route.ts`

### 13.4 Banks Management

- 🔴 Create `/admin/banks` page with table
- 🔴 Create `components/admin/banks-table.tsx`
- 🔴 Add CRUD operations (create, edit, delete banks)
- 🔴 Add logo URL upload
- 🔴 Add brand color picker
- 🔴 Show usage stats (how many cards per bank)
- 🔴 Create `app/api/admin/banks/route.ts` (GET, POST)
- 🔴 Create `app/api/admin/banks/[id]/route.ts` (PATCH, DELETE)

### 13.5 Admin Dashboard

- 🔴 Create `/admin` page with overview
- 🔴 Show total users, users by plan, total statements uploaded, failed jobs count
- 🔴 Add quick links to user management, system health, banks

---

## Phase 14: Landing Page & Public Routes

### 14.1 Landing Page

- 🟢 Create `/` page (Hero, Value Proposition, Features, Pricing, CTA, Footer)
- 🟢 Create `components/landing/hero.tsx`
- 🟢 Create `components/landing/features.tsx`
- 🟢 Create `components/landing/pricing.tsx` (show Free/Plus/Pro plans)
- 🟢 Create `components/landing/cta.tsx` ("Join Waiting List" CTA)
- 🟢 Create `components/landing/footer.tsx` (links, social, copyright)
- 🟢 Add responsive design (mobile-first)
- 🟢 Add micro-animations (scroll reveals, hover effects)

### 14.2 Public Navigation

- 🟢 Create `components/landing/navbar.tsx` (with language toggle, theme toggle, brand)
- 🔴 Create `components/nav/auth-nav.tsx` (Dashboard, Logout, User menu)
- 🟢 Fix landing navbar mobile overflow by adding responsive mobile menu (Sheet) and hiding desktop actions under md
- 🔴 Change mobile menu isotype to white variant (use white asset in dark theme or ensure contrast in mobile sheet)

---

## Phase 15: Rate Limiting & Security

### 15.1 Rate Limiting

- 🔴 Create `lib/rate-limit.ts` with rate limiting utilities
- 🔴 Implement upload rate limit (10 uploads/minute per user)
- 🔴 Implement API rate limit (100 requests/minute per user)
- 🔴 Add rate limit middleware to API routes
- 🔴 Return 429 status with retry-after header

### 15.2 Security Headers & CSP

- 🔴 Add Content Security Policy headers in `next.config.js`
- 🔴 Restrict inline scripts
- 🔴 Allow only trusted domains (Supabase, OpenAI, exchange rate API)
- 🔴 Add CORS configuration (same-origin only for v1)
- 🔴 Add HTTPS enforcement (Vercel handles this)

### 15.3 Input Validation & Sanitization

- 🔴 Ensure all API routes use Zod validation
- 🔴 Sanitize user inputs (strip HTML, prevent XSS)
- 🔴 Use parameterized queries (Supabase client handles this)
- 🔴 Add CSRF protection (Next.js handles this)

---

## Phase 16: Monitoring, Logging & Error Tracking

### 16.1 Logging Infrastructure

- 🟢 Create `lib/logger.ts` with structured logging (JSON format)
- 🟢 Add log levels: info, warn, error
- 🟢 Replace all `console.log` with structured logger
- 🟢 Add context to logs (user_id, request_id, etc.)

### 16.2 Error Tracking

- 🔴 Set up Vercel Analytics
- 🔴 Optional: Set up Sentry for production error tracking
- 🔴 Create error boundary components
- 🔴 Add global error handler
- 🔴 Track statement upload success/failure rates

### 16.3 Metrics & Monitoring

- 🔴 Track user signup events
- 🔴 Track statement uploads (success/failure)
- 🔴 Track AI extraction latency
- 🔴 Track API response times
- 🔴 Create `/admin/metrics` page with charts (optional)

---

## Phase 17: Testing

### 17.1 Unit Tests

- 🔴 Set up Vitest
- 🔴 Write tests for `lib/categorization.ts`
- 🔴 Write tests for `lib/plan.ts`
- 🔴 Write tests for `lib/currency.ts`
- 🔴 Write tests for `lib/budgets.ts`
- 🔴 Write tests for `lib/analytics.ts`
- 🔴 Write tests for `lib/alerts.ts`
- 🔴 Write tests for all validators in `lib/validators/`
- 🔴 Aim for >80% coverage on business logic

### 17.2 Integration Tests

- 🔴 Set up integration test environment
- 🔴 Write tests for Cards API (CRUD, plan limits)
- 🔴 Write tests for Transactions API (CRUD, filters)
- 🔴 Write tests for Statements API (upload, extract, retry, plan limits)
- 🔴 Write tests for Categories API (CRUD, plan limits)
- 🔴 Write tests for Keywords API (CRUD, bulk operations)
- 🔴 Write tests for Budgets API (CRUD, progress calculation)
- 🔴 Write tests for Alerts API (CRUD, trigger evaluation)
- 🔴 Write tests for Analytics API (all charts, currency conversion)

### 17.3 E2E Tests (Planned)

- 🔴 Set up Playwright
- 🔴 Test: User registration → email verification → login → dashboard
- 🔴 Test: Upload statement → extract → view transactions
- 🔴 Test: Create budget → add transaction → see progress update
- 🔴 Test: Toggle currency in analytics → see converted values
- 🔴 Test: Create alert → trigger alert → see notification
- 🔴 Test: Reach plan limit → see upgrade CTA

---

## Phase 18: Documentation & Changelog

### 18.1 Documentation

- 🔴 Create `CHANGELOG.md` with version history
- 🔴 Create `README.md` with project overview, setup instructions
- 🔴 Document environment variables in `.env.local.example`
- 🔴 Document database migrations and seeds
- 🔴 Document API endpoints (consider Swagger/OpenAPI spec)

### 18.2 Code Comments

- 🔴 Add JSDoc comments to key functions
- 🔴 Document complex business logic
- 🔴 Add inline comments for non-obvious code

---

## Phase 19: Performance Optimization

### 19.1 Query Optimization

- 🔴 Add database indexes (see Phase 1.3)
- 🔴 Optimize N+1 queries (use joins, eager loading)
- 🔴 Add pagination to large lists (transactions, statements)
- 🔴 Cache exchange rates (1-hour TTL)

### 19.2 Frontend Optimization

- 🔴 Add React.memo to expensive components
- 🔴 Use React Server Components where possible
- 🔴 Lazy load charts and heavy components
- 🔴 Optimize images (use Next.js Image component)
- 🔴 Minimize bundle size (check with `next build --analyze`)

### 19.3 Caching

- 🔴 Add HTTP caching headers to static assets
- 🔴 Cache API responses (React Query / SWR)
- 🔴 Cache exchange rates in memory or Redis

---

## Phase 20: Deployment & DevOps

### 20.1 Vercel Setup

- 🔴 Connect repository to Vercel
- 🔴 Configure environment variables in Vercel dashboard
- 🔴 Set up production domain (personal-cfo.io)
- 🔴 Set up preview deployments for PRs
- 🔴 Configure build settings (Node version, build command)

### 20.2 Database Setup (Production)

- 🔴 Run migrations on production Supabase project
- 🔴 Run seeds on production
- 🔴 Set up automated database backups
- 🔴 Configure connection pooling (if needed)

### 20.3 Background Jobs (Production)

- 🔴 Deploy Celery workers (if using Celery)
- 🔴 Configure Redis for production (if using Celery)
- 🔴 Set up job monitoring and alerting
- 🔴 Configure retry policies and DLQ (dead letter queue)

### 20.4 CI/CD

- 🔴 Set up GitHub Actions for linting
- 🔴 Set up GitHub Actions for tests
- 🔴 Set up GitHub Actions for build checks
- 🔴 Require passing checks before merge

---

## Phase 21: Post-Launch Monitoring & Iteration

### 21.1 Launch Checklist

- 🔴 Verify all environment variables set
- 🔴 Test critical flows end-to-end in production
- 🔴 Verify email verification works
- 🔴 Verify statement upload → extraction flow
- 🔴 Verify analytics charts render correctly
- 🔴 Verify alerts trigger correctly
- 🔴 Verify plan limits enforced
- 🔴 Verify admin panel accessible to admins only

### 21.2 Post-Launch Monitoring

- 🔴 Monitor error rates (Sentry/Vercel Analytics)
- 🔴 Monitor statement upload success rates
- 🔴 Monitor AI extraction latency
- 🔴 Monitor user signups and activation rates
- 🔴 Collect user feedback

### 21.3 Bug Fixes & Iterations

- 🔴 Triage and fix critical bugs
- 🔴 Address user feedback
- 🔴 Optimize performance bottlenecks
- 🔴 Iterate on UX based on user behavior

---

## Phase 22: Future Features (Post-v1)

### 22.1 Stripe Integration

- ⏸️ Set up Stripe account (waiting for approval)
- ⏸️ Create Stripe products and prices
- ⏸️ Implement checkout flow
- ⏸️ Implement subscription management (upgrade/downgrade/cancel)
- ⏸️ Add webhook handlers for subscription events
- ⏸️ Add billing page in Settings

### 22.2 Email Notifications (v2)

- ⏸️ Set up email service (SendGrid, Resend, etc.)
- ⏸️ Create email templates
- ⏸️ Send alert notifications via email
- ⏸️ Send weekly/monthly summaries via email
- ⏸️ Add email preferences in Settings

### 22.3 Mobile App (Future)

- ⏸️ Research React Native vs Flutter
- ⏸️ Design mobile-first UX
- ⏸️ Implement mobile app
- ⏸️ Update CORS policy for mobile API access

### 22.4 Additional Features

- ⏸️ Recurring transactions detection
- ⏸️ Export analytics as CSV/PNG
- ⏸️ Savings goals module
- ⏸️ Income tracking and forecasting
- ⏸️ Multi-user accounts (family plans)
- ⏸️ Integration with bank APIs (Plaid, etc.)
- ⏸️ AI-powered spending insights
- ⏸️ Tax reporting module

---

## Maintenance Tasks

### Ongoing

- 🔴 Update dependencies monthly (`pnpm update`)
- 🔴 Review and address security vulnerabilities
- 🔴 Monitor database performance and optimize queries
- 🔴 Review and update RLS policies as needed
- 🔴 Keep TODO.md and CHANGELOG.md up to date
- 🔴 Keep AGENTS.md synchronized with instruction changes

---

## Notes

- Always ask for permission before committing
- Update this file as tasks are completed
- Mark completed tasks with 🟢
- Mark in-progress tasks with 🟡
- Mark blocked tasks with ⏸️
- Keep task descriptions detailed enough to resume work anytime
- Reference this file when planning sprints or checking progress

---

## Delta – 2025-10-23

- 🟢 Chore(instructions): Added Golden Rules enforcing UI consistency
  - Items-per-page control must live inside the table Card next to the pager
  - Inputs must have visible labels (desktop) or accessible labels (mobile)
  - References are guides only; follow our design tokens and patterns
- 🟢 Feat(statements): Align Statements UI with Transactions patterns
  - Wrapped list inside Card with header and content
  - Moved “Items per page” into Card header section (next to pager)
  - Added labels for Status, Card, and Search inputs
  - Updated i18n (en/es) with `statements.itemsPerPage`
- 🟢 UX(tables): Added explicit loading states for Transactions and Statements tables
  - Show spinner row with localized “Loading…” while fetching
  - Mark tables `aria-busy` during loading for a11y
  - Avoid showing empty state while loading
- 🟢 UX(skeletons): Upgraded loading UI to Skeletons across app
  - Added shared `components/ui/skeleton.tsx`
  - Transactions/Statements now render skeleton rows instead of plain spinner text
  - Cards list and dashboard widgets (alerts, budgets, cards, expenses, recent txs, recurring) show polished skeletons
  - Added `aria-busy` on loading Cards and dashboard Cards
