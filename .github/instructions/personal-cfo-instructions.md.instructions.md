---
applyTo: "**"
---

# Personal CFO – Development Instructions

These instructions are always loaded and must be followed:

- `.github/instructions/personal-cfo-instructions.md.instructions.md` (this file)
- `.github/

## Modules & UX Contract

### 0) Dashboard

- Welcome header with user's name
- Cards summary, Budgets snapshot, Monthly expenses summary, Recurrent services summary, Recent transactions (last 5–10)

### 1) Cardsons/AGENTS.md` (additional blueprint and design rules kept in lockstep with this file)

**Simplicity, speed, premium feel.**

- Clean layouts, subtle shadows, micro-animations
- Benefit-driven copy (clear > clever)
- Every screen answers: "What can I do here?"
- Landing includes Pricing and CTA before footer
- Shipping mindset: MVP first, iterate fast, keep type-safety high

## Monitoring & Logging

- **Error Tracking:** Vercel Analytics + Sentry (optional for production)
- **Logs:** Structured JSON logs with levels (info, warn, error)
- **Metrics:** Track statement upload success/failure rates, AI extraction latency, user signup/login events
- **No console.log in production:** Use `lib/logger.ts` for structured logging

## Security & Compliance

- **HTTPS only** (enforced via Vercel)
- **Content Security Policy (CSP):** Restrict inline scripts, allow only trusted domains
- **CORS:** API routes allow same-origin only; adjust for mobile app later
- **SQL Injection Prevention:** Use parameterized queries only (Supabase handles this)
- **Rate Limiting:** Max 10 uploads/minute per user, max 100 API requests/minute per user (configurable via middleware)
- **Input Validation:** Zod schemas on all API inputs
- **RLS Everywhere:** No user data accessible without proper `user_id` policy
- **No PDF Storage:** PDFs deleted immediately after processing to avoid storing sensitive financial data
- **Password Reset:** Admins can reset to default `PersonalCFO2025!`, users can change via Settings

## Testing & Test Files

- **Test PDF Files:** `test-files/EECC_VISA.PDF` is provided for testing statement upload and extraction
- **CRITICAL:** Any temporary test files created during development (e.g., `test-*.mjs`, `test-*.ts`, `test-*.pdf`) MUST be deleted immediately after testing
- **Never commit test files** (except those in `test-files/` directory which are intentional fixtures)
- Use `test-files/` directory for permanent test fixtures only
- Clean up after yourself: remove any temporary scripts, logs, or debug files before committing

## API Versioning

- **v1 Routes:** All current routes are implicitly v1
- **Future Versions:** Prefix with `/api/v2/*` when breaking changes needed
- Keep v1 stable; add new fields/endpoints to v2 as neededor failed statements (max 2 retries total)
- **Plan checks:** enforce monthly limit on `free` (2/month); unlimited on plus/pro/admin
- **Rate limiting:** Max 10 uploads per minute per user (configurable)

**AI Extraction & OCR Edge Cases**

- Detect encrypted/locked PDFs → `status='failed'`, `failure_reason='encrypted'`; show guidance and "retry with external script" path when you provide it.
- Detect text prefix artifacts → strip/sanitize before parsing.
- Low-confidence/empty extraction → `status='failed'` with reason; metadata remains for re-try via retry button.
- **PDFs are NOT stored:** Files processed in memory/temp during extraction, then immediately deleted. Only metadata (file name, upload date, status, failure reason) persists in `statements` table.)
- `.github/instructions/AGENTS.md` (additional blueprint and design rules kept in lockstep with this file)

## Product Snapshot

**Name:** Personal CFO
**Domain:** personal-cfo.io
**Tagline:** Track your money. See patterns. Act smarter.

Personal CFO helps users improve personal finances. Users upload **PDF bank statements**, the system extracts transactions (AI), categorizes via **user-defined keyword rules**, and surfaces **budgets and analytics**. Email verification is handled by **Supabase**.

**CRITICAL SECURITY NOTE:** PDFs are **NOT stored permanently**. Files are processed in memory/temp storage during extraction, then immediately deleted. Only metadata (file name, upload date, status) is persisted in the `statements` table to avoid handling sensitive user financial documents.

## Architecture Overview

**Stack:** Next.js 15 (App Router) + Tailwind + shadcn/ui + Supabase (Postgres + Auth + Storage) + Celery & Redis (async jobs; a Supabase-native queue alternative is acceptable)

- **Frontend:** Next.js App Router (client components under `app/`) + Tailwind + shadcn/ui (Radix primitives)
- **UI Components:** Only from `@/components/ui/*` (tokenized; CSS variables)
- **Backend:** Next.js Route Handlers (`app/api/*`), Edge where appropriate (public resources), background jobs via **Celery** (PDF parsing, AI extraction, re-categorization)
- **Database:** Supabase Postgres with **Row Level Security** on every user table
- **Auth:** Supabase Auth (email/password + magic links) with **email verification enabled**
- **Storage:** Supabase Storage for statement PDFs
- **Queue:** Redis (broker/result backend) for Celery workers (or Supabase-native queue)
- **i18n:** en/es; toggle in Settings; strings come from dictionaries (no hardcoded UI text)
- **Currencies:** ISO-4217 support (min: PEN, USD, EUR) with amounts stored as integer minor units (`amount_cents`) + `currency`

## Plans, Pricing & Entitlements (v1, USD)

**Plan types (enum):** `free`, `plus`, `pro`, `admin`
**Billing (monthly, USD):** Free $0.00, Plus $19.99, Pro $49.99. Admin is internal and not billable.

**IMPORTANT:** Stripe integration is planned but account is pending approval. For v1, implement a **"Join Waiting List"** flow that creates a free account. Payment and plan upgrades will be enabled later.

**Entitlements Matrix**

- **free**

  - Cards: 1
  - Statements per month: 2
  - Categories: 6 preset (first 6 are system-created and cannot be deleted; user cannot add more)
  - Budgets: 2
  - Keyword categorization: enabled

- **plus**

  - Cards: 5
  - Statements per month: unlimited
  - Categories: up to 25 custom (first 6 system categories + up to 19 user-created)
  - Budgets: 10
  - Keyword categorization: enabled

