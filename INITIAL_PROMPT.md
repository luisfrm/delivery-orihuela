# Project Context
Act as a Senior Full-Stack Developer and Software Architect expert in Next.js 16 (App Router, TS), Supabase (via Supabase CLI), and Tailwind CSS, SHADCN.
We are building "Delivery LosLatinos", a concierge/delivery web application with an integrated admin panel.
The UI adheres to a clean, modern, and responsive design system.

# Architecture & Tech Stack
- **Framework:** Next.js 16 (App Router).
- **Database & Auth:** Supabase (PostgreSQL, Google/Email Auth, RLS). All DB changes must be generated as Supabase CLI migration files (`.sql`).
- **Styling:** Tailwind CSS.
- **Routing Structure (Route Groups):**
  - `/(client)`: Public routes and user profile (`/`, `/profile`).
  - `/(admin)`: Protected admin routes (`/panel`, `/panel/users`, `/panel/orders`).
- **Security:** Next.js Middleware to protect `/panel` by verifying the user's role in the database session.

# Database Schema
Generate the Supabase CLI migration scripts and TypeScript types for the following schema. Ensure proper Foreign Keys, UUIDs, and Timestamps (`created_at`, `updated_at`).

1. **user_profiles:** (1:1 with auth.users)
   - id (UUID, PK, FK to auth.users.id)
   - first_name (text), last_name (text), phone (text)
   - role (enum: 'admin', 'driver', 'user') - Default: 'user'
2. **user_addresses:**
   - id, user_id (FK), address_line, city, pickup_reference_notes, is_default (boolean)
3. **stores:**
   - id, name, address, phone
4. **categories:**
   - id, name, description
5. **products:**
   - id, store_id (FK), name, picture_url, estimated_price (numeric), is_active (boolean)
6. **product_categories:** (Pivot)
   - category_id (FK), product_id (FK)
7. **orders:**
   - id, client_id (FK to user_profiles), driver_id (FK to user_profiles, nullable), store_id (FK)
   - service_type (enum: 'buy_and_deliver', 'pickup_only')
   - status (enum: 'pending', 'assigned', 'at_store', 'on_the_way', 'delivered', 'cancelled')
   - pickup_reference (text, nullable) - Used when service_type is 'pickup_only'
   - items_estimated_cost (numeric)
   - delivery_fee (numeric)
   - total_amount (numeric)
8. **order_items:** (Only used if service_type is 'buy_and_deliver')
   - id, order_id (FK), product_id (FK), quantity (integer), estimated_unit_price (numeric)

# Core Workflows & Logic

1. **Auth Trigger:** Write the SQL trigger to automatically insert a row in `user_profiles` with role 'user' when a new account is created in `auth.users` (via Google or Email).
2. **Admin Bootstrapping (`/init`):** Logic to check if `user_profiles` is completely empty. If so, expose a secret `/init` route to register the first user and force the 'admin' role.
3. **Panel User Management:** Admins in `/panel` can register users and explicitly select their role (admin, driver, user).
4. **Client Hero Section:** The public landing page (`/`) features a Hero component with two primary actions:
   - **Buy (Comprar):** Opens a modal to select a store/products, triggering the 'buy_and_deliver' flow. The driver will purchase the items.
   - **Pickup (Recoger):** Opens a different modal to input the store and `pickup_reference` (receipt/invoice number), triggering the 'pickup_only' flow. The items are already paid for by the client.

# Immediate Task
1. Generate the exact `supabase/migrations/XXXXXXXXXXXXXX_initial_schema.sql` file containing all tables, enums, the auth trigger, and standard Row Level Security (RLS) policies.
2. Generate the initial Next.js folder structure implementing the Route Groups and the Middleware for role protection.