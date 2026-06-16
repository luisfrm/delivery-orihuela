<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Commands

- `npm run dev` — Start dev server (**restart after applying migrations** to refresh Supabase PostgREST schema cache)
- `npm run build` — Production build
- `npm run lint` — ESLint (no path argument, lints entire project)
- `npx supabase db push` — Apply pending migrations to remote
- `npx supabase migration list` — Check local vs remote migration status
- `npx supabase migration repair --status reverted <version>` — Fix desynced migration history
- No test framework configured yet
- Use **pnpm** for installs (npm was failing with cryptic error)

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

**File Naming Conventions:**
- **Component files:** PascalCase (e.g., `OrderList.tsx`, `StoreForm.tsx`, `MenuEditor.tsx`)
- **Utility/service files in `lib/`:** kebab-case (e.g., `slug.ts`, `file-validation.ts`, `stores.service.ts`, `menu-format.ts`)
- **Hooks:** camelCase (e.g., `useAuth.ts`, `useObjectURL.ts`)
- **`components/ui/`:** stay **kebab-case** (shadcn convention, e.g., `button.tsx`, `image-upload.tsx`, `dropdown-menu.tsx`)

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
- `components/ui/` — shadcn-style primitives (kebab-case, e.g., `button.tsx`, `image-upload.tsx`, `dropdown-menu.tsx`)
- `components/home/` — Home page sections (HeroSection, PopularRestaurants, DailyOffersBanner)
- `components/layout/` — TopAppBar, BottomNav, AuthenticatedNav, DesktopNav, GuestNav
- `components/modal/` — Modal components (LoginModal, RegistrationModal, ProfileModal, BuyModal, StoreFormModal)
- `components/forms/` — Form components (PascalCase, e.g., `StoreForm.tsx`, `ProductFormModal.tsx`, `LoginForm.tsx`)
- `components/profile/` — Profile view components
- `components/admin/` — Admin panel components
  - `orders/` — Orders list, rows, details
  - `restaurants/` — Restaurant CRUD + menu editor (8 components: `MenuHeader`, `MenuCategoryFilter`, `MenuCategorySection`, `ProductCard`, `AddProductCard`, `ProductFormModal`, `MenuFooter`, `MenuEditor`)
  - `settings/`, `users/` — Other admin sections
- `components/orders/` — Client-facing order components (ActiveOrderCard, etc.)

**Supabase Integration:**
- `lib/supabase/client.ts` — Browser client (use in Client Components)
- `lib/supabase/server.ts` — Server client (use in Server Components/Actions)
- `lib/supabase/service-role.ts` — Service role client (admin operations only)
- `lib/supabase/storage.ts` — Restaurant + product image upload/delete (`Delivery Orihuela Bucket`): `uploadRestaurantImage`, `uploadProductImage`, `deleteStorageObjects`
- `lib/supabase/organization-storage.ts` — Organization assets
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server actions:
  - `lib/actions/auth.ts` (signUp, signIn, signOut, verifyOtp, resendOtp, getUserRole)
  - `lib/actions/profile.ts` (getProfile, updateProfile)
  - `lib/actions/init.ts` (checkAdminExists, createFirstAdmin)
  - `lib/actions/stores.ts` — Restaurant CRUD + menu ordering (`getStores`, `getStoreBySlug`, `getAdminStores`, `createStore`, `updateStore`, `deleteStore`, `getStoreMenuBySlug`, `saveMenuOrdering`) — all require admin auth
  - `lib/actions/products.ts` — Product CRUD + image upload (`createProductAction`, `updateProductAction`, `deleteProductAction`, `uploadProductImageAction`, `deleteProductImageAction`)

**Service Layer:**
- `lib/services/stores.service.ts` — `StoresService` class with all DB methods (`getStores`, `getStoreBySlug`, `getStoresWithMetadata`, `createStore`, `updateStore`, `deleteStore`, `getStoreMenuBySlug`, `saveMenuOrdering`)
- `lib/services/products.service.ts` — `ProductsService` class with `createProduct`, `updateProduct`, `deleteProduct` (computes `position` server-side, returns `picture_url` on delete for caller cleanup)
- `lib/services/organization.service.ts` — Organization settings

## UI Components

All UI components use `class-variance-authority` (cva) for variants. **Never add hardcoded classes to override component styles.** Use existing variants or create new ones.