- **pro**

  - Cards: unlimited
  - Statements per month: unlimited
  - Categories: unlimited (first 6 system categories + unlimited user-created)
  - Budgets: 15
  - Keyword categorization: enabled

- **admin**

  - Cards/statements/categories/budgets: unlimited
  - Access to **Admin Panel**
  - Can reset user passwords (to default), deactivate/activate accounts, view system health and job queues

**Enforcement**

- Entitlements are enforced in **server** code (never trust client) via `lib/plan.ts` helpers invoked inside API route handlers prior to writes.
- Monthly statement usage for `free` is tracked with a `statements_monthly_usage` materialized view or a `COUNT(*)` query scoped to current calendar month; deny with 402-style app error.
- Category counts and budgets counts enforced by totals per user.
- **Plan downgrades:** When downgrading (e.g., Pro → Plus or Free), user-created categories beyond the limit are **deactivated** (marked `status='inactive'`). The first 6 system categories remain untouched and active. No grace periods.
- RLS still applies; these checks are **in addition** to RLS.

## Core Entities

### User

- `id` (UUID, PK)
- `email` (unique)
- `created_at`
- `plan` (enum: "free", "plus", "pro", "admin")
- `plan_start_date`
- `timezone` (string, default: "America/Lima" for Peru UTC-5, user-configurable in Settings)
- `primary_currency` (string, default: "PEN" for Peruvian Soles)

### Bank

- `id` (UUID, PK)
- `name` (string)
- `logo_url` (optional)
- `brand_color` (optional, hex)
- **Pre-seeded banks:** BCP, Interbank, BBVA, Scotiabank, Diners Club, Mibanco, Caja Piura, Caja Arequipa, Caja Huancayo, Banco Pichincha, and "Other" for custom entries

## Key Data Flow (Happy Paths)

1. **User uploads statement (PDF)** → `/dashboard` → **Statements** → `POST /api/statements`
   File uploaded to temp storage (processed in memory) → create `statements(status='processing')` → enqueue background job → **PDF deleted immediately after extraction** → only metadata persists.

2. **Background AI extraction** (async job)
   Fetch PDF from temp → robust extraction (handles locked PDFs, MIME validation, text prefix stripping) → **ASK DIEGO FOR PROMPT** → parse transactions → categorize via keywords/excluded keywords (first match wins; excluded keywords mark as Uncategorized) → bulk insert into `transactions` with `statement_id` → mark `status='completed'` or `status='failed'` with `failure_reason`. **Max 2 retries** via retry button in UI.

3. **Transactions available**
   User sees Transactions table with filters/sorting; can add/edit/delete manually.
   Manual transactions have `statement_id = NULL`.
   Deleting a **statement** cascades: deletes its transactions.
   Editing transactions is allowed post-creation (no audit trail in v1).

4. **Budgets & Analytics**

   - **Budgets:** current **calendar month** progress bars; resets on 1st of each month.
   - **Analytics:** 3 charts (6-month fixed window, non-exportable in v1) with **currency toggle** (PEN/USD/EUR minimum). Exchange rates: Primary https://v6.exchangerate-api.com/v6/${NEXT_PUBLIC_EXCHANGERATE_API_KEY}/latest/PEN with fallback https://api.exchangerate.fun/latest?base=PEN. Implement retry/fallback logic and short-term caching (e.g., 1-hour TTL) in `lib/currency.ts`.

5. **Keywords & Categories**
   Users maintain categories, keywords (bulk CRUD), and excluded keywords.
   If a transaction matches both a category keyword AND an excluded keyword, it's marked as **Uncategorized**.

## Next.js 15 Dynamic Routes

Use **async params** only:

```
// ✅ Next.js 15
export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params
  return new Response(JSON.stringify({ ok: true }))
}
```

Examples: `app/api/transactions/[id]/route.ts`, `app/api/statements/[id]/route.ts`.

## Client Components & Hooks

Any page using `useAuth`, `useState`, `useRouter`, or domain hooks must be a **client component**:

```
"use client"
import { useAuth } from "@/hooks/use-auth"
import { useTransactions } from "@/hooks/use-transactions"
```

Key pages:
`app/(main)/dashboard/page.tsx`, `app/(main)/transactions/page.tsx`, `app/(main)/statements/page.tsx`, `app/(main)/budgets/page.tsx`, `app/(main)/analytics/page.tsx`, `app/(main)/settings/*`, `app/(main)/admin/*`.

## Supabase Client Usage

- **Browser:** `lib/supabase-browser.ts` → uses `process.env["NEXT_PUBLIC_SUPABASE_URL"]` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Server/API:** `lib/supabase.ts` → uses `SUPABASE_SERVICE_ROLE_KEY` for privileged ops (never ship to browser)
- **Never** import `lib/env.ts` in browser code

## Authentication, Email Verification & Route Protection

1. Supabase **email verification required** (sign-in flows enforce verified email before granting access).
2. `middleware.ts` protects `/dashboard`, `/transactions`, `/statements`, `/analytics`, `/budgets`, `/settings`, `/admin`.
3. Unauthed → redirect to `/login?redirect=<path>`.
4. `useAuth` manages session client-side.
5. API routes require `requireAuth()` from `lib/auth.ts` (server validation + RLS alignment).

## Modules & UX Contract

### 0) Dashboard

- Welcome header with user’s name
- Cards summary, **Alerts** summary, Budgets snapshot, Monthly expenses summary, Recurrent services summary, Recent transactions (last 5–10)

### 1) Cards

- List user cards (table or grid)
- Create/edit/delete card
  Fields: `name`, `bank_id` (preseeded banks dropdown), `due_date` (optional)
- **Plan checks:** creating beyond entitlement returns app error with upgrade CTA

### 2) Transactions

- Table columns: Description (description + merchant), Transaction date, Category, Card, Currency, Amount
- Filters: from date, to date, category, card, currency
- Sorting on all sortable columns
- Bulk select + delete
- Manual add fields: type (income/expense), merchant, amount, currency, category, transaction_date, card, description
- Re-categorize one/many (same engine as statements)

