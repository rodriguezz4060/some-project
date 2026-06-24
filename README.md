# Personal Tracker / Персональний трекер

## Технологічний стек

| Технологія | Версія |
|---|---|
| Next.js | 16 |
| React | 19 |
| TypeScript | 5 |
| Tailwind CSS | 4 |
| shadcn/ui | radix-nova |
| Prisma | 7 |
| PostgreSQL (через `@prisma/adapter-pg`) | — |
| NextAuth | v5 (beta) |

## Початок роботи

```bash
# 1. Встановити залежності
npm install

# 2. Налаштувати .env
cp .env.example .env  # або створити вручну:
# AUTH_SECRET=генерувати через npx auth secret
# DATABASE_URL=postgresql://user:pass@localhost:5432/tracker

# 3. Ініціалізувати БД та залити seed-дані
npx prisma migrate dev
npx prisma db seed

# 4. Запустити dev-сервер
npm run dev
```

## Скрипти

```bash
npm run dev      # dev-сервер (http://localhost:3000)
npm run build    # production build
npm run start    # запуск production-збірки
npm run lint     # ESLint (перед комітом)
```

## Seed-користувачі

| Роль | Email | Пароль |
|---|---|---|
| Адміністратор | `admin@tracker.local` | `admin123` |
| Користувач | `user@tracker.local` | `user123` |

## Структура проєкту

```
app/                          # Next.js App Router сторінки
  military/                   #   військовий облік
  bzvp/                       #   БЗВП
  api/auth/[...nextauth]/     #   NextAuth handler
components/
  ui/                         # shadcn/ui примітиви
  shared/                     # компоненти застосунку
    auth/                     #   аутентифікація (NextAuth)
    military/                 #   військовий облік
    bzvp/                     #   БЗВП
prisma/
  schema.prisma               # схема БД (7 моделей)
  seed.ts                     # seed-дані
src/
  actions/                    # Server Actions
  lib/                        # утиліти, auth config, prisma client
middleware.ts                 # захист маршрутів
```

## Гіт-стратегія

1. `git checkout -b feature/nazva` — нова гілка для фічі
2. Працювати, комітити, пушити в гілку
3. `git checkout main && git pull`
4. `git merge feature/nazva --no-ff`
5. `git push origin main`
6. Видалити гілку
