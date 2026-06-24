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

`@dnd-kit` (drag & drop), `@tanstack/react-table`, `recharts`, `next-themes` (dark mode by default), `zod`, `sonner` (toasts), `vaul` (drawer), `lucide-react` + `@tabler/icons-react` (icons), `class-variance-authority` (variant props), `next-auth` (v5 beta, Credentials + JWT), `bcryptjs` (password hashing), `@prisma/adapter-pg` + `pg` (Postgres driver).

## Auth system

- **NextAuth v5** (`next-auth@5.0.0-beta.31`) with **Credentials** provider + **JWT** strategy (no database sessions)
- `src/lib/auth.ts` — config, `authorize` uses dynamic imports (`import("@root/lib/prisma")`, `import("bcryptjs")`) to avoid Edge Runtime crashes in middleware
- `app/api/auth/[...nextauth]/route.ts` — handler
- `components/shared/auth/providers.tsx` — SessionProvider wrapper
- `components/shared/auth/auth-modal.tsx` — client component: shows login form when logged out, user info + signOut when logged in
- `components/shared/header/header.tsx` — imports `AuthModal`
- `middleware.ts` — protects `/military/*`, `/bzvp/*` (redirects to `/` if unauthenticated)
- Two roles: `admin` (full access) / `user` (read-only — no "Нова анкета", no PDF export)
- Seed users: `admin@tracker.local` / `admin123` (admin), `user@tracker.local` / `user123` (user)

## Prisma 7

- Uses `@prisma/adapter-pg` + `pg` driver with `prisma.config.ts`
- `prisma/schema.prisma` — 8 models + `enum Role` (admin, user)
- All IDs are `autoincrement()` Int (1, 2, 3…) — NOT cuid
- Card sorting: `orderBy: { createdAt: "desc" }` (newest first)
- `prisma/seed.ts` — 10 military + 10 bzvp + 2 users

## Notes

- Locale is Ukrainian (`lang="ua"`, Cyrillic font subset, UI text in Ukrainian).
- No `.env` files are committed (`.env*` in `.gitignore`).
- `AUTH_SECRET` must be in `.env` for auth to work.

## Caveat: Next.js 16

This version has breaking changes from Next.js 14/15 — APIs, conventions, and file structure may differ from training data. Heed deprecation notices from the build/lint output.

### Known warnings (non-blocking)
- Edge Runtime: `node:path`/`node:url` imported via Prisma client in middleware — dynamic import in `authorize` keeps the app functional
- Middleware→Proxy deprecation: Next.js 16 prefers `proxy` file over `middleware.ts` (not migrated yet)
