---
kind: dependency_management
name: NPM-based dependency management with lockfiles and skill registry
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - skills-lock.json
    - .env.example
---

This repository uses the standard npm ecosystem for dependency management in a single-package React + TypeScript + Vite project.

**System/approach**
- Package manager: npm (lockfile format v3 via `package-lock.json`).
- Dependency declarations live in a single `package.json` at the repository root, split into `dependencies` (runtime) and `devDependencies` (build/tooling).
- A separate `skills-lock.json` pins AI agent skills sourced from GitHub (`supabase/agent-skills`), using a `sourceType: github` and a `computedHash` to ensure deterministic skill installs.

**Key files**
- `package.json` — declares all runtime and dev dependencies, plus npm scripts (`dev`, `build`, `lint`, `preview`).
- `package-lock.json` — npm lockfile pinning exact transitive versions and integrity hashes.
- `skills-lock.json` — deterministic pinning of Claude/Skills entries pulled from a GitHub source.
- `.env.example` — documents required environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`) consumed by the Supabase client.

**Architecture and conventions**
- Single-root monorepo layout: no `workspaces`, no `pnpm-workspace.yaml`, no `lerna`/`nx` — one `package.json` governs the whole app.
- Version ranges use caret (`^`) for most packages, allowing minor/patch updates while keeping major versions stable; TypeScript is pinned with tilde (`~6.0.2`) for stricter patch-level control.
- No vendoring strategy (no `node_modules` committed, no `vendor/` directory); dependencies are installed fresh from the npm registry per build.
- Environment-driven configuration: Supabase credentials are injected at build time through `VITE_*` prefixed env vars, not bundled into the codebase.

**Conventions and constraints**
- All third-party libraries are declared explicitly in `package.json`; there is no dynamic `require`/`import` of unpinned packages.
- The presence of `package-lock.json` enforces reproducible installs across environments.
- Skills are versioned deterministically via `skills-lock.json` with a computed hash, preventing drift in AI skill content.
- No private npm registry or proxy is configured in the visible files; packages resolve against the default public npm registry.