# Chat Feature Testing Guide

## Pre-Testing Setup

### 1. Apply Database Migration

```bash
# Option A: Via Supabase CLI
cd supabase
supabase db push

# Option B: Via Supabase Dashboard
# 1. Go to SQL Editor
# 2. Copy contents of migrations/20251024000003_create_chat_usage.sql
# 3. Run the SQL
```

### 2. Set Environment Variable

```bash
# Add to .env.local
OPENAI_API_KEY=sk-proj-...your-key-here...
```

### 3. Regenerate Types (Optional)

```bash
pnpm supabase gen types typescript --local > types/database.ts
```

### 4. Start Development Server

```bash
pnpm dev
# Navigate to http://localhost:3000
```

---

## Test Cases

### Test 1: Free Plan - Upgrade Modal

**Goal:** Verify Free tier users see upgrade modal instead of chat

**Steps:**

1. Create a test user with `plan='free'` in profiles table
2. Log in as that user
3. Navigate to any authenticated page (dashboard, transactions, etc.)
4. Look for floating chat bubble (bottom-right corner)
5. Click the chat bubble

**Expected:**

- ✅ Modal appears with title "Chat is a Plus/Pro feature"
- ✅ Description explains feature and benefits
- ✅ "Upgrade Now" button links to `/settings?tab=billing`
- ✅ "Cancel" button closes modal
- ✅ Chat drawer does NOT open

---

### Test 2: Plus Plan - 50 Queries/Month

**Goal:** Verify Plus tier has correct limits

**Steps:**

1. Create/update test user with `plan='plus'`
2. Clear all records from `chat_usage` table for this user
3. Log in and click chat bubble
4. Verify header shows "50/50 queries left this month"
5. Send a test query: "How much did I spend last month?"
6. Verify header updates to "49/50 queries left this month"
7. (Optional) Manually insert 50 records in chat_usage table for current month
8. Try to send another query

**Expected:**

- ✅ Initial: "50/50 queries left"
- ✅ After 1 query: "49/50 queries left"
- ✅ After 50 queries: Error message "Monthly plan limit exceeded"
- ✅ Response status: 402 Payment Required
- ✅ Remaining queries: 0

---

### Test 3: Pro Plan - 200 Queries/Month

**Goal:** Verify Pro tier has correct limits

**Steps:**

1. Update test user to `plan='pro'`
2. Clear chat_usage records for this user
3. Send a query
4. Verify header shows "199/200 queries left"

**Expected:**

- ✅ Initial: "200/200 queries left"
- ✅ After 1 query: "199/200 queries left"
- ✅ Limit is 200 queries/month

---

### Test 4: Admin Plan - Unlimited

**Goal:** Verify Admin has no limits

**Steps:**

1. Update test user to `plan='admin'`
2. Click chat bubble
3. Send multiple queries

**Expected:**

- ✅ Header shows "Unlimited queries"
- ✅ No query limit enforced
- ✅ Can send as many queries as needed

---

### Test 5: Hourly Rate Limit (10/hour)

**Goal:** Verify rate limiting prevents abuse

**Steps:**

1. Use any paid plan (Plus/Pro/Admin)
2. Send 10 queries rapidly (within 1 minute)
3. Try to send an 11th query

**Expected:**

- ✅ First 10 queries: Success
- ✅ 11th query: Error "Too many queries. Wait {X} minutes."
- ✅ Response status: 429 Too Many Requests
- ✅ Retry-After header included
- ✅ After 1 hour: Can send queries again

---

### Test 6: Input Validation

**Goal:** Verify 500 character limit

**Steps:**

1. Open chat drawer
2. Type a query with exactly 500 characters
3. Try to type more
4. Verify character counter shows "500/500"
5. Type a query with 501+ characters and try to send

**Expected:**

- ✅ Character counter updates in real-time
- ✅ Shows "X/500" format
- ✅ Input still accepts text (textarea doesn't block)
- ✅ Backend rejects queries > 500 chars with validation error

---

### Test 7: Natural Language Queries

**Goal:** Test actual AI responses

**Test Queries:**

```
1. "How much did I spend on food last month?"
2. "What's my biggest expense category?"
3. "Am I on track with my budgets?"
4. "Show me income vs expenses"
5. "What were my top 5 purchases?"
```

**Expected:**

- ✅ Each query receives a relevant response
- ✅ Response references actual user data
- ✅ Responses are in natural language
- ✅ Loading indicator shows while waiting
- ✅ Message appears with AI avatar (Bot icon)
- ✅ Auto-scrolls to new message

---

### Test 8: Safety - SQL Injection

**Goal:** Verify dangerous queries are blocked

**Test Queries:**

```
1. "DROP TABLE transactions;"
2. "DELETE FROM profiles WHERE id = '...'"
3. "INSERT INTO chat_usage VALUES (...)"
4. "UPDATE profiles SET plan='admin' WHERE ..."
```

**Expected:**

- ✅ All queries blocked before reaching AI
- ✅ Error message: "I can only help with your finances"
- ✅ No database modifications occur
- ✅ Input sanitization prevents injection

---

### Test 9: Safety - XSS Attempts

**Goal:** Verify script injection is prevented

**Test Queries:**

```
1. "<script>alert('xss')</script>"
2. "<img src=x onerror=alert('xss')>"
3. "javascript:alert('xss')"
```

**Expected:**

- ✅ Script tags escaped in output
- ✅ No JavaScript executes
- ✅ Sanitized response displayed safely

---

### Test 10: UI/UX - Empty State

**Goal:** Verify first-time user experience

**Steps:**

1. Open chat drawer with no messages
2. Observe empty state

**Expected:**

- ✅ Bot icon displayed (large, centered)
- ✅ Title: "Ask me anything about your finances!"
- ✅ Description: helpful explanation
- ✅ "Try asking:" section with 4 examples:
  - 💰 "How much did I spend on food last month?"
  - 📊 "What's my biggest expense category?"
  - 🎯 "Am I on track with my budgets?"
  - 📈 "Show me income vs expenses"

---

### Test 11: UI/UX - Message Display

**Goal:** Verify correct message styling

**Steps:**

1. Send a query
2. Observe message layout

**Expected User Messages:**

- ✅ Right-aligned
- ✅ Primary color background
- ✅ White text
- ✅ User icon (right side)
- ✅ Timestamp below message

**Expected AI Messages:**

- ✅ Left-aligned
- ✅ Muted background (gray)
- ✅ Foreground text color
- ✅ Bot icon (left side, primary color circle)
- ✅ Timestamp below message

---

### Test 12: UI/UX - Loading State

**Goal:** Verify typing indicator

**Steps:**

1. Send a query
2. Observe while waiting for response

**Expected:**

- ✅ Typing indicator appears (3 animated dots)
- ✅ Bot avatar shown next to indicator
- ✅ Dots bounce in sequence
- ✅ Send button disabled
- ✅ Input disabled
- ✅ Loading state clears after response

---

### Test 13: UI/UX - Keyboard Shortcuts

**Goal:** Verify keyboard interactions

**Steps:**

1. Focus textarea
2. Type a message
3. Press Enter → Should send
4. Type a message
5. Press Shift+Enter → Should add newline
6. Press Escape → Should close drawer

**Expected:**

- ✅ Enter: Sends message (if not empty)
- ✅ Shift+Enter: Adds newline without sending
- ✅ Escape: Closes drawer
- ✅ Textarea auto-resizes with content

---

### Test 14: UI/UX - Clear Chat

**Goal:** Verify chat clearing

**Steps:**

1. Send 2-3 queries (build conversation)
2. Click "Clear chat" button in header
3. Observe

**Expected:**

- ✅ All messages removed
- ✅ Empty state appears again
- ✅ Usage counter remains unchanged
- ✅ Can start new conversation

---

### Test 15: Responsive Design - Mobile

**Goal:** Test mobile experience

**Steps:**

1. Resize browser to mobile width (< 640px)
2. Click chat bubble
3. Test all interactions

**Expected:**

- ✅ Chat drawer fills entire screen
- ✅ Header shows title and usage
- ✅ Messages stack vertically
- ✅ Input remains at bottom
- ✅ Virtual keyboard doesn't break layout
- ✅ Close button accessible

---

### Test 16: Error Handling - Network Error

**Goal:** Verify graceful degradation

**Steps:**

1. Disconnect from internet (or block OpenAI API in DevTools)
2. Send a query
3. Observe error message

**Expected:**

- ✅ Error message: "Connection error. Try again."
- ✅ No crash or blank screen
- ✅ Can retry after reconnection
- ✅ Usage counter doesn't increment on failed request

---

### Test 17: Error Handling - OpenAI Timeout

**Goal:** Test API error handling

**Steps:**

1. (Requires backend modification to simulate timeout)
2. Send a query that causes OpenAI timeout
3. Observe

**Expected:**

- ✅ Error message: "I'm having trouble connecting right now. Please try again in a moment."
- ✅ Status 500 returned
- ✅ Error logged to console
- ✅ Usage not recorded for failed request

---

### Test 18: i18n - Spanish Translation

**Goal:** Verify Spanish translations work

**Steps:**

1. Change user locale to 'es' in profiles table
2. Reload page
3. Open chat drawer

**Expected:**

- ✅ Button label: "Hablar con CFO"
- ✅ Title: "Pregunta a tus Finanzas"
- ✅ Placeholder: "Pregúntame sobre tus finanzas..."
- ✅ Send button: "Enviar"
- ✅ Clear button: "Limpiar chat"
- ✅ Usage: "X/Y consultas restantes este mes"
- ✅ Examples in Spanish

---

### Test 19: Database Logging

**Goal:** Verify all queries are logged

**Steps:**

1. Send 3-4 different queries
2. Check `chat_usage` table in database

**Expected:**

```sql
SELECT
  user_id,
  query,
  LENGTH(response) as response_length,
  tokens_used,
  created_at
FROM chat_usage
WHERE user_id = 'your-user-id'
ORDER BY created_at DESC;
```

- ✅ All queries logged
- ✅ Responses stored (sanitized)
- ✅ Token count recorded
- ✅ Timestamp accurate
- ✅ User ID matches

---

### Test 20: RLS Policies

**Goal:** Verify users can only see their own data

**Steps:**

1. As User A, send queries
2. Switch to User B account
3. Try to query User A's chat_usage records

**Expected:**

```sql
-- As User B, this should return 0 rows for User A's data
SELECT * FROM chat_usage WHERE user_id = 'user-a-id';
```

- ✅ Users can only SELECT their own records
- ✅ Users can only INSERT their own records
- ✅ No UPDATE allowed
- ✅ No DELETE allowed
- ✅ RLS enforced at database level

---

## Performance Tests

### Test 21: Response Time

**Goal:** Measure typical response time

**Steps:**

1. Send query: "How much did I spend last month?"
2. Measure time from click to response

**Expected:**

- ✅ < 3 seconds for typical query
- ✅ Depends on OpenAI API latency
- ✅ Context building < 500ms
- ✅ Database logging < 100ms

---

### Test 22: Token Usage

**Goal:** Verify cost estimates

**Steps:**

1. Send various queries
2. Check tokens_used in database
3. Calculate costs

**Formula:**

```
Input cost: $0.000150 per 1K tokens
Output cost: $0.000600 per 1K tokens

Typical query:
- Context: ~2,500 tokens
- User query: ~20 tokens
- AI response: ~100 tokens
Total: ~2,620 tokens
Cost: (2,520 * $0.00015 + 100 * $0.0006) / 1000 = ~$0.003
```

**Expected:**

- ✅ Most queries: 2,000-5,000 tokens
- ✅ Cost per query: $0.002 - $0.005
- ✅ Plus plan (50/month): ~$0.25/user
- ✅ Pro plan (200/month): ~$1.00/user

---

## Edge Cases

### Test 23: Empty Query

**Steps:**

1. Try to send empty message
2. Try to send only whitespace

**Expected:**

- ✅ Send button disabled when input empty
- ✅ Validation error if whitespace-only

---

### Test 24: Very Long Query

**Steps:**

1. Paste 1,000 character text
2. Try to send

**Expected:**

- ✅ Character counter shows "1000/500"
- ✅ Counter turns red (or warning color)
- ✅ Backend rejects with validation error

---

### Test 25: Special Characters

**Steps:**

1. Send query with emojis: "💰 How much 💸 did I spend?"
2. Send query with quotes: "What's my \"biggest\" expense?"
3. Send query with symbols: "Show me $ amounts > 1000"

**Expected:**

- ✅ All characters handled correctly
- ✅ No encoding issues
- ✅ Response maintains context

---

### Test 26: No Transaction Data

**Steps:**

1. Create new user with no transactions
2. Send query about spending

**Expected:**

- ✅ AI responds: "You don't have any transactions yet"
- ✅ Context builder handles empty data gracefully
- ✅ No errors thrown

---

### Test 27: Month Boundary

**Steps:**

1. Send query on last day of month (e.g., Jan 31)
2. Wait until midnight (Feb 1)
3. Send another query
4. Check usage counter

**Expected:**

- ✅ Jan 31: Shows correct usage for January
- ✅ Feb 1: Counter resets to 0
- ✅ `get_monthly_chat_usage()` function uses current month
- ✅ Old queries still in database (for history)

---

## Regression Tests

### Test 28: Existing Features Unaffected

**Goal:** Ensure chat doesn't break other features

**Steps:**

1. Upload a statement
2. Categorize transactions
3. View analytics
4. Manage budgets
5. Navigate between pages

**Expected:**

- ✅ All existing features work normally
- ✅ Chat bubble visible on all authenticated pages
- ✅ No performance degradation
- ✅ No layout shifts or overlaps

---

## Accessibility Tests

### Test 29: Screen Reader

**Steps:**

1. Use screen reader (NVDA, JAWS, VoiceOver)
2. Navigate to chat bubble
3. Open drawer
4. Read messages

**Expected:**

- ✅ Chat bubble has aria-label
- ✅ Messages have proper role attributes
- ✅ Typing indicator announced
- ✅ Usage stats read correctly
- ✅ Form inputs have labels

---

### Test 30: Keyboard Navigation

**Steps:**

1. Use only keyboard (Tab, Shift+Tab, Enter, Escape)
2. Navigate to chat bubble
3. Open drawer
4. Focus textarea
5. Send message
6. Close drawer

**Expected:**

- ✅ All interactive elements focusable
- ✅ Focus visible (outline/ring)
- ✅ Tab order logical
- ✅ Escape closes drawer
- ✅ Enter sends message

---

## Sign-Off Checklist

After completing all tests:

- [ ] Free plan upgrade modal works
- [ ] Plus plan 50/month limit enforced
- [ ] Pro plan 200/month limit enforced
- [ ] Admin unlimited queries work
- [ ] Hourly rate limit (10/hour) enforced
- [ ] Input validation (500 chars) works
- [ ] Natural language responses correct
- [ ] SQL injection blocked
- [ ] XSS attempts sanitized
- [ ] Empty state displays properly
- [ ] Message styling correct (user vs AI)
- [ ] Loading/typing indicator works
- [ ] Keyboard shortcuts functional
- [ ] Clear chat works
- [ ] Mobile responsive
- [ ] Network errors handled
- [ ] Spanish translations complete
- [ ] Database logging works
- [ ] RLS policies enforced
- [ ] Response time acceptable (<3s)
- [ ] Token usage within estimates
- [ ] Edge cases handled
- [ ] No regression in existing features
- [ ] Accessibility requirements met

---

## Troubleshooting

### Issue: Chat bubble not visible

**Check:**

- User is authenticated
- User is on authenticated route (not /login, /register)
- ChatProvider in layout.tsx
- No CSS z-index conflicts

### Issue: Upgrade modal not showing for Free users

**Check:**

- User's `plan` field is 'free' in profiles table
- ChatProvider conditional logic
- Dialog component imported correctly

### Issue: "Monthly limit exceeded" on first query

**Check:**

- chat_usage table has old records
- get_monthly_chat_usage() function exists
- Function uses current month correctly

### Issue: OpenAI errors

**Check:**

- OPENAI_API_KEY environment variable set
- API key has credits
- Network can reach api.openai.com
- Rate limits not exceeded on OpenAI side

### Issue: TypeScript errors

**Check:**

- Run: `pnpm tsc --noEmit`
- Regenerate types: `pnpm supabase gen types typescript`
- Check for `@ts-nocheck` (should be removed)

### Issue: Build fails

**Check:**

- Run: `pnpm build`
- Fix ESLint errors (not warnings)
- Check for unused imports
- Verify all files saved

---

## Success Criteria

✅ **All 30 test cases pass**
✅ **No console errors during normal usage**
✅ **Response time < 3 seconds**
✅ **Cost per query < $0.005**
✅ **Build succeeds without errors**
✅ **Accessibility score > 90**
✅ **Mobile experience smooth**
✅ **i18n complete (EN + ES)**

---

## Next Steps After Testing

1. **User Acceptance Testing:** Get real user feedback
2. **Monitor Costs:** Track actual spend vs estimates
3. **Optimize Context:** Reduce token usage if needed
4. **Add Features:** Consider implementing enhancements from TODO.md
5. **Analytics:** Track usage patterns and popular queries
6. **Documentation:** Update user-facing docs with chat feature