### 3) Statements

- Table: file name, card, status (completed | failed | processing), upload date, file type
- Upload PDF linked to a card
- Re-categorize one/many statements
- Delete one/many statements → cascade delete their transactions
- **Plan checks:** enforce monthly limit on `free`; unlimited on paid/admin

**AI Extraction & OCR Edge Cases**

- Detect encrypted/locked PDFs → `status='failed'`, `failure_reason='encrypted'`; show guidance and “retry with external script” path when you provide it.
- Detect text prefix artifacts → strip/sanitize before parsing.
- Low-confidence/empty extraction → `status='failed'` with reason; file remains for re-try.

### 4) Analytics

**Purpose:** Answer "Where did my money go?" and enable data-driven spending decisions.

**Features (4 interactive tiles):**

**A) Spending by Category (Last 30/90 days)**

- **UI:** Card with donut chart + legend table (Category • Amount • % of total • Δ vs previous period)
- **Header:** Date Range, Account filter, Currency toggle (PEN/USD/EUR minimum)
- **Colors:** Use category brand colors from design tokens (consistent across app)
- **Interactions:**
  - Hover slice → Tooltip (🍔 Food — S/ 1,240 • 24% • +12%); slice expands with a11y focus ring
  - Click slice/legend → Cross-filter page to category (removable chip in header)
  - Legend toggle → Hide/show category (recalculate % for visible set)
  - Keyboard → Arrow keys cycle; Enter locks filter; Esc clears
- **Empty states:** No transactions → CTA to upload; Single category → meter + info banner
- **API:** `GET /api/analytics/spend-by-category?from&to&account&currency` → `[{ categoryId, name, color, amount, pct, deltaPctPrev, txCount }]`
- **Performance:** Pre-aggregate `SUM(amount)` by `category_id`; p95 < 150ms for ≤100k tx

**B) Spending Over Time**

- **UI:** Card with line chart (toggle Weekly/Monthly/Quarterly) + optional 3-month moving average overlay
- **Summary chips:** Current period total, Δ vs previous, Top category
- **Interactions:**
  - Hover point → Tooltip (Aug 2025 — S/ 3,420 • Top: Food • 112 tx)
  - Click point → Cross-filter to that period
  - Brush selection (drag) → Set custom date range
  - Double-click → Reset zoom
- **Empty states:** <10 transactions → Suggest 90 days for clearer trend
- **API:** `GET /api/analytics/spend-over-time?granularity=month|week&from&to&account&currency` → `[{ period, amount, txCount, topCategory: { id, name, amount } }]`
- **Timezone:** Respect `profile.timezone`; store UTC, render local; gaps render as zero (don't interpolate)

**C) Income vs Expenses**

- **UI:** Card with stacked bar chart (Income top, Expenses below baseline) + Net line overlay
- **View toggles:** Periodicity (Week/Month), "Absolute" vs "Normalized per day"
- **Interactions:**
  - Hover bar → Tooltip (Aug 2025 — Income S/ 2,200 • Expenses S/ 1,860 • Net +S/ 340)
  - Click bar → Cross-filter to that period
  - Shift+Click → Detail drawer (top income sources, top expense categories, last 10 transactions)
  - Toggle "Show Categories" → Convert expense segment to stacked sub-bars (top 3 + "Other")
- **Classification:** Income (amount > 0 or category family "Income"); Expense (all others); normalize sign to positive magnitudes
- **API:** `GET /api/analytics/income-vs-expenses?granularity=month|week&from&to&account&currency` → `[{ period, income, expenses, net }]`
- **Edge cases:** Refunds → Annotate tooltip; Mixed currencies → Convert using daily FX at tx date (cache)

**D) Net Cashflow (KPI + Sparkline)**

- **UI:** Large KPI number (Net Cashflow) + delta pill + 7-30 day sparkline beneath
- **Display:** Net +S/ X,XXX; Delta +/-% vs previous (green/red); Secondary stats (Income/Expenses)
- **Interactions:**
  - Hover sparkline point → Tooltip (2025-08-12 — Net +S/ 180 • Top tx: Salary)
  - Click point → Filter to that day/week
  - Click KPI → Toggle This ↔ Previous period (animate roll-up)
  - 2+ consecutive negative months → CTA "See drivers →" (side panel with top 3 categories/merchants, budget links)
- **API:** `GET /api/analytics/net-cashflow?from&to&account&currency` → `{ net, income, expenses, deltaPctPrev, sparkline: [{ date, net }] }`
- **Bins:** <7 days → daily sparkline; otherwise weekly

**Global Behaviors (all tiles):**

- **Cross-filtering:** Any click updates all tiles + URL (`?from&to&category&period`) within ~150ms (debounced)
- **Persistent filters:** State restored on refresh; shareable link
- **Currency:** Use `lib/currency.ts` with hourly FX cache; convert to `primary_currency`
- **i18n:** Locale-aware dates/numbers; show currency code in tooltips
- **Loading:** Skeleton loaders (aria-busy on cards)
- **Empty states:** No data → CTAs with guidance
- **Errors:** Non-blocking toasts; card-level retry button
- **A11y:** Tabbable elements; tooltips mirrored to `aria-live="polite"`; screen reader tables for charts
- **Performance:** Pre-aggregate queries with indexes; p95 < 150ms for ≤100k transactions

**Exchange rates:**

- Primary: `https://v6.exchangerate-api.com/v6/${NEXT_PUBLIC_EXCHANGERATE_API_KEY}/latest/PEN`
- Fallback: `https://api.exchangerate.fun/latest?base=PEN`
- Implement retry/fallback and cache (1-hour TTL) in `lib/currency.ts`

**No export in v1** (CSV/PNG planned for later).

### 5) Budgets

- Card list (not table); each shows **current-month utilization** (progress bar / %), category, allocated amount, spent, remaining
- **Plan checks:** enforce max budgets per plan

### 6) Settings (tabs)

