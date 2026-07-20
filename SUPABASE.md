Recommended Supabase setup and file flow

1) Environment variables
- Keep your Supabase credentials in the project root `.env` file (Vite loads root `.env`):
  - `VITE_SUPABASE_URL=https://<project-ref>.supabase.co` (DO NOT append `/rest/v1/`)
  - `VITE_SUPABASE_ANON_KEY=<anon-key>`

- Avoid duplicate/conflicting env files. Remove or update any other `.env` copies (e.g., `src/assets/.env`) so they match the root `.env` values.

2) Single shared client
- Use a single client instance exported from `src/supabaseClient.ts` (already present).
- Import it with `import { supabase } from './supabaseClient'` from your components/services.

3) Common issues and fixes
- Query returns `{ data: null, error: null }`:
  - This means the query succeeded but returned no rows. Confirm the row was actually inserted in your Supabase table (Studio) and that your `INSERT` didn't silently fail due to RLS.
  - If `INSERT` seems to run locally but `SELECT` returns nothing, check:
    - That you're using the same Supabase project URL and anon key for both operations.
    - Row Level Security (RLS) policies and table permissions for your anon key.
    - That the primary key and fields used for queries match the inserted payload (e.g., `username` vs `user_name`).

- Incorrect `VITE_SUPABASE_URL` value:
  - Do not set `VITE_SUPABASE_URL` to the REST endpoint (e.g. `https://...supabase.co/rest/v1/`). The client expects the project URL `https://<project>.supabase.co`.

4) Troubleshooting steps
- Check the effective values used by Vite at runtime with a console log in `src/supabaseClient.ts` (already added).
- Confirm the row exists using Supabase Studio or psql.
- If RLS is enabled, temporarily allow open inserts/selects for the anon role while developing, then tighten policies before production.

5) Next recommended changes (optional)
- Centralize types and table interfaces in `src/lib/types.ts`.
- Add a small `supabase` wrapper service (`src/services/supabaseService.ts`) to centralize common queries and handle retries/errors.

If you'd like, I can:
- Run a quick patch to centralize the client under `src/lib/` and update imports across the repo.
- Add a small helper to log the effective env values at runtime (non-sensitive parts) for debugging.

