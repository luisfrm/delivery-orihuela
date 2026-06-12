<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run lint` — ESLint (no path argument, lints entire project)
- No test framework configured yet

## First Admin (/init)

El primer usuario admin se crea a través de la página `/init`:

1. Con la DB limpia (sin admins), navegar a `/init`
2. Completar el formulario con nombre, correo y contraseña
3. Se redirige automáticamente a `/panel`

**Reglas de seguridad:**
- Si ya existe un admin, `/init` redirige a `/panel` en el servidor (Server Component)
- La creación usa el service role key (bypassa RLS) — `lib/actions/init.ts`
- El rol `'admin'` se guarda en `app_metadata` (no editable por el cliente) — el trigger no lo sobreescribe
- El email se confirma automáticamente (sin OTP)
- `supabase/seed.sql` está vacío; el admin ya no se crea por seed

## Architecture

**Route Groups:**
- `app/(client)/` — Public-facing client app with TopAppBar + BottomNav layout
- `app/(admin)/` — Admin panel (separate layout)
- `app/auth/` — OAuth callback route (`/auth/callback`)
- `app/init/` — Setup wizard para crear el primer admin (redirige a /panel si ya existe)

**Middleware / Request Proxying (Next.js 16):**
- Next.js 16 uses the `proxy.ts` file in the root directory (exporting an async `proxy(request)` function) rather than `middleware.ts` to intercept requests.
- Admin panel routes `/panel/:path*` are protected via `proxy.ts` using the Supabase Server Client `auth.getUser()` to retrieve and authorize user roles.

**Navigation Configuration:**
- Centralized navigation links are defined in `lib/config/navigation.tsx` using the `NavItem` interface and `navItems` array.
- Shared between `components/layout/AuthenticatedNav.tsx` (mobile bottom navigation) and `components/layout/DesktopNav.tsx` (desktop top app bar navigation).
- Supports properties such as `requireRole` (only rendered for users with administrative roles) and `mobileOnly` (e.g., Profile modal trigger, since desktop manages the Profile modal via the TopAppBar user icon menu).

**Component Structure:**
- `components/ui/` — shadcn/ui components (Button, Badge, Dialog, etc.)
- `components/home/` — Home page sections (HeroSection, PopularRestaurants, DailyOffersBanner)
- `components/layout/` — TopAppBar, BottomNav, AuthenticatedNav, DesktopNav, GuestNav
- `components/modal/` — Modal components (LoginModal, RegistrationModal, ProfileModal, BuyModal)
- `components/forms/` — Form components (login-form, registration-form, edit-profile-form, buy-form)
- `components/profile/` — Profile view components

**Supabase Integration:**
- `lib/supabase/client.ts` — Browser client (use in Client Components)
- `lib/supabase/server.ts` — Server client (use in Server Components/Actions)
- `lib/supabase/service-role.ts` — Service role client (admin operations only)
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server actions: `lib/actions/auth.ts` (signUp, signIn, signOut, verifyOtp, resendOtp), `lib/actions/profile.ts` (getProfile, updateProfile), `lib/actions/init.ts` (checkAdminExists, createFirstAdmin)

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

### Arquitectura de roles y perfiles

```
signUp → user_metadata { first_name, last_name, phone }  → trigger → user_profiles (queries/JOINs)
      → app_metadata  { role }                           → JWT     → RLS sin queries extra
```

| Dato | Dónde vive | Por qué |
|---|---|---|
| `first_name`, `last_name`, `phone` | `user_profiles` | Queries, JOINs, índices |
| `role` | `app_metadata` (JWT) | Control de acceso, viaja en el token, no editable por el cliente |

- **Nunca** leer `first_name`/`last_name`/`phone` de `user.user_metadata` después del signup. Usar siempre `user_profiles`.
- **Nunca** leer `role` de `user_profiles`. Usar siempre `user.app_metadata?.role` del JWT.
- **Nunca** aceptar `role` desde el cliente en el registro público. El trigger asigna `'user'` por defecto en `app_metadata`.
- **⚠️ Si un usuario cambia de rol**, necesita refrescar su sesión para que el JWT se actualice: `await supabase.auth.refreshSession()`.

### Row Level Security (RLS)
Para verificar roles en las políticas RLS, **nunca hacer un JOIN a `user_profiles`**. El rol viaja en el JWT, lo que permite verificaciones sin coste extra de DB:
```sql
-- ✅ CORRECTO:
USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')

-- ❌ INCORRECTO:
USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
```

### Gestión de Roles Especiales (Admin / Rider)
El cliente público (con `ANON_KEY`) no tiene permisos para escribir en `app_metadata`. Para asignar roles distintos a `'user'`:
1. **Crear desde cero:** Usar `supabase.auth.admin.createUser({ app_metadata: { role: 'rider' } })` en una Server Action usando la **Service Role Key**. El trigger respetará este rol y no lo sobreescribirá con `'user'`.
2. **Promover existente:** Usar `supabase.auth.admin.updateUserById(userId, { app_metadata: { role: 'admin' } })` y obligar al usuario a refrescar su sesión.

### Hook y Server Actions

**Hook:** `useAuth()` in `hooks/useAuth.ts` — Returns `{ user, role, isLoading, isAuthenticated }`.
- **Derived State Pattern:** The `role` MUST be derived synchronously directly from `user.app_metadata?.role` on every render (e.g., `const role = user ? (user.app_metadata?.role as UserRole ?? "user") : null`).
- **State Rule:** Never store `role` in a separate React `useState` to prevent rendering sync delay, UI flickers (layout shifts), or double-render updates.
- **Database Efficiency:** Reads `role` directly from the JWT's `app_metadata` in Supabase session (0 DB queries).

**Server Actions:** `lib/actions/auth.ts`
- `signUpWithEmail(email, password, firstName, lastName, phone)` — Sin parámetro `role`; el trigger asigna `role:'user'` en `app_metadata` vía `UPDATE auth.users` (usando `SECURITY DEFINER`)
- `signInWithEmail(email, password)`
- `signInWithGoogle()` — Throws `RedirectError` for OAuth redirect
- `signOut()`
- `verifyOtp(email, token)`
- `resendOtp(email)`
- `getUserRole()` — Lee `role` de `user.app_metadata` (0 queries a la DB)

**Profile Actions:** `lib/actions/profile.ts`
- `getProfile()` — Returns `{ firstName, lastName, phone, email }` — lee de `user_profiles`
- `updateProfile(firstName, lastName)` — Escribe en `user_profiles` (no en metadata)

**Session flow:** After login/signup success, call `window.location.reload()` to refresh session state.

## Database & Migrations

**Supabase CLI Migrations:**
- **Strict 14-digit timestamps:** ALWAYS use the `YYYYMMDDHHMMSS` format for migration files (e.g., `20260612235959_feature.sql`).
- **Never use short dates:** Using 8-digit dates (e.g., `20260612_feature.sql`) causes irreversible conflicts and duplicate entries in the CLI's `schema_migrations` tracking table during `supabase db push`.
- **Repairing History:** If migrations desync, use `supabase migration repair --status reverted <version>` to clean remote history, fix local filenames to 14-digits, and push again.

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
import { validateRequired } from "@/lib/validation"

const [errors, setErrors] = useState({ field: "" })

const validateField = (name: string, value: string): string => {
  switch (name) {
    case "field":
      return validateRequired(value, "El campo")
    default:
      return ""
  }
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