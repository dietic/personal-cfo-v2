# Performance Analysis Report

## Personal CFO Application - Page Load Performance Issues

**Analysis Date:** October 24, 2025
**Issue:** Pages taking too long to load (40-90+ seconds with slow Supabase responses)

---

## 🔴 Critical Bottlenecks Identified

### 1. **Sequential Auth Fetching (MOST CRITICAL)**

**Location:** `hooks/use-auth.ts`
**Impact:** 20-40 seconds on every page load

**Problem:**
The `useAuth` hook makes **multiple sequential** auth/profile fetches on every page load:

```typescript
// Step 1: Fetch from /api/me (server-side) - ~10s
const res = await fetch("/api/me", { cache: "no-store" });

// Step 2: Fallback to Supabase auth session - ~10s
const { data } = await supabase.auth.getSession();

// Step 3: Fallback to Supabase profile query - ~10s
const { data: profileData } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", session.user.id)
  .single();
```

**Why it's slow:**

- Each call waits for the previous one to complete
- If Supabase takes 10s per call, this is 30s total
- Runs on EVERY page load, including client-side navigations
- Auth state change listener duplicates this logic

**Solution:**

- Use React Query to cache `/api/me` response
- Add request deduplication so multiple components share one request
- Implement optimistic loading with stale-while-revalidate pattern
- Consider SSR for initial auth state

---

### 2. **ChatProvider Redundant API Calls**

**Location:** `components/chat/chat-provider.tsx`
**Impact:** 10-20 seconds on every protected page

**Problem:**

```typescript
// On mount - calls refreshProfile which hits Supabase
useEffect(() => {
  refreshProfile().catch(() => void 0);
}, []);

// Then immediately calls /api/me AGAIN
useEffect(() => {
  fetch("/api/me", { cache: "no-store" }).then(/* ... */);
}, [loading, profile]);
```

**Why it's slow:**

- Makes 2 sequential API calls on every page load
- Both calls fetch the same data (user profile/plan)
- Not using cached data from `useAuth`
- Runs on every protected route

**Solution:**

- Remove redundant fetch; use `profile.plan` from `useAuth` directly
- Remove `refreshProfile()` call since `useAuth` already handles this
- Trust the cached auth state

---

### 3. **Dashboard Sequential Data Fetching**

**Location:** `app/(main)/dashboard/page.tsx`
**Impact:** 20-40 seconds to load dashboard

**Problem:**

```typescript
// Three separate useEffect hooks running sequentially:
useEffect(() => {
  async function fetchBudgets() {
    /* ... */
  }
  fetchBudgets();
}, []);

useEffect(() => {
  async function fetchRecentTransactions() {
    /* ... */
  }
  fetchRecentTransactions();
}, []);

// Plus useCards hook
const { cards, isLoading } = useCards();
```

**Why it's slow:**

- Each fetch waits for the previous useEffect to complete
- Not using React Query (no caching or deduplication)
- Raw `fetch()` calls don't parallelize automatically
- Each fetch to Supabase: ~10s

**Solution:**

- Use React Query for all data fetching
- Fetch all data in parallel using `Promise.all()` or multiple queries
- Enable `suspense: false` and `placeholderData` for progressive loading

---

### 4. **Middleware Auth Check on Every Navigation**

**Location:** `middleware.ts`
**Impact:** 10 seconds per page navigation

**Problem:**

```typescript
// Runs on EVERY page navigation (except static assets)
const {
  data: { session },
} = await supabase.auth.getSession();
```

**Why it's slow:**

- Middleware runs server-side on every route change
- Calls Supabase on every navigation (even client-side SPA navigations that trigger server requests)
- If Supabase is slow, every page nav is slow

**Solution:**

- Implement middleware caching (edge cache or in-memory)
- Use Next.js middleware config to exclude more routes
- Consider moving auth checks to layout components for client-side navs
- Use session tokens with longer TTL

---

### 5. **No Request Deduplication**

**Impact:** 30-60 seconds of redundant network calls

**Problem:**
Multiple components independently call the same endpoints:

- `useAuth` → `/api/me`
- `ChatProvider` → `/api/me`
- `DashboardNavbar` (via `useAuth`) → profile fetch
- `Sidebar` → locale/profile fetch

**Why it's slow:**

- Same data fetched 3-5 times on a single page load
- No shared cache between components
- Each component waits for its own request

**Solution:**

- Implement React Query globally with proper cache keys
- Use `staleTime` and `cacheTime` to prevent refetches
- Enable automatic request deduplication (React Query does this by default)

---