- Appearance: card color style (default palette vs bank colors)
- Categories: table (category, emoji, status, created at, actions); CRUD

  - **free**: 6 preset categories (system-created, cannot be deleted, cannot add more)
  - **plus/pro/admin**: 6 preset system categories (cannot be deleted) + custom categories up to plan limit (or unlimited)
  - On plan downgrade: user-created categories beyond new limit are set to `status='inactive'`; system categories remain active

- Keywords: select a category → table; bulk add (comma-separated), edit, delete; search
- Excluded keywords: list with add, bulk add, bulk delete
- Profile: name, last name, reset password, **timezone selector** (default: America/Lima UTC-5)
- i18n: language toggle (en/es), persisted per user in `profiles.locale`
- **Translations:** All UI strings from `locales/en.json` and `locales/es.json`; error messages also translated
- **Number formatting:** Always use `1,000.00` format (locale-aware thousands separator with 2 decimals)

### 7) Admin Panel (admins only)

- **User Management:**
  - View all users (table with email, plan, created_at, status)
  - Reset user password to default (`PersonalCFO2025!`)
  - Deactivate/activate user accounts
- **System Health:**
  - View job queue status (pending, processing, completed, failed counts)
  - Retry failed statement extraction jobs (shows job details: statement_id, user, failure reason, retry count)
- **Banks Management:**
  - CRUD banks (name, logo_url, brand_color)
  - View usage stats per bank
- **Chat Analytics:**
  - View total queries this month, total tokens consumed, estimated cost
  - Show queries by plan tier (Plus vs Pro vs Admin)
  - Show average tokens per query, top users by query count
  - Alert if monthly cost exceeds $100 threshold
- No user impersonation in v1

### 8) "Ask Your Finances" Chat

**Purpose:** Let users query and act on their own financial data through natural language — a true financial co-pilot.

**Access Control:**

- **Free plan:** No access (show upgrade CTA when clicking bubble)
- **Plus plan:** 50 queries/month (~$0.25/user/month cost to us)
- **Pro plan:** 200 queries/month (~$1.00/user/month cost to us)
- **Admin plan:** Unlimited queries
- **Rate limit:** 10 queries per hour per user (prevent abuse)

**UI Design:**

- **Placement:** Floating chat bubble (bottom-right, z-50, accessible from all authenticated pages)
- **Bubble:** Circular button with CFO icon + notification badge (shows unread count if applicable)
- **Drawer:** Slide-up drawer on bubble click (full-screen on mobile, 400px width on desktop)
- **Messages:** Two-column message list:
  - **User messages:** Right-aligned, primary color background, white text
  - **AI messages:** Left-aligned, muted background, with CFO icon avatar
- **Input:** Textarea with send button; Enter to submit, Shift+Enter for newline
- **Usage Indicator:** Show remaining queries: "12/50 queries left this month" (in drawer header)
- **Empty State:** "Ask me about your finances!" with example queries:
  - "How much did I spend on food last month?"
  - "What's my biggest expense category this quarter?"
  - "Am I on track with my budgets?"
  - "Show me my income vs expenses for the last 3 months"

**Interactions:**

- **Keyboard shortcuts:** Cmd+K (Mac) / Ctrl+K (Win) to open, Esc to close
- **Auto-scroll:** Scroll to latest message on new messages
- **Copy response:** Copy-to-clipboard button on AI messages
- **Loading state:** Typing indicator (3 animated dots) while AI responds
- **Session-only history:** Messages cleared on page reload (not persisted in database)
- **Mobile responsive:** Full-screen drawer on mobile, partial drawer on desktop

**AI Model & Configuration:**

- **Model:** GPT-4o-mini (cost-efficient: ~$0.0015 input / $0.006 output per 1K tokens)
- **Max tokens:** 500 for response (control costs)
- **Temperature:** 0.3 (more deterministic for financial data)
- **Context window:** Last 6 months of transactions (limit 1000, ~2,000-3,000 tokens)
- **System prompt:** (defined in `lib/ai/chat-prompt.ts`)
  - "You are a financial assistant for Personal CFO. Only answer questions about the user's financial data."
  - "Decline requests to perform external actions, generate code, or discuss unrelated topics."
  - "Be concise, friendly, and data-driven. Use currency symbols and formatting."
  - "If you don't have enough data to answer, say so and suggest what data the user might need."
  - "Keep responses under 500 tokens. Use simple tables for data (markdown format)."
  - "Always use the user's primary currency for amounts unless asked otherwise."

**Context Builder:**

- Fetch user's last 6 months of transactions (optimized query, limit 1000)
- Include: Categories with spend totals, income vs expenses summary, top merchants, budget progress
- Format as structured JSON for context window (~2,000-3,000 tokens)
- Include user's timezone and primary_currency for correct date/currency formatting
- Aggregate data server-side to minimize token usage:
  - Total spend by category (top 10)
  - Monthly spend trend (last 6 months)
  - Income vs expenses (last 6 months)
  - Budget status (active budgets with progress %)
  - Top 10 merchants by spend

**Security & Input Sanitization:**

- **Input validation:**
  - Max query length: 500 characters
  - Strip HTML/script tags (XSS prevention)
  - Block SQL injection patterns (e.g., `DROP`, `DELETE`, `--`, `/*`)
  - Validate UTF-8 encoding
  - Sanitize before sending to OpenAI
- **Output validation:**
  - Ensure AI response contains no executable code
  - Filter out any user instructions in response
  - Limit response length to 1000 characters (truncate if exceeded)
  - Escape HTML in responses before rendering
- **Safety prompt:**
  - Enforce "read-only" mode: AI cannot create budgets, add transactions, or modify data
  - Decline requests for external actions (e.g., "Send email", "Call my bank")
  - Decline requests unrelated to finances (e.g., "Write me a poem", "What's the weather?")

**Rate Limiting & Plan Enforcement:**

- **Hourly rate limit:** 10 queries/hour per user (tracked in-memory or Redis)
- **Monthly plan limits:**
  - Plus: 50 queries/month
  - Pro: 200 queries/month
  - Admin: unlimited
- **Enforcement:**
  - Check limits in `POST /api/chat` handler before calling OpenAI
  - Return 429 status with `retry-after` header when hourly limit exceeded
  - Return 402 status with upgrade CTA when monthly plan limit exceeded
  - Track usage in `chat_usage` table (user_id, query, response, tokens_used, created_at)
