---
kind: frontend_style
name: Tailwind CSS + shadcn/ui Design System with Dark/Light Theme Tokens
category: frontend_style
scope:
    - '**'
source_files:
    - src/index.css
    - tailwind.config.cjs
    - components.json
    - postcss.config.js
    - src/components/ui/button.tsx
    - src/components/ui/card.tsx
    - style.css
    - src/App.css
---

The frontend styling system is built on Tailwind CSS v4 combined with the shadcn/ui component library, using CSS custom properties (design tokens) for theming and a dual dark/light mode strategy.

**Core stack and tooling**
- Tailwind CSS v4 via `@import "tailwindcss"` in `src/index.css`, processed through PostCSS (`postcss.config.js`) with `@tailwindcss/postcss` and autoprefixer.
- shadcn/ui configured via `components.json` with style `base-nova`, TypeScript (`tsx: true`), neutral base color, CSS variables enabled, and Lucide icons. The config points to `tailwind.config.cjs` and `src/index.css` as the Tailwind entry.
- Vite is the build tool; Tailwind content scanning covers `./index.html` and `./src/**/*.{js,ts,jsx,tsx}`.

**Design tokens and theming**
- All colors, radii, and semantic tokens are defined as CSS custom properties under `:root` and `.dark` selectors using OKLCH color space (e.g., `--background`, `--foreground`, `--primary`, `--destructive`, `--radius`).
- A `@theme inline` block maps shadcn/ui token names to these CSS variables, enabling theme switching by toggling the `.dark` class on the root element.
- Typography uses Inter as the sans font family extended in `tailwind.config.cjs`, while `src/index.css` also imports Geist Variable via `@fontsource-variable/geist`.

**Component styling approach**
- UI primitives live in `src/components/ui/` (button.tsx, card.tsx). They use `class-variance-authority` (cva) to generate variant/size combinations and `cn()` from `lib/utils` for conditional class merging.
- Buttons define variants (`default`, `outline`, `secondary`, `ghost`, `destructive`, `link`) and sizes (`default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`) composed entirely of Tailwind utility classes.
- Cards expose a composable API (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, `CardAction`) styled with Tailwind utilities and CSS variables for spacing.

**Global styles and visual identity**
- `src/index.css` defines global base styles via `@layer base` applying border, outline, background, and typography tokens uniformly.
- Custom utility classes implement a premium glassmorphism aesthetic: `.liquid-glass`, `.liquid-glass-heavy`, `.chrome-border`, `.chrome-gradient`, `.chrome-button`, plus a custom scrollbar design — all using backdrop-filter, gradients, and inset shadows.
- `style.css` (root-level) contains an alternate, lighter-themed stylesheet with its own glassmorphism system (`.glass-premium`, `.ios-fluid-bg`) and page-specific components (modals, hero grid, categories, cart, floating CTAs, M-Pesa dialog). This appears to be a separate or legacy style layer alongside the Tailwind-based one.
- `src/App.css` holds Vite template scaffolding styles (hero, counter, next-steps layout) that are not part of the production app's design system.

**Responsive strategy**
- Responsive breakpoints are applied inline via Tailwind utilities (e.g., `md:`, `lg:` prefixes) and media queries within component-scoped CSS where needed. No dedicated responsive configuration beyond Tailwind defaults is present.

**Conventions observed**
- New UI components should be placed under `src/components/ui/` and follow the cva + cn pattern used by existing primitives.
- Colors and semantic tokens must come from CSS variables rather than hardcoded values, ensuring dark/light mode consistency.
- Global overrides belong in `src/index.css`; per-component styles should prefer Tailwind utilities over custom CSS classes.