### 6. **Not Using React Query Everywhere**

**Impact:** Missing out on 60-80% performance gains

**Problem:**
Components using raw `fetch()` + `useEffect`:

- Dashboard budgets fetch
- Dashboard transactions fetch
- ChatProvider plan check
- Various settings components

**Why it's slow:**

- No automatic caching
- No request deduplication
- No background refetching with stale data
- No optimistic updates

**Solution:**

- Convert ALL data fetching to React Query hooks
- Follow the pattern already established in `use-transactions.ts`, `use-cards.ts`
- Enable `placeholderData: keepPreviousData` for smooth transitions

---

### 7. **Large Build Size (483MB)**

**Impact:** Slower initial page loads, larger bundles

**Problem:**

- `.next` folder is 483MB (unusually large)
- Some chunks are quite large (560K for Next.js client code)

**Why it's slow:**

- More JavaScript to parse and execute
- Longer Time to Interactive (TTI)
- More bandwidth usage

**Solution:**

- Run bundle analyzer to identify large dependencies
- Check for duplicate dependencies
- Consider code splitting for large components
- Review if all dependencies are necessary

---

## 📊 Estimated Performance Impact

### Current State (with 10s Supabase latency):

```
Middleware auth check:          ~10s
useAuth initial load:           ~30s (3 sequential calls)
ChatProvider checks:            ~20s (2 sequential calls)
Dashboard data fetching:        ~30s (3 sequential fetches)
----------------------------------------
TOTAL WORST CASE:               ~90s
TOTAL BEST CASE:                ~40s (some parallel execution)
```

### After Optimizations:

```
Middleware (cached):            ~0.1s (cached) or ~10s (first load)
useAuth (with React Query):     ~10s (single cached call)
ChatProvider (removed calls):    ~0s (uses cached auth)
Dashboard (parallel):           ~10s (all in parallel via React Query)
----------------------------------------
TOTAL FIRST LOAD:               ~20s (80% improvement!)
TOTAL SUBSEQUENT PAGES:         ~0.5s (99% improvement!)
```

---

## ✅ Recommended Fix Priority

### IMMEDIATE (Biggest Impact):

1. **Add React Query to useAuth and deduplicate `/api/me` calls**
2. **Remove redundant API calls from ChatProvider**
3. **Convert Dashboard fetches to React Query with parallel loading**

### HIGH PRIORITY:

4. **Implement middleware caching**
5. **Audit and fix all components using raw fetch() + useEffect**

### MEDIUM PRIORITY:

6. **Add bundle analyzer and optimize chunk sizes**
7. **Implement loading skeletons for better perceived performance**

### LOW PRIORITY:

8. **Consider server-side rendering for initial page data**
9. **Implement service worker caching for offline support**

---

## 🛠️ Implementation Plan

### Phase 1: Request Deduplication (1-2 hours)

- [ ] Create `hooks/use-profile.ts` with React Query
- [ ] Update `useAuth` to use React Query for `/api/me`
- [ ] Remove redundant calls from `ChatProvider`
- [ ] Add proper cache configuration

### Phase 2: Dashboard Optimization (1 hour)

- [ ] Convert budgets fetch to React Query hook
- [ ] Convert transactions fetch to use existing hook
- [ ] Ensure all fetches run in parallel

### Phase 3: Middleware Caching (2 hours)

- [ ] Implement session caching in middleware
- [ ] Add edge cache headers
- [ ] Test auth flow with caching

### Phase 4: Bundle Optimization (2 hours)

- [ ] Install and run `@next/bundle-analyzer`
- [ ] Identify and remove duplicate dependencies
- [ ] Implement code splitting where beneficial

---

## 📈 Expected Results

After implementing all optimizations:

**First Page Load:**

- Current: 40-90 seconds
- After: 10-20 seconds
- **Improvement: 75-80%**

**Subsequent Page Navigations:**

- Current: 20-40 seconds
- After: 0.5-2 seconds
- **Improvement: 95-98%**

**User Experience:**

- Instant navigation between cached pages
- Progressive loading with skeletons
- Optimistic updates for user actions

---

## 🔍 Root Cause Summary

The fundamental issue is **sequential network requests** combined with **slow Supabase responses**:

1. **Network Waterfall:** Each component waits for auth → then fetches data → then renders
2. **No Caching:** Same data fetched multiple times on every page load
3. **No Parallelization:** Requests that could run simultaneously run sequentially
4. **No Deduplication:** Multiple components request identical data independently

**The fix is systematic:** Implement React Query everywhere, enable caching, parallelize independent requests, and eliminate redundant API calls.
