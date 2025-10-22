# Authentication API Reference

## useAuth Hook

### Import

```typescript
import { useAuth } from "@/hooks/use-auth";
```

### Usage

```typescript
const {
  user, // Supabase User object
  profile, // Profile data from database
  session, // Current session
  loading, // Loading state (true during initial fetch)
  isAdmin, // Boolean flag for admin access
  signOut, // Function to sign out
  refreshProfile, // Function to refresh profile data
} = useAuth();
```

### Types

```typescript
interface Profile {
  id: string;
  user_id: string;
  name: string;
  last_name: string | null;
  is_admin: boolean;
  locale: string;
  timezone: string;
  plan: "free" | "plus" | "pro" | "admin";
  primary_currency: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
}
```

### Example Component

```typescript
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export default function ProtectedComponent() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // This shouldn't happen if middleware is working
    return null;
  }

  return (
    <div>
      <h1>Hello, {profile?.name}!</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Supabase Client

### Browser Client (Client Components)

```typescript
import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();

// Sign in with password
const { data, error } = await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password123",
});

// Sign in with magic link (OTP)
const { error } = await supabase.auth.signInWithOtp({
  email: "user@example.com",
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: "user@example.com",
  password: "password123",
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});

// Reset password (send email)
const { error } = await supabase.auth.resetPasswordForEmail(
  "user@example.com",
  {
    redirectTo: `${window.location.origin}/reset-password/confirm`,
  }
);

// Update password (after reset)
const { error } = await supabase.auth.updateUser({
  password: "newpassword123",
});

// Sign out
await supabase.auth.signOut();

// Get current session
const {
  data: { session },
} = await supabase.auth.getSession();

// Listen to auth changes
const {
  data: { subscription },
} = supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

### Server Client (Server Components, Route Handlers)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const cookieStore = await cookies();

const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  }
);

// Get session
const {
  data: { session },
} = await supabase.auth.getSession();

// Query database with RLS
const { data } = await supabase
  .from("profiles")
  .select("*")
  .eq("user_id", session?.user.id)
  .single();
```

## Middleware

The middleware automatically:

- Refreshes auth sessions on each request
- Protects routes requiring authentication
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from auth pages
- Preserves intended destination in redirect URL

### Protected Routes

- `/dashboard/*`
- `/cards/*`
- `/transactions/*`
- `/statements/*`
- `/analytics/*`
- `/budgets/*`
- `/settings/*`
- `/admin/*`

### Public Routes

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/*`
- `/auth/callback`

## Common Patterns

### Protect a Page (using middleware)

No code needed - middleware handles it automatically for configured routes.

### Conditional Rendering Based on Auth

```typescript
const { user, profile, loading } = useAuth();

if (loading) return <Spinner />;
if (!user) return <LoginPrompt />;
if (profile?.is_admin) return <AdminPanel />;
return <UserPanel />;
```

### Server-Side Auth Check

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function ServerPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  // Fetch data with RLS
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  return <div>Hello {profile?.name}!</div>;
}
```

### Form Submission with Error Handling

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(null);

  try {
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push("/dashboard");
  } catch (err) {
    setError("An unexpected error occurred");
    console.error(err);
  } finally {
    setLoading(false);
  }
};
```

## Error Messages

Common Supabase Auth error messages:

- `"Invalid login credentials"` - Wrong email/password
- `"Email not confirmed"` - User hasn't verified email
- `"User already registered"` - Email already exists
- `"Password should be at least 6 characters"` - Weak password
- `"Unable to validate email address"` - Invalid email format

## Email Templates

Supabase sends emails for:

1. **Email Confirmation** - After registration
2. **Magic Link** - Passwordless login
3. **Password Reset** - Forgot password flow
4. **Email Change** - When user updates email

Configure templates in Supabase Dashboard → Authentication → Email Templates

## Security Best Practices

1. ✅ **Email verification required** - Enforced in login
2. ✅ **Password minimum length** - 8 characters (Supabase default is 6)
3. ✅ **RLS policies** - Applied to all database tables
4. ✅ **Server-side session refresh** - In middleware
5. ✅ **Secure cookies** - Managed by @supabase/ssr
6. ✅ **HTTPS only** - Configure in production
7. ✅ **Rate limiting** - Built into Supabase Auth
8. ⚠️ **2FA** - Not yet implemented
9. ⚠️ **OAuth providers** - Not yet implemented (Google, GitHub, etc.)

## Troubleshooting

### "User not found" after registration

- Check email for verification link
- Verify Supabase email settings are configured
- Check spam folder

### Redirect loop

- Check middleware matcher config
- Verify environment variables are set
- Clear cookies and try again

### Session not persisting

- Ensure cookies are enabled in browser
- Check CORS settings in Supabase
- Verify `@supabase/ssr` is being used correctly

### Profile not found

- Check database trigger for profile creation
- Verify RLS policies allow user to read own profile
- Check user_id foreign key constraint