- **Usage tracking:**
  - Log every query with user_id, tokens_used, response_time, created_at
  - Calculate monthly usage with `get_monthly_chat_usage(user_id)` function
  - Show remaining queries in drawer header: "12/50 queries left this month"

**Response Formatting:**

- **Text responses:** Plain text with markdown support (bold, lists, tables)
- **Simple tables:** Use markdown tables for data (max 5 rows, 3 columns):
  - Example: "Top 3 categories by spend:"
    | Category | Amount | % of Total |
    |----------|--------|------------|
    | Food | S/ 1,240 | 24% |
    | Housing | S/ 980 | 19% |
    | Transport| S/ 620 | 12% |
- **Numbers:** Format with currency symbol and thousands separator (e.g., "S/ 1,240.00")
- **Percentages:** Include trend indicators (e.g., "↑12% vs last month", "↓8% vs last month")
- **Insights:** Add context when helpful:
  - "You spent S/ 1,240 on food last month, which is ↑12% compared to September."
  - "Your biggest expense category is Housing at S/ 980 (19% of total spend)."
  - "You're on track with 2 of your 3 budgets. Food is at 85% with 5 days left."

**Error Handling:**

- **OpenAI API errors:**
  - Network errors → "I'm having trouble connecting right now. Please try again in a moment."
  - Rate limit errors → "Too many requests. Please wait before trying again."
  - Invalid response → "I couldn't process that. Try rephrasing your question."
- **Plan limit exceeded:**
  - Free users → "Chat is available on Plus and Pro plans. Upgrade to start chatting!"
  - Plus/Pro limit reached → "You've used all 50 queries this month. Upgrade to Pro for 200/month!"
- **Rate limit exceeded:**
  - "You've reached the hourly limit (10 queries). Please try again in [X] minutes."
- **Insufficient data:**
  - "I don't have enough data to answer that. Try uploading more statements or adding transactions manually."
- **Off-topic queries:**
  - "I can only help with your financial data. Try asking about spending, budgets, or income."

**Cost Estimates & Monitoring:**

- **Cost per query:** ~$0.002-$0.005 (GPT-4o-mini with 3,000-6,000 total tokens)
- **Monthly cost scenarios:**
  - Plus users (50 queries/month): ~$0.10-$0.25/user
  - Pro users (200 queries/month): ~$0.40-$1.00/user
  - Admin (unlimited, assume 500/month): ~$1.00-$2.50/admin
- **Admin monitoring:**
  - `/admin/chat-analytics` page shows:
    - Total queries this month
    - Total tokens consumed
    - Estimated cost (tokens × $0.0006 per 1K tokens)
    - Queries by plan tier
    - Average tokens per query
    - Top 10 users by query count
  - Alert admin if monthly cost exceeds $100
  - Alert admin if hourly rate limit violations spike

**API Routes:**

- `POST /api/chat` – Send query, get AI response
  - Request: `{ query: string }`
  - Response: `{ success: true, data: { response: string, tokensUsed: number, remainingQueries: number } }`
  - Errors: 429 (rate limit), 402 (plan limit), 400 (invalid input), 500 (AI error)
- `GET /api/chat/usage` – Get usage stats for current user
  - Response: `{ queriesThisMonth: number, limit: number, remaining: number, resetDate: string }`
- `DELETE /api/chat/history` – Clear session history (client-side only, no DB operation)

**Database Schema:**

- Table: `chat_usage`
  - `id` (UUID, PK)
  - `user_id` (UUID, FK to profiles, ON DELETE CASCADE)
  - `query` (TEXT, sanitized user input)
  - `response` (TEXT, AI response)
  - `tokens_used` (INTEGER, total tokens consumed)
  - `created_at` (TIMESTAMP WITH TIME ZONE)
  - Index on `(user_id, created_at)` for usage queries
- RLS policy: `auth.uid() = user_id`
- Function: `get_monthly_chat_usage(user_id)` returns count of queries in current calendar month

**i18n Translations:**

- Add to `locales/en.json` and `locales/es.json`:
  - `chat.bubble.label` – "Chat with CFO"
  - `chat.title` – "Ask Your Finances"
  - `chat.inputPlaceholder` – "Ask me about your finances..."
  - `chat.send` – "Send"
  - `chat.clear` – "Clear chat"
  - `chat.examples.food` – "How much did I spend on food last month?"
  - `chat.examples.biggest` – "What's my biggest expense category?"
  - `chat.examples.budgets` – "Am I on track with my budgets?"
  - `chat.examples.income` – "Show me income vs expenses"
  - `chat.errors.network` – "Connection error. Try again."
  - `chat.errors.rateLimit` – "Too many queries. Wait {minutes} minutes."
  - `chat.errors.planLimit` – "Monthly limit reached. Upgrade for more!"
  - `chat.errors.offTopic` – "I can only help with your finances."
  - `chat.empty.title` – "Ask me anything about your finances!"
  - `chat.empty.description` – "Try one of the examples below:"
  - `chat.usage.remaining` – "{count}/{limit} queries left this month"
  - `chat.usage.exceeded` – "You've used all {limit} queries"
  - `chat.upgrade.title` – "Chat is a Plus/Pro feature"
  - `chat.upgrade.description` – "Upgrade to unlock AI-powered financial insights"
  - `chat.upgrade.cta` – "Upgrade Now"

**Testing:**

- Unit tests: `lib/ai/chat-prompt.ts` safety checks
- Unit tests: `lib/ai/chat.ts` input sanitization (SQL injection, XSS prevention)
- Unit tests: `lib/ai/context-builder.ts` token count validation
- Integration tests: `POST /api/chat` (success, rate limit, plan limit, errors)
- Integration tests: Free user access (should show upgrade CTA)
- Integration tests: Token tracking (verify logged correctly in `chat_usage`)

**No Features for v1:**

