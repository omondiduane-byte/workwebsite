---
kind: error_handling
name: Error Handling in Match & Market Frontend
category: error_handling
scope:
    - '**'
source_files:
    - src/supabase/dbService.ts
    - src/supabase/inquiryService.ts
    - src/supabase/supabaseClient.ts
    - src/lib/client.ts
    - src/lib/server.ts
    - src/App.tsx
---

This React + TypeScript SPA uses a mixed error-handling approach with no centralized error type system or global middleware. Errors are handled at three levels:

**1. Supabase client wrapper (dbService.ts)**
The `db` helper wraps all Supabase calls through a generic `handle<T>()` function that returns `{ data: T | null; error: Error | null }` tuples, converting any thrown value into an `Error`. This is the only place where errors are normalized to a consistent shape.

**2. Service layer inconsistency**
`inquiryService.ts` ignores the wrapper and directly `await`s Supabase calls, then `throw`s the error object when present — bypassing the tuple pattern established by `dbService.ts`.

**3. Component-level try/catch blocks**
`App.tsx` handles errors inline using `try/catch` blocks around async operations (auth, profile updates, data loading). Errors are converted to user-facing messages via a local `triggerToast()` function that displays transient notifications with types `'success' | 'error' | 'info'`. There is no central error logging or reporting mechanism.

**4. Environment validation**
`supabaseClient.ts` validates environment variables at module load time, logging errors via `console.error` and `console.warn` rather than throwing. The `debugSupabaseInfo()` function wraps URL parsing in try/catch for defensive logging.

**5. No global error boundaries**
There are no React Error Boundaries, no global `window.onerror` handlers, and no promise rejection listeners. Unhandled promise rejections would propagate as uncaught exceptions.

**Key conventions observed:**
- Errors from Supabase are treated as opaque objects with `.message` properties
- User-facing errors go through `triggerToast()` with explicit type annotations
- Development-time issues use `console.error`/`console.warn` rather than structured logging
- No custom error classes or error code constants exist
- The `db` wrapper's tuple pattern is not consistently applied across the codebase