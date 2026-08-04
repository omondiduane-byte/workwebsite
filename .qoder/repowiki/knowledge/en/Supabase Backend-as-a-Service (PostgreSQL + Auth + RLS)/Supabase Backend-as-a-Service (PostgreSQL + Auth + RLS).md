---
kind: external_dependency
name: Supabase Backend-as-a-Service (PostgreSQL + Auth + RLS)
slug: supabase
category: external_dependency
category_hints:
    - vendor_identity
    - auth_protocol
    - client_constraint
scope:
    - '**'
source_files:
    - src/supabase/supabaseClient.ts
    - src/supabase/dbService.ts
    - src/supabase/inquiryService.ts
    - supabase_schema.sql
    - .env.example
---

### Identity & Role
- Supabase provides the PostgreSQL database, authentication, and Row Level Security (RLS) for the Match & Market platform. The project uses the `@supabase/supabase-js` client library.

### Integration Points
- Client initialization in `src/supabase/supabaseClient.ts` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment variables.
- A shared `db` wrapper in `src/supabase/dbService.ts` centralizes `select`, `insert`, `update`, `delete`, and `rpc` calls against Supabase tables.
- Table schema is defined in `supabase_schema.sql` and must be executed in the Supabase SQL Editor to create/align all tables and RLS policies.

### Durable Usage Model
- Environment variables: `VITE_SUPABASE_URL` must be the project URL (`https://<project>.supabase.co`) — do NOT append `/rest/v1/`. `VITE_SUPABASE_ANON_KEY` is the anon key for client-side access.
- RLS policies are set to allow full CRUD for `anon`, `authenticated`, and `service_role` on all tables during development; tighten before production.
- All data operations go through the Supabase JS client; no direct REST calls are made.

### Key Tables
- `profiles` — user accounts (login/signup)
- `gas_predictions` — Gas-O-Meter smart tracker data
- `escrow_transactions` — payment holding ledger
- `delivery_jobs` — boda boda rider dispatch
- `vendors`, `menu_items` — marketplace stores and products
- `inquiries` — help/support messages with admin responses
- `vendor_approvals`, `rider_approvals` — registration request queues with login credentials
- `chama_deals` — bulk buying group purchases
- `banned_vendors` — store blacklist

Verify exact API/params against official Supabase docs.