- ❌ Response streaming (planned for v2)
- ❌ Chat history persistence across sessions (session-only for v1)
- ❌ Chat export (download conversation as PDF/text)
- ❌ Voice input (future enhancement)
- ❌ Multi-turn context (each query is independent; no conversation memory)
- ❌ Actionable responses (e.g., "Create a budget for food at S/ 1,500") – read-only only

## Data & RLS (Postgres snake_case)

Core tables:

- `users` (supabase auth user_id FK)
- `profiles` (user_id PK, name, last_name, is_admin boolean, locale string, timezone string, plan enum, primary_currency string)
- `plans` (code enum mirror, price_cents, currency, entitlements_json) — optional if you prefer static config
- `banks` (seeded; id, name, brand_color, logo_url)
- `cards` (id, user_id, bank_id, name, due_date, created_at)
- `statements` (id, user_id, card_id, file_name, status enum, uploaded_at, file_type string, failure_reason text, retry_count int default 0)
  - **Note:** No `file_path` column; PDFs are NOT stored permanently
- `transactions` (id, user_id, statement_id NULLABLE, card_id, description, merchant, transaction_date, category_id NULLABLE, currency, amount_cents, type enum, created_at, updated_at)
  - `statement_id` is NULL for manual transactions
  - Transactions can be edited post-creation (no audit trail in v1)
- `categories` (id, user_id, name, emoji, color, status enum 'active'|'inactive', created_at, is_preset boolean default false)
- `category_keywords` (id, user_id, category_id, keyword, created_at)
- `excluded_keywords` (id, user_id, keyword, created_at)
- `budgets` (id, user_id, category_id, amount_cents, currency, active boolean, created_at, period_start date, period_end date)
- `chat_usage` (id, user_id, query text, response text, tokens_used integer, created_at timestamp with time zone)
  - Tracks chat query usage for plan enforcement and cost monitoring
  - Index on `(user_id, created_at)` for efficient monthly usage queries

**RLS pattern:** each table with `user_id` → policy `auth.uid() = user_id`.
Admins: `profiles.is_admin = true` + plan `admin` for admin UI scope.

## Critical Patterns

### Validation with Zod

Validate inputs **before** DB ops:

- `lib/validators/cards.ts`
- `lib/validators/transactions.ts`
- `lib/validators/statements.ts`
- `lib/validators/categories.ts`
- `lib/validators/keywords.ts`
- `lib/validators/budgets.ts`

### Categorization Engine

`lib/categorization.ts`:

- Normalize text (strip prefixes/artifacts, lowercase, accent fold)
- Exclusion check → if matches, drop/flag
- Category match → first keyword hit wins (deterministic), tie-breakers supported
- Re-categorize supports single and bulk via job

### Async Jobs (Celery or Supabase Queue)

- Enqueue via `POST /api/jobs/*`; UI never talks to worker directly
- Idempotency keys for re-categorization and duplicate statement ingestion
- Retries with backoff for network/AI timeouts
- Tasks in `workers/` (separate service)

## Code Standards (Strict)

- **Files/folders:** kebab-case (e.g., `use-transactions.ts`)
- **Components:** PascalCase (`TransactionsTable`)
- **Functions/vars:** camelCase (`createBudget`)
- **DB:** snake_case (`user_id`)
- **TypeScript:** no `any` (`@typescript-eslint/no-explicit-any: error`); prefer `type` over empty interfaces; domain types in `types/*.ts`
- **React/JSX:** escape apostrophes (`You&apos;re`); no `console.log` (use structured error util); loading/empty/error states for all async UI
- **Styling:** shadcn/ui only; centralized theme with tokens via CSS variables (colors, spacing, typography, radii, shadows); tokens MUST match `ui-references` colors exactly; no hardcoded hex; use `cn()` for class merging; accessible contrast; mobile-first (test at 360px)
- **UX:** clear IA; helpful empty states; light/dark via tokens (no hardcoded hex)

## Theme & Tokens

- Create and maintain a centralized theme with design tokens defined as CSS variables (colors, spacing, typography, radii, shadows, elevations, states).
- Implement the theme in `components/theme-provider.tsx` and expose a `ThemeToggle` via `components/theme-toggle.tsx`.
- Map the color tokens to the palettes shown in `ui-references/` exactly; do not approximate.
- Use shadcn/ui components exclusively and wire tokens via CSS variables; avoid inline styles and hardcoded hex values.
- Ensure dark and light modes are both fully tokenized and visually match the `ui-references` images.

## Routing Map (App Router)

Public:

- `/` (Hero, Value proposition, Pricing, CTA, Footer)
- `/login`, `/register`

Authed:

- `/dashboard`
- `/cards`
- `/transactions`
- `/statements`
- `/analytics`
- `/budgets`
- `/settings` (appearance, categories, keywords, excluded, profile, i18n)
- `/admin` (admins only)

API (examples):

- Cards: `POST /api/cards`, `PATCH /api/cards/[id]`, `DELETE /api/cards/[id]`
- Transactions: `GET /api/transactions`, `POST /api/transactions`, `PATCH /api/transactions/[id]`, `DELETE /api/transactions` (bulk via ids)
- Statements: `POST /api/statements` (pre-signed upload), `PATCH /api/statements/[id]/recategorize`, `DELETE /api/statements` (bulk)
- Analytics: `GET /api/analytics/overview`, `GET /api/analytics/trends`
- Budgets: `GET/POST/PATCH /api/budgets*`
- Settings: `GET/POST /api/settings/categories*`, `GET/POST /api/settings/keywords*`, `GET/POST /api/settings/excluded*`
- Chat: `POST /api/chat`, `GET /api/chat/usage`, `DELETE /api/chat/history`

**API responses (consistent):**

```
{ "success": true, "data": { /* ... */ } }
{ "error": true, "message": "..." }
```

HTTP: 200/201, 400, 401, 404, 500.

## Key Files Reference

