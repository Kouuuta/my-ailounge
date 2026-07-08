# `/signup` — Create Account Page

## Route

`/signup` — Public (no auth required).

## Page

Client component (`"use client"`) with a glassmorphism card centered on screen:

| Feature | Detail |
|---------|--------|
| Email/password form | `supabase.auth.signUp()` with `emailRedirectTo` |
| Validation | Password min 6 characters (HTML `minLength={6}`) |
| Redirect | Pushes to `/feed` on success |
| Error display | Red inline error message on auth failure |
| Loading state | Button shows "Creating account..." and disables |
| Link to login | `<Link href="/login">` at bottom |

### Dependencies

- `getBrowserSupabase()` from `@/src/db/browser-client`
- Supabase Auth (email/password only — no OAuth on signup)
- Logo from `@/src/image/MindYou_LogoBlue.png`

### Protection

Login and signup pages are excluded from the auth middleware (see `proxy.ts` — listed in `PUBLIC_ROUTES`).
