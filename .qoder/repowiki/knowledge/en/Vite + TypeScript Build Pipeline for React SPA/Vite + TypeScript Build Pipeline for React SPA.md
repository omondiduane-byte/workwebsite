---
kind: build_system
name: Vite + TypeScript Build Pipeline for React SPA
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.ts
    - tsconfig.json
    - tsconfig.app.json
    - tsconfig.node.json
    - eslint.config.js
    - postcss.config.js
    - tailwind.config.cjs
---

The project uses a modern Vite-based build system for a React + TypeScript single-page application. The build pipeline is defined entirely through npm scripts and configuration files, with no Makefile, Dockerfiles, or CI/CD pipelines present in the repository.

**Build System Components:**
- **Vite (v8.1.1)** serves as the primary build tool and development server, configured via `vite.config.ts` with the React plugin
- **TypeScript (v6.0.2)** provides type checking and compilation through a multi-project setup with separate configs for app code (`tsconfig.app.json`) and Node/tooling code (`tsconfig.node.json`)
- **ESLint** with TypeScript ESLint and React plugins handles linting
- **Tailwind CSS v4** with PostCSS for styling, processed through `postcss.config.js`

**Build Scripts (package.json):**
- `dev`: Runs Vite development server
- `build`: First runs `tsc -b` for TypeScript project references build, then executes `vite build` for production bundling
- `lint`: Runs ESLint across the project
- `preview`: Serves the built output locally

**TypeScript Architecture:**
The project uses TypeScript's project references feature with a root `tsconfig.json` that references both `tsconfig.app.json` and `tsconfig.node.json`. Both configs use modern TypeScript features including `verbatimModuleSyntax`, `moduleDetection: "force"`, and `erasableSyntaxOnly`. The app config targets ES2023 with DOM types, while the node config targets ES2023 without DOM types for build tooling.

**Styling Pipeline:**
Tailwind CSS v4 is integrated through PostCSS with autoprefixer. The configuration scans `./src/**/*.{js,ts,jsx,tsx}` files for class usage and extends the theme with custom font families.

**No Containerization or CI:**
The repository contains no Dockerfiles, docker-compose files, GitHub Actions workflows, or other CI/CD configurations. There are also no Makefiles or shell build scripts beyond the npm scripts defined in package.json.