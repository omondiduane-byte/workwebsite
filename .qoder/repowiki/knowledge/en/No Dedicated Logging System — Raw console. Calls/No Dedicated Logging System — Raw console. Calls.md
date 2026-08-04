---
kind: logging_system
name: No Dedicated Logging System — Raw console.* Calls
category: logging_system
scope:
    - '**'
source_files:
    - src/App.tsx
    - src/supabase/supabaseClient.ts
---

This repository does not implement a structured logging system. All log output is produced directly via the browser's native `console` API (`console.log`, `console.warn`, `console.error`, `console.info`) scattered throughout application code, primarily in `src/App.tsx` and `src/supabase/supabaseClient.ts`. There is no dedicated logger library (e.g., Winston, Pino, Bunyan), no centralized logging module, no log-level configuration, and no structured log fields or sinks. The only dev-only scripts that use `console.log` are temporary parse helpers (`.temp_parse_app.cjs`, `.temp_parse_app.js`, `tmp_parse.js`) used during build/tooling, not part of the runtime application.

Observed usage patterns:
- Debug/trace messages: `console.log("Attempting Supabase Auth login...")`, `console.log("Form submission started")`
- Error reporting: `console.error('Error signing out from Supabase:', e)`, `console.error(msg)`
- Warnings: `console.warn('Skipping password login and using legacy phone-based fallback.')`, `console.warn('Profile table update failed:', profileUpdateError.message)`
- Config diagnostics: `console.info('Supabase host:', host, 'anon key present:', !!supabaseAnonKey)`

There are no dependencies for logging in `package.json`, no environment variables controlling log verbosity, and no ESLint rules enforcing or banning specific log levels. Log output is unstructured plain text written to the browser console.