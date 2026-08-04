---
kind: configuration_system
name: Environment-Based Configuration with Vite and Supabase
category: configuration_system
scope:
    - '**'
source_files:
    - .env
    - .env.example
    - src/supabase/supabaseClient.ts
    - supabase/config.toml
    - vite.config.ts
---

The application uses a straightforward environment-variable-driven configuration system centered around Vite's `import.meta.env` mechanism and Supabase client initialization. There is no custom configuration loader, config file parser, or runtime configuration manager — configuration is loaded directly from `.env` files at build time.

**Configuration sources and loading:**
- `.env` (root) holds the actual runtime values: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and an optional `VITE_SUPABASE_PUBLISHABLE_KEY`.
- `.env.example` documents the required variables for new developers.
- Vite automatically exposes any `VITE_`-prefixed variables as `import.meta.env.*` in the browser bundle.
- The Supabase client is initialized in `src/supabase/supabaseClient.ts` by reading `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY` directly, with a validation function that checks both are present and warns if the URL incorrectly includes `/rest/v1/`.

**Supabase local development configuration:**
- `supabase/config.toml` is the canonical Supabase CLI configuration, defining project_id, API/db/auth/storage ports, JWT settings, email/SMS providers, edge runtime, analytics, and experimental features. It uses `env(...)` substitution for secrets (e.g., `openai_api_key = "env(OPENAI_API_KEY)"`).

**Build-time vs runtime separation:**
- Only variables prefixed with `VITE_` are exposed to the client-side code via Vite's env preprocessing; there is no server-side configuration layer since this is a frontend-only SPA.
- No feature flags, configuration schemas, or validation libraries are used beyond the simple presence check in `validateEnv()`.

**Conventions observed:**
- All client-facing configuration must be prefixed with `VITE_` to be injected into the browser bundle.
- Secrets are kept out of version control via `.gitignore`; only `.env.example` is committed as a template.
- Supabase credentials are split between a public anon key (for client) and an optional publishable key (for SSR/server helpers), documented in `.env.example`.