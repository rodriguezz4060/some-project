# Personal Tracker – Agent Guide

## Quick start

```powershell
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm run start      # serve production build
npm run lint       # ESLint (v9) — run before committing
npm run db:migrate # prisma migrate dev
npm run db:seed    # prisma db seed
npm run db:studio  # prisma studio
```

Run `lint` before committing. There is no test framework, typecheck script, or CI.

## Tech stack

- **Next.js 16.2.9** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4** — uses `@import "tailwindcss"` (NOT old `@tailwind` directives)
- **shadcn/ui** with `radix-nova` style — components use `data-slot` attributes and `function` declarations
- **Radix UI** primitives through the `radix-ui` meta-package
- **Prisma 7** (`@prisma/adapter-pg` + `pg`) — PostgreSQL ORM
- **NextAuth v5** (beta) — Credentials + JWT auth

## Path aliases (tsconfig)

| Alias | Resolves to |
|-------|-------------|
| `@/*` | `./*` (project root) |
| `@root/*` | `./src/*` |

For the `cn()` utility, prefer `@root/lib/utils` (the prevalent pattern).

## Code conventions

- **`components/ui/`** — shadcn primitives (Button, Card, Input, etc.). Do NOT edit manually unless adding new primitives; regenerate with `npx shadcn add`.
- **`components/shared/{feature}/`** — feature-based subdirs (`auth/`, `military/`, `bzvp/`, `fuel/`, `detection/`).
- **`app/`** — Next.js App Router pages/layouts; route groups by feature (`/military`).
- UI components use `function Component()` syntax, `React.ComponentProps<"div">` for typing, and `data-slot="name"` attributes.
- **`"use client"`** — add **only** to components with React hooks, event handlers (`onClick`, `onSubmit`), or browser API. Pure render-only components (none of those) are Server Components — do NOT add `"use client"`.
- **Type augmentation:** `types/next-auth.d.ts` extends `User`, `Session.user`, and `JWT` with `role` and `id`.
- **Custom hooks:** `hooks/use-collapsed.ts`, `hooks/use-debounce.ts`, `hooks/use-mobile.ts`.

## Key libraries

`@dnd-kit` (drag & drop), `@tanstack/react-table`, `recharts`, `next-themes` (dark mode by default), `zod`, `sonner` (toasts), `vaul` (drawer), `lucide-react` + `@tabler/icons-react` (icons), `class-variance-authority` (variant props), `next-auth` (v5 beta, Credentials + JWT), `bcryptjs` (password hashing), `@prisma/adapter-pg` + `pg` (Postgres driver), `@react-pdf/renderer` (PDF), `xlsx` (Excel import/export), `photoswipe` (image gallery).

## Auth system

- **NextAuth v5** (`next-auth@5.0.0-beta.31`) with **Credentials** provider + **JWT** strategy (no database sessions)
- `src/lib/auth.ts` — config, `authorize` uses dynamic imports (`import("@root/lib/prisma")`, `import("bcryptjs")`) to avoid Edge Runtime crashes in middleware
- `src/lib/middleware-auth.ts` — separate NextAuth instance **without providers** for Edge Middleware (avoids Prisma import in Edge Runtime). Must have `authorized` callback
- `proxy.ts` — middleware file (Next.js 16 uses `proxy.ts` instead of `middleware.ts`). Wraps `auth` from `middleware-auth.ts`; protects `/military/*`, `/bzvp/*`, `/admin/*`, `/profile`, `/fuel/*` (redirects to `/` if unauthenticated)
- `app/api/auth/[...nextauth]/route.ts` — handler
- `components/shared/auth/providers.tsx` — SessionProvider wrapper
- `components/shared/auth/auth-modal.tsx` — client component: shows login form when logged out, user info + signOut when logged in
- `components/shared/header/header.tsx` — imports `AuthModal`
- `src/actions/users.ts` — admin-only user management (create, update, delete)
- Server actions (`military.ts`, `bzvp.ts`, `detection.ts`) — guarded with `requireModerator()` (admin/moderator only)
- Three roles: `admin` (full access + user management), `moderator` (can CRUD personnel), `user` (read-only for personnel, no create/delete)
- Seed users: `admin@tracker.local` / `admin123` (admin), `moderator@tracker.local` / `moderator123` (moderator), `user@tracker.local` / `user123` (user)

## Server Actions

- All mutations go through `src/actions/{feature}.ts`
- Guarded with `requireModerator()` — admin/moderator only for CRUD personnel
- `src/actions/users.ts` — admin-only (create, update, delete users)
- `src/actions/profile.ts` — user's own profile (no role guard)
- `src/actions/detection.ts` — photo upload + detection
- `src/actions/export-bzvp.ts` / `import-bzvp.ts` — Excel import/export
- All mutations logged via `src/lib/audit.ts`: `logCreate`, `logUpdate`, `logDelete`

## Feature module pattern

Each feature module (military, bzvp, fuel) follows:
- `components/shared/{feature}/types.ts` — TypeScript types
- `components/shared/{feature}/constants.ts` — constants
- `components/shared/{feature}/mock.ts` — mock seed data
- `src/lib/schemas/{feature}.ts` — Zod schemas for forms
- `src/lib/data/{feature}.ts` — server-side filters/queries

## Prisma 7

- Uses `@prisma/adapter-pg` + `pg` driver with `prisma.config.ts`
- `prisma/schema.prisma` — 13 models + `enum Role` (admin, user, moderator)
- Models: `MilitaryPersonnel`, `MedicalRecord`, `Achievement`, `Equipment`, `PositionEntry`, `ClothingSizes`, `BzvpPersonnel`, `User`, `Photo`, `Detection`, `Vehicle`, `FuelRecord`, `AuditLog`
- All IDs are `autoincrement()` Int (1, 2, 3…) — NOT cuid
- Card sorting: `orderBy: { createdAt: "desc" }` (newest first)
- `prisma/seed.ts` — 10 military + 10 bzvp + 3 users + vehicles + fuel records

## Notes

- Locale is Ukrainian (`lang="ua"`, Cyrillic font subset, UI text in Ukrainian).
- No `.env` files are committed (`.env*` in `.gitignore`).
- `AUTH_SECRET` must be in `.env` for auth to work.

## Caveat: Next.js 16

This version has breaking changes from Next.js 14/15 — APIs, conventions, and file structure may differ from training data. Heed deprecation notices from the build/lint output.

### Known warnings (non-blocking)
- Edge Runtime: `node:path`/`node:url` imported via Prisma client in middleware — dynamic import in `authorize` keeps the app functional

### Auth middleware architecture

- **`proxy.ts`** (root) — Next.js 16 middleware. Must be named `proxy.ts`, NOT `middleware.ts`
- **`src/lib/middleware-auth.ts`** — Edge-safe NextAuth instance (no providers, no Prisma). Both `auth.ts` and `middleware-auth.ts` must have an `authorized` callback — otherwise middleware silently fails and routes return 404
