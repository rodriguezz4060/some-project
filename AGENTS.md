# Personal Tracker – Agent Guide

## Quick start

```powershell
npm run dev      # dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint (v9) — run before committing
```

Run `lint` before committing. There is no test framework, typecheck script, or CI.

## Tech stack

- **Next.js 16.2.9** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** — uses `@import "tailwindcss"` (NOT old `@tailwind` directives)
- **shadcn/ui** with `radix-nova` style — components use `data-slot` attributes and `function` declarations
- **Radix UI** primitives through the `radix-ui` meta-package

## Path aliases (tsconfig)

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `./*` (project root) |
| `@root/*` | `./src/*` |

For the `cn()` utility, prefer `@root/lib/utils` (the prevalent pattern).

## Code conventions

- **`components/ui/`** — shadcn primitives (Button, Card, Input, etc.). Do NOT edit manually unless adding new primitives; regenerate with `npx shadcn add`.
- **`components/shared/`** — app-specific components (layout, feature components).
- **`app/`** — Next.js App Router pages/layouts; route groups by feature (`/military`).
- UI components use `function Component()` syntax, `React.ComponentProps<"div">` for typing, and `data-slot="name"` attributes.
- **`"use client"`** — add **only** to components with React hooks, event handlers (`onClick`, `onSubmit`), or browser API. Pure render-only components (none of those) are Server Components — do NOT add `"use client"`.

## Key libraries

`@dnd-kit` (drag & drop), `@tanstack/react-table`, `recharts`, `next-themes` (dark mode by default), `zod`, `sonner` (toasts), `vaul` (drawer), `lucide-react` + `@tabler/icons-react` (icons), `class-variance-authority` (variant props).

## Notes

- Locale is Ukrainian (`lang="ua"`, Cyrillic font subset, UI text in Ukrainian).
- No `.env` files are committed (`.env*` in `.gitignore`).

## Caveat: Next.js 16

This version has breaking changes from Next.js 14/15 — APIs, conventions, and file structure may differ from training data. Heed deprecation notices from the build/lint output.