- `middleware.ts` – protects authed routes; enforces verified email
- `hooks/use-auth.ts` – session state
- `hooks/use-cards.ts`
- `hooks/use-transactions.ts`
- `hooks/use-statements.ts`
- `hooks/use-budgets.ts`
- `hooks/use-categories.ts`
- `hooks/use-keywords.ts`
- `hooks/use-excluded-keywords.ts`
- `hooks/use-chat.ts` – chat state management and data fetching
- `lib/plan.ts` – plan detection and entitlement checks (cards/statements/categories/budgets/chat)
- `lib/validators/*.ts`
- `lib/categorization.ts`
- `lib/currency.ts`
- `lib/ai/parse-statement.ts` – **calls OpenAI** (ASK DIEGO FOR PROMPT)
- `lib/ai/chat.ts` – OpenAI client for chat feature (GPT-4o-mini)
- `lib/ai/chat-prompt.ts` – system prompt and safety rules for chat
- `lib/ai/context-builder.ts` – builds user context (6 months transactions) for chat
- `lib/pdf/extract.ts` – robust extraction; handles locked/encrypted detection, prefix stripping
- `workers/tasks.py` – Celery tasks (extract, recategorize)
- `components/analytics/*`
- `components/chat/chat-bubble.tsx` – floating chat button
- `components/chat/chat-drawer.tsx` – slide-up chat drawer
- `components/chat/chat-messages.tsx` – message list (user vs AI styling)
- `components/chat/chat-input.tsx` – textarea with send button
- `components/chat/usage-indicator.tsx` – shows remaining queries
- `components/theme-toggle.tsx`, `components/theme-provider.tsx`

## Development Workflow

### Commands

```
pnpm dev              # Start dev server (localhost:3000)
pnpm build            # Production build (must pass before commit)
pnpm run lint         # ESLint (strict)
pnpm test             # Vitest unit tests
```

### Pre-Commit Checklist

1. `pnpm run lint` → 0 errors
2. `pnpm build` → compiles
3. No unused imports, TODOs, or console.logs
4. Follow commit message format: `type(scope): description`
   - **type:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
   - **scope:** module name (e.g., `landing`, `auth`, `cards`, `theme`, `i18n`)
   - **description:** concise summary (imperative mood, lowercase, no period)
   - Examples:
     - `feat(landing): add conversion-focused hero section`
     - `fix(theme): correct dark mode border colors`
     - `docs(readme): update setup instructions`
     - `refactor(cards): extract card form to separate component`

### Backlog & TODO Tracking

- `TODO.md` is the **single source of truth** for features/bugs/chores.
- `CHANGELOG.md` tracks released features per version (e.g., v1.0.0, v1.1.0)
- Update both files in the **same PR** that implements changes.
- Keep `AGENTS.md` synchronized with rule/design changes done here.

### Commit Approval Policy

- Do **not** commit immediately after code changes.
- Post a short report (what changed + lint/build/test status + brief diff notes).
- Wait for explicit **Diego approval** before committing.
- **Split large changes into multiple focused commits:**
  - If changes span multiple modules/features, create separate commits per module
  - Each commit should be atomic and deployable
  - Example: Instead of one large "feat: add landing page and theme", split into:
    - `feat(theme): add CSS variable tokens and theme provider`
    - `feat(landing): create hero section with CTAs`
    - `feat(landing): add features section with emoji icons`
    - `feat(landing): implement pricing cards`
- Use descriptive commit messages following the format above
- Reference TODO items when applicable

### Branching & PR Hygiene

- Branch names: `feature/*`, `fix/*`, `chore/*`
- PR must include: scope, screenshots for UI, verification checklist

## Database Migrations & Seeds

- All schema changes in `supabase/migrations/*.sql`
- **Never** modify production DB directly
- RLS enabled everywhere; owner checks via `user_id` and admin policies as needed
- Use **seed** scripts for banks and base categories

**Required Seeds (v1):**

- **Admin user:** create `admin@personal-cfo.io`, mark `profiles.is_admin = true` and `profiles.plan = 'admin'`.

- **Banks (pre-seeded for all users):**

  - BCP
  - Interbank
  - BBVA
  - Scotiabank
  - Diners Club
  - Mibanco
  - Caja Piura
  - Caja Arequipa
  - Caja Huancayo
  - Banco Pichincha
  - Other (custom)

- **Default categories for every new user (6 system categories):**

  1. Food (emoji: 🍔, color: orange, `is_preset = true`)
  2. Housing (emoji: 🏠, color: slate, `is_preset = true`)
  3. Transportation (emoji: 🚗, color: teal, `is_preset = true`)
  4. Income (emoji: 💵, color: indigo, `is_preset = true`)
  5. Entertainment (emoji: 🎮, color: purple, `is_preset = true`)
  6. Shopping (emoji: 🛒, color: blue, `is_preset = true`)

  - For **free** plan: these 6 are the ONLY categories allowed; user cannot add more.
  - For **plus/pro/admin**: these 6 cannot be deleted; users can add more up to plan limits (or unlimited).
  - System categories (`is_preset = true`) cannot be deleted or deactivated by plan downgrades.

- **Plans (if using table):** insert `free`, `plus`, `pro`, `admin` with USD pricing and entitlements JSON mirroring the matrix above.

## Testing Strategy

- **Unit:** `tests/unit/` – categorization engine, currency utils, validators, date math, `lib/plan.ts` checks
- **Integration:** `tests/integration/` – API routes (transactions CRUD; statements upload → extract → persist; plan limits)
- **E2E (planned):** Playwright – upload→extract→transactions; budget progress; analytics charts + currency toggle; plan upgrade CTAs when limits reached
- No inline tests; all in `/tests`

## Environment Variables (Local & Vercel)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
APP_URL=https://personal-cfo.io
NODE_ENV=

# Storage / Uploads
MAX_UPLOAD_MB=25

# OpenAI (statement parsing)
OPENAI_API_KEY=

# Jobs (Celery/Redis) – if using Celery
REDIS_URL=redis://...
CELERY_BROKER_URL=${REDIS_URL}
CELERY_RESULT_BACKEND=${REDIS_URL}

# i18n
DEFAULT_LOCALE=en

