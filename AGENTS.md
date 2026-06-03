<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint (no path argument, lints entire project)
- No test framework configured yet

## Architecture

**Route Groups:**
- `app/(client)/` — Public-facing client app with TopAppBar + BottomNav layout
- `app/(admin)/` — Admin panel (separate layout)
- `app/auth/` — OAuth callback route (`/auth/callback`)

**Component Structure:**
- `components/ui/` — shadcn/ui components (Button, Badge, Dialog, etc.)
- `components/home/` — Home page sections (HeroSection, PopularRestaurants, DailyOffersBanner)
- `components/layout/` — TopAppBar, BottomNav, AuthenticatedNav, GuestNav
- `components/modal/` — Modal components (LoginModal, RegistrationModal, ProfileModal, BuyModal)
- `components/forms/` — Form components (login-form, registration-form, edit-profile-form, buy-form)
- `components/profile/` — Profile view components

**Supabase Integration:**
- `lib/supabase/client.ts` — Browser client (use in Client Components)
- `lib/supabase/server.ts` — Server client (use in Server Components/Actions)
- `lib/supabase/service-role.ts` — Service role client (admin operations only)
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server actions: `lib/actions/auth.ts` (signUp, signIn, signOut, verifyOtp, resendOtp), `lib/actions/profile.ts` (getProfile, updateProfile)

## UI Components

All UI components use `class-variance-authority` (cva) for variants. **Never add hardcoded classes to override component styles.** Use existing variants or create new ones.

**Available components:**
- `Button` — Actions with variants and sizes
- `Badge` — Labels and status indicators
- `Card` — Content containers (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- `Input` — Text inputs with variants
- `FormField` — Form field wrapper with label, icon, error state, password toggle
- `Avatar` — User avatars (Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup)
- `Separator` — Visual dividers
- `ResponsiveModal` — Modal that adapts to mobile (bottom sheet) and desktop (centered dialog)
- `Dialog`, `Sheet`, `DropdownMenu`, `Select`, `Tabs`, `Table`, `Label`

**Variant examples:**
- `Button` variants: `primary`, `secondary`, `outline`, `ghost`, `toolbar`
- `Button` sizes: `default`, `sm`, `lg`, `xl`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`, `icon-xl`
- `Badge` variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `hero`
- `Input` variants: `default`, `error`
- `Input` sizes: `default`, `sm`, `lg`
- `Card` variants: `default`, `primary`, `surface`

**When a variant doesn't exist:** Notify the user that a new variant must be created. Do not silently apply arbitrary class overrides that bypass the design system.

## Design System

**Tailwind CSS v4** with `@tailwindcss/postcss` plugin.

**Color Tokens:** Material Design 3 system defined in `app/globals.css`:
- Surface colors: `surface`, `surface-container`, `on-surface`, etc.
- Primary: `#cc0000` (red), Secondary: `#fcd400` (yellow)
- Dark mode: `.dark` class on `<html>` or parent

**Typography:** Plus Jakarta Sans font, custom text tokens:
- `text-display-lg` (40px), `text-display-xl` (72px)
- `text-headline-lg` (32px), `text-headline-md` (24px)
- `text-title-lg` (20px)
- `text-body-lg` (18px), `text-body-md` (16px)
- `text-label-lg` (14px), `text-label-md` (12px)

**Custom Utilities:**
- `cn()` — Class merging utility in `lib/utils.ts` (uses `clsx` + `tailwind-merge`)
- `.plus-pattern` — Radial gradient background pattern

## Authentication

**Hook:** `useAuth()` in `hooks/useAuth.ts` — Returns `{ user, isLoading, isAuthenticated }`. Manages session state and reactivity.

**Server Actions:** `lib/actions/auth.ts`
- `signUpWithEmail(email, password, firstName, lastName)`
- `signInWithEmail(email, password)`
- `signInWithGoogle()` — Throws `RedirectError` for OAuth redirect
- `signOut()`
- `verifyOtp(email, token)`
- `resendOtp(email)`

**Profile Actions:** `lib/actions/profile.ts`
- `getProfile()` — Returns `{ firstName, lastName, email }`
- `updateProfile(firstName, lastName)` — Updates user metadata

**Session flow:** After login/signup success, call `window.location.reload()` to refresh session state.

## Modals

**ResponsiveModal pattern:** Adapts to mobile (bottom sheet with drag handle) and desktop (centered dialog).

**Structure:**
```tsx
<ResponsiveModal open={open} onOpenChange={setOpen}>
  <ResponsiveModalTrigger asChild>
    <Button>Open</Button>
  </ResponsiveModalTrigger>
  <ResponsiveModalContent
    icon={<Icon />}
    title="Title"
    subtitle="Optional subtitle"
    desktopMaxWidth="max-w-md"
  >
    <FormComponent />
  </ResponsiveModalContent>
</ResponsiveModal>
```

**Multi-step modals:** Use internal state to switch views (e.g., `ProfileModal` with `step: "view" | "edit"`). Update `icon`, `title`, and `subtitle` based on step.

## Forms

**FormField component:** Wrapper for inputs with label, icon, error state, and password visibility toggle.

**Validation pattern:**
```tsx
const [errors, setErrors] = useState({ field: "" })

const validateField = (name: string, value: string): string => {
  return value.trim() ? "" : "Este campo es requerido"
}

const handleChange = (name: string) => (value: string) => {
  setFormData((prev) => ({ ...prev, [name]: value }))
  if (errors[name]) {
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }
}
```

**Error display:** Use `Input` with `variant="error"` or pass `error` prop to `FormField`.

## Z-Index Hierarchy

- `z-50` — Modals, dialogs, sheets, TopAppBar
- `z-40` — BottomNav (below modals)
- `z-20` — Content layers (DailyOffersBanner)
- `z-10` — Hero section content, Avatar badge

## Key Patterns

- Use `"use client"` directive for Client Components
- Responsive breakpoints: `md:` (768px), `lg:` (1024px)
- Layout uses `min-h-[max(884px,100dvh)]` for mobile-first viewport
- Body has `pt-[72px] pb-[80px]` for TopAppBar and BottomNav spacing
- BottomNav hidden on desktop: `lg:hidden`
- BottomNav is auth-aware: shows `AuthenticatedNav` (tabs) or `GuestNav` (login/register buttons) based on `useAuth()`
- Profile tab opens `ProfileModal` instead of navigating to `/profile`

**Assets:** Store images in `/assets/` (not `/public/`). Import as modules:
```tsx
import heroImage from "@/assets/hero.webp"
<Image src={heroImage} alt="..." />
```