**Base-ui specifics (NOT Radix):**
- The project uses `@base-ui/react/*` primitives, not Radix. Conventions differ.
- `Button` `render` prop for composing with `Link`/other elements (replaces Radix's `asChild`). Example: `<Button render={<Link href="..." />} />`
- `DropdownMenu` items use `onClick` (NOT `onSelect` — base-ui uses native React events; `onSelect` is silently ignored)
- `DropdownMenu` items render as `<div>` by default (not `<button>`) → need `cursor-pointer` explicitly because there's no native button cursor
- All menu primitives (Menu, MenuTrigger, MenuItem, etc.) come from `@base-ui/react/menu`

**Available components:**
- `Button` — Actions with variants and sizes
- `Badge` — Labels and status indicators
- `Card` — Content containers (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- `Input` — Text inputs with variants
- `FormField` — Form field wrapper with label, icon, error state, password toggle
- `Avatar` — User avatars (Avatar, AvatarImage, AvatarFallback, AvatarBadge, AvatarGroup)
- `Separator` — Visual dividers
- `ResponsiveModal` — Modal that adapts to mobile (bottom sheet) and desktop (centered dialog)
- `ImageUpload` — Drag-and-drop image uploader with `existingUrl` prop for edit mode
- `Textarea` — Multiline text input
- `Dialog`, `Sheet`, `DropdownMenu`, `Select`, `Tabs`, `Table`, `Label`

**Variant examples:**
- `Button` variants: `primary`, `secondary`, `tertiary`, `outline`, `outline_primary`, `ghost`, `link`, `toolbar`
- `Button` sizes: `default`, `sm`, `lg`, `xl`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`, `icon-xl`
- `Badge` variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `hero`, `success`, `warning`, `muted`
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
- **Never edit applied migrations:** If a migration needs changes, write a new one. Editing applied migrations causes irreversible conflicts.

**Schema Cache Gotcha (PostgREST):**
After applying migrations that add/rename columns, **the Supabase client (`@supabase/ssr`) may have a stale schema cache** from PostgREST introspection. Symptoms:
- INSERT/SELECT silently omits new columns (returns `null` for them in results)
- Queries with `.single()` fail with `PGRST116: Results contain 0 rows` because the filter column is null
- URL like `/panel/restaurants/undefined/menu` renders (template literal with null/undefined)

**Fix:** Restart the dev server (`Ctrl+C` + `npm run dev`) to refresh the schema cache. Required after any migration that adds columns.

## Storage

- **Restaurant + product images:** `Delivery Orihuela Bucket` (URL-encoded as `Delivery%20Orihuela%20Bucket`). Public read for authenticated users, admin+service_role manage.
- **Organization assets:** `organization-assets` bucket.
- Constraints: 512KB max, JPEG/PNG/WebP only.
- Path pattern: `${storeId}/cover.${ext}`, `${storeId}/logo.${ext}`, `${storeId}/products/${productId}.${ext}` (deterministic, used with `upsert: true`).
- RLS policies: see `supabase/migrations/20260615*_restaurant_images*.sql`.
- Helper `extractStoragePath(url)` in `lib/actions/stores.ts` and `lib/actions/products.ts` converts public URL back to storage path (handles URL encoding).

### Image Storage Layout

```
Delivery Orihuela Bucket/
  ${storeId}/
    cover.{jpg|png|webp}
    logo.{jpg|png|webp}
    products/
      ${productId}.{jpg|png|webp}
      ...
```

| Recurso | Path | Función de upload | Estable desde |
|---|---|---|---|
| Cover restaurante | `${storeId}/cover.{ext}` | `uploadRestaurantImage(folder="cover")` | creación de tienda |
| Logo restaurante | `${storeId}/logo.{ext}` | `uploadRestaurantImage(folder="logo")` | creación de tienda |
| Imagen de plato | `${storeId}/products/${productId}.{ext}` | `uploadProductImage` | creación del plato (id real) |

**Regla:** todo asset vive dentro de `${storeId}/...` (carpeta con id de la tienda). El `productId` se genera en el cliente con `crypto.randomUUID()` al abrir el formulario, de modo que el archivo y la fila en `products` nacen con el mismo id desde el primer momento — sin `tmp_`, sin renames, sin huérfanos.

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

## Patterns

### Slug Pattern
`lib/restaurants/slug.ts` exports:
- `slugify(text)` — lowercase, strip diacritics (`Café` → `cafe`), replace non-alphanumeric with hyphens, collapse, trim, max 60 chars. Falls back to `"restaurante"` if empty.
- `generateStoreSlug(name)` — `${slugify(name)}-${random4CharBase36Suffix}` for collision resistance (e.g., `la-cantina-abc1`).

Used in `StoresService.createStore` and `StoresService.updateStore` (regenerated on name change). Routes use `[slug]` (not UUID) for readable URLs.

### Multi-step Form (Create + Edit Reuse)
Components like `StoreForm` accept a `mode: "create" | "edit"` prop and `store?: StoreWithMetadata` for edit mode:
- Same form component reused (3 steps: `info` → `media` → `preview` → `success`)
- `useState` with lazy initializer: `useState<FormData>(() => mode === "edit" && store ? { ... } : { ... })`
- `key` prop on the inner form body for clean remount when switching between stores: `key={isEditing ? store?.id ?? "edit" : "create"}`
- After create: `router.refresh()` + show success step with "Crear otro" / "Cerrar"
- After edit: call `onSaved(updatedStore, newSlug?)` callback → parent updates its `currentStore` state
- `StoreFormModal` wraps with `ResponsiveModal`, supports both controlled (`open` + `onOpenChange`) and uncontrolled modes

### Image Upload (`ImageUpload` component)
`components/ui/image-upload.tsx` accepts:
- `value: File | null` — new file selected by the user
- `existingUrl?: string | null` — remote URL to display in edit mode (current bucket image)
- `aspectRatio?: "square" | "video" | "cover"` — controls the dropzone aspect ratio

Display logic:
- `displayUrl = filePreviewUrl ?? existingUrl ?? null`
- `<Image src={displayUrl} ... />` shows the file preview if new, otherwise the remote URL, otherwise empty state
- The X (remove) button **only renders when `value` is set** (a new file was uploaded) — clicking it reverts to `existingUrl` (clears the new file, does NOT remove the bucket image)
- Footer with file name + size only shows for new files; a "Imagen actual" badge replaces it when only `existingUrl` is set

Drop zone: `<div role="button" tabIndex={0}>` (NOT `<button>` — avoids button-in-button HTML error when nested in another button). Size cap: `max-h-32 sm:max-h-40` (no XL feel).

### Object URLs (`useObjectURL` hook)
`hooks/useObjectURL.ts` uses `useState` + `useEffect` (NOT `useMemo` — useMemo's cleanup is unreliable in React Strict Mode):
- Creates `URL.createObjectURL(file)` on mount/file change
- Calls `URL.revokeObjectURL(url)` on cleanup
- `// eslint-disable-next-line react-hooks/set-state-in-effect` on the specific lines that fire the rule (not blanket disable)

### Image Cleanup Pattern (Update / Delete)
**On update** (e.g., `updateStore`):
1. Upload new file first → `uploadedPaths.push(newPath)` (for rollback)
2. **If `newUrl !== oldUrl`** (different extension or different file), `oldPaths.push(extractStoragePath(oldUrl))`
3. `UPDATE` DB with new URL
4. If DB update succeeds → `deleteStorageObjects(oldPaths)` (cleanup old)
5. If DB update fails → `deleteStorageObjects(uploadedPaths)` (rollback new)

**On delete** (e.g., `deleteStore`):
1. `DELETE` DB row first
2. Extract paths from URLs of deleted store
3. `deleteStorageObjects(paths)` (cleanup)

Helper: `extractStoragePath(url)` in `lib/actions/stores.ts` converts public URL back to storage path (handles `Delivery%20Orihuela%20Bucket` URL encoding).

### Upsert Bug (CRITICAL)
`uploadRestaurantImage` uses `upsert: true` with deterministic path `${storeId}/${folder}.${extension}`. **If the user uploads a new file with the same extension as the old one (e.g., `cover.jpg` → `cover.jpg`), the same file is overwritten in place.**

**Bug:** Naively adding the old URL's path to `oldPaths` after upload will delete the new file you just uploaded.

**Fix:** Compare `newUrl !== current.cover_image_url` before pushing to `oldPaths`:
```ts
if (input.coverFile) {
  const { url, path, error } = await uploadRestaurantImage(...)
  if (error || !url || !path) { /* rollback new */ return { error } }
  coverImageUrl = url
  uploadedPaths.push(path)
  // Only mark old for deletion if the new file has a different path
  if (url !== current.cover_image_url) {
    const oldCoverPath = extractStoragePath(current.cover_image_url)
    if (oldCoverPath) oldPaths.push(oldCoverPath)
  }
}
```

### Restaurant Categories (Hardcoded)
- `lib/restaurants/categories.ts` — 14 hardcoded `RESTAURANT_CATEGORIES` (slugs + names)
- `parseCategoryIds(value)` — splits semicolon-separated string from DB, filters empty
- `serializeCategoryIds(ids)` — joins array with `;` for storage
- `getCategoryNames(ids)` — returns display names for a list of IDs
- Stored as `text` column on `stores` (no join table)

### Menu Categories (Hardcoded)
- `lib/restaurants/menu-categories.ts` — 6 hardcoded `MENU_CATEGORIES` (entradas, platos-fuertes, bebidas, postres, acompañamientos, ensaladas) with Lucide icons
- `parseCategoryOrder(value)` — splits semicolon string, validates against `MENU_CATEGORIES`, fills missing with defaults
- `serializeCategoryOrder(ids)` — joins valid IDs with `;`
- `getDefaultCategoryOrder()` — returns the 6 IDs in default order
- Stored as `text` column `menu_category_order` on `stores`

### Price Formatting
Prices stored as `bigint` cents in DB (`100` = `1€`). Display with EUR and locale `es-ES`:
- `lib/restaurants/menu-format.ts` exports:
  - `formatPriceCents(cents: number | bigint)` — uses `Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })` → returns e.g. `"1,50 €"`
  - `parsePriceEurosToCents(input: string)` — converts user input to integer cents

### Menu Editor (Drag & Drop)
`@dnd-kit/react@0.5.0` (new API) + `@dnd-kit/helpers@0.5.0` for `move`:
- `DragDropProvider` wraps the entire editor
- Categories have no `group`; products have `group: categorySlug` + `type/accept: "product"` (nested sortable)
- `useSortable` with `ref` prop only (no `attributes`/`listeners` like classic dnd-kit API)
- Multi-container moves via `move()` from `@dnd-kit/helpers` — splits in-category products, moves, merges back into target category
- 8 components in `components/admin/restaurants/menu/`: `MenuHeader`, `MenuCategoryFilter`, `MenuCategorySection`, `ProductCard`, `AddProductCard`, `ProductFormModal`, `MenuFooter`, `MenuEditor`

### Menu Editor — Persistence Model

**Regla:** la DB es la única fuente de verdad. Cada acción del CRUD de platos persiste inmediatamente — el botón "Guardar menú" solo sincroniza el orden.

| Acción del usuario | Persiste en DB | Storage |
|---|---|---|
| Añadir plato (form submit) | `INSERT products` (fila completa con `picture_url`) | Sube imagen → URL |
| Editar plato (form submit) | `UPDATE products` | Si hay imagen nueva: sube + borra la anterior |
| Eliminar plato | `DELETE products` | Borra imagen del storage |
| Drag & drop (mover/reordenar) | Solo state local | — |
| **Guardar menú** | `UPDATE stores.menu_category_order` + `UPDATE products.{menu_category, position}` | — |

**Generación de id:** al abrir el formulario para crear un plato, el cliente llama `crypto.randomUUID()`. Ese id se usa como nombre de archivo en storage (`${storeId}/products/${id}.${ext}`) Y como id de la fila al hacer INSERT. Imagen y fila nacen 1:1 — sin `tmp_`, sin renames.

**`saveMenuOrdering` (action de orden):**
- Recibe `{ categoryOrder: string[], productOrdering: { id, menu_category, position }[] }`
- **No** recibe los productos completos — solo metadata de orden
- **No** crea ni borra productos (ya se hizo en el momento)
- Solo `UPDATE stores.menu_category_order` y bulk-update de `menu_category`/`position` por producto

### DropdownMenu Fixes (Base-UI gotchas)
- **API:** `onClick` not `onSelect` (base-ui uses native React events). `onSelect` is silently ignored.
- **Cursor:** base-ui `MenuItem` renders `<div>` by default (not `<button>`), so `cursor-pointer` must be set explicitly. The shadcn/Radix default `cursor-default` does NOT work for clickable items.
- **Trigger:** `DropdownMenuTrigger` renders a `<button>` by default — has native cursor-pointer. Style with `className`.