# Exchange Rates (primary provider key)
NEXT_PUBLIC_EXCHANGERATE_API_KEY=
```

## Design Philosophy

**Simplicity, speed, premium feel.**

- Clean layouts, subtle shadows, micro-animations
- Benefit-driven copy (clear > clever)
- Every screen answers: “What can I do here?”
- Landing includes Pricing and CTA before footer
- Shipping mindset: MVP first, iterate fast, keep type-safety high

## Consistency & References (New Golden Rules)

- UI, components, and modules MUST be visually and behaviorally consistent across the app.
  - Table modules live inside a Card shell with a compact header (showing count + pager) and the table body inside the Card content.
  - The “Items per page” control belongs inside the same Card section as the pager for that table, not in the page header.
  - Inputs must have visible labels on desktop and accessible labels on mobile (aria-label). Do not rely on placeholder-only labels.
- “UI references” are only that—references. They indicate capabilities and rough layout but we always follow our project’s style guide and tokenized components. Do not copy visual quirks from references if they clash with our design system.
- When introducing a new UI, mirror existing patterns (spacing, typography scale, chip styles, badge variants, pager placement, table density) from the closest equivalent module (e.g., Transactions → Statements) unless a documented exception exists.

## Role Expectations & Quality Bar

- **Copywriting:** senior-level; confident, crisp, helpful
- **UI:** FAANG-level FE/UX; accessible, responsive, tokenized
- **Logic:** senior backend; simple, robust, typed, observable

## Module Implementation Verification (Playwright)

When implementing a new module (e.g., Statements, Budgets, Analytics), you MUST verify visual and organizational consistency by:

1. **Compare side-by-side with reference module** (usually Transactions):

   - Use Playwright to capture screenshots of both the reference module and your new module in the same viewport size.
   - Compare layouts, spacing, typography scales, filter placement, button alignment, pager location, and items-per-page control position.

2. **Automated visual checks** (when Playwright is set up):

   ```typescript
   // Example: Compare Statements page to Transactions page layout
   await page.goto("/transactions");
   const txScreenshot = await page.screenshot();
   await page.goto("/statements");
   const stScreenshot = await page.screenshot();
   // Visually inspect or use image comparison libraries
   ```

3. **Manual review checklist** before marking a module done:
   - [ ] Page header matches reference (heading size, subtitle, spacing)
   - [ ] Toolbar layout matches (filters on left, actions on right)
   - [ ] Card wrapper with CardHeader + CardContent for table
   - [ ] Pager + items-per-page inside Card, not in page header
   - [ ] Bulk action button appears to the LEFT of "X selected" text
   - [ ] All inputs have visible labels (desktop) or accessible labels (mobile)
   - [ ] Empty states, loading states, and error states match reference UX
   - [ ] Responsive breakpoints work identically to reference module

**Golden Rule:** When in doubt, screenshot both pages (reference + new) side-by-side and verify pixel-perfect alignment of key UI elements.

## Golden Rules

1. If unsure, ask — do not assume.
2. Update `TODO.md` after each implementation — before asking permission to commit.
3. Ask for permission before committing.
4. Take `ui-references` as reference for UI and colors. Colors must match the ones from the `ui-references`.

---

## Golden Rules — Repeated (x5 each)

If unsure, ask — do not assume.
If unsure, ask — do not assume.
If unsure, ask — do not assume.
If unsure, ask — do not assume.
If unsure, ask — do not assume.

Update `TODO.md` after each implementation — before asking permission to commit.
Update `TODO.md` after each implementation — before asking permission to commit.
Update `TODO.md` after each implementation — before asking permission to commit.
Update `TODO.md` after each implementation — before asking permission to commit.
Update `TODO.md` after each implementation — before asking permission to commit.

Ask for permission before committing.
Ask for permission before committing.
Ask for permission before committing.
Ask for permission before committing.
Ask for permission before committing.

Take `ui-references` as reference for UI and colors. Colors must match the ones from the `ui-references`.
Take `ui-references` as reference for UI and colors. Colors must match the ones from the `ui-references`.
Take `ui-references` as reference for UI and colors. Colors must match the ones from the `ui-references`.
Take `ui-references` as reference for UI and colors. Colors must match the ones from the `ui-references`.
Take `ui-references` as reference for UI and colors. Colors must match the ones from the `ui-references`.

Everything has to be **_RESPONIVE_**.
Everything has to be **_RESPONIVE_**.
Everything has to be **_RESPONIVE_**.
Everything has to be **_RESPONIVE_**.
Everything has to be **_RESPONIVE_**.

Everything screen has to have their messages in locales. (THIS HAS TO BE MADE EVERY TIME A COMPONENT IS MADE)
Everything screen has to have their messages in locales. (THIS HAS TO BE MADE EVERY TIME A COMPONENT IS MADE)
Everything screen has to have their messages in locales. (THIS HAS TO BE MADE EVERY TIME A COMPONENT IS MADE)
Everything screen has to have their messages in locales. (THIS HAS TO BE MADE EVERY TIME A COMPONENT IS MADE)
Everything screen has to have their messages in locales. (THIS HAS TO BE MADE EVERY TIME A COMPONENT IS MADE)

Every time you're about to implement a new module read the instructions and re-read the module specific section of instructions.
Every time you're about to implement a new module read the instructions and re-read the module specific section of instructions.
Every time you're about to implement a new module read the instructions and re-read the module specific section of instructions.
Every time you're about to implement a new module read the instructions and re-read the module specific section of instructions.
Every time you're about to implement a new module read the instructions and re-read the module specific section of instructions.

## Notes & Non-Negotiables

- Use **shadcn/ui** and theme tokens app-wide; no raw `text-white`, `bg-gray-*`, etc.
- Prefer reusable tokenized components; avoid style duplication.
- Statement parsing: **Before implementing AI extraction, ASK DIEGO FOR THE PROMPT.**
- Bulk destructive actions (statements/transactions) must show confirm modals and reflect cascading effects clearly.
- **Locked/Encrypted PDFs:** Detect and fail gracefully with actionable messaging; support retry via your external script when provided.
- **Email verification:** Enforced by Supabase prior to granting access to authed areas.
- **Plans & Enforcement:** all create/update APIs must call `lib/plan.ts` guards to enforce card/statement/category/budget limits.
- **UI References:** Take `ui-references` as the canonical visual reference; UI colors must match those images exactly.
