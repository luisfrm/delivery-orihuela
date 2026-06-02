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

**Component Structure:**
- `components/ui/` — shadcn/ui components (Button, Badge, Dialog, etc.)
- `components/home/` — Home page sections (HeroSection, PopularRestaurants, DailyOffersBanner)
- `components/layout/` — TopAppBar, BottomNav
- `components/modal/` — Modal components
- `components/forms/` — Form components

**Supabase Integration:**
- `lib/supabase/client.ts` — Browser client (use in Client Components)
- `lib/supabase/server.ts` — Server client (use in Server Components/Actions)
- `lib/supabase/service-role.ts` — Service role client (admin operations only)
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

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
- `cn()` — Class merging utility in `lib/utils.ts`
- `.plus-pattern` — Radial gradient background pattern

## Component Conventions

**Always use existing variants before creating new ones.** Check the component's `cva` definition first:

- `Button` variants: `primary`, `secondary`, `outline`, `ghost`, `toolbar`
- `Button` sizes: `default`, `sm`, `lg`, `xl`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`, `icon-xl`
- `Badge` variants: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`, `hero`

If no existing variant fits the use case, notify the user that a new variant must be created. Do not silently pick a wrong variant or apply arbitrary overrides that bypass the design system.

**Assets:** Store images in `/assets/` (not `/public/`). Import as modules:
```tsx
import heroImage from "@/assets/hero.webp"
<Image src={heroImage} alt="..." />
```

## Key Patterns

- Use `"use client"` directive for Client Components
- Responsive breakpoints: `md:` (768px), `lg:` (1024px)
- Layout uses `min-h-[max(884px,100dvh)]` for mobile-first viewport
- Body has `pt-[72px] pb-[80px]` for TopAppBar and BottomNav spacing
- BottomNav hidden on desktop: `lg:hidden`