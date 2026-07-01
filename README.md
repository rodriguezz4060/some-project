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
| PostgreSQL | — |
| NextAuth | v5 (beta) |
| **Детекція об'єктів** | |
| Python | 3.14 |
| FastAPI | 0.115 |
| Ultralytics (YOLO) | 8.4 (n), 26 (n/s) |
| SAHI | 0.11 |
| **Ключові бібліотеки** | |
| @react-pdf/renderer | Генерація PDF |
| xlsx | Excel імпорт/експорт |
| @dnd-kit | Drag & drop |
| @tanstack/react-table | Таблиці |
| recharts | Графіки |
| photoswipe | Галерея зображень |
| sonner | Сповіщення |

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
npm run dev          # dev-сервер (http://localhost:3000)
npm run build        # production build
npm run start        # запуск production-збірки
npm run lint         # ESLint (перед комітом)
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:studio    # prisma studio
npm run postinstall  # автоматично після npm install (prisma generate)
```

## Seed-користувачі

| Роль | Email | Пароль | Доступ |
|---|---|---|---|
| Адміністратор | `admin@tracker.local` | `admin123` | Повний доступ + управління користувачами |
| Модератор | `moderator@tracker.local` | `moderator123` | CRUD персоналу, перегляд адмін-панелі |
| Користувач | `user@tracker.local` | `user123` | Читання персоналу, без створення/видалення |

## Структура проєкту

```
app/                          # Next.js App Router сторінки
  military/                   #   військовий облік
  bzvp/                       #   БЗВП
  fuel/                       #   облік пального
  admin/                      #   адмін-панель (лог дій, користувачі)
  profile/                    #   профіль користувача
  api/
    auth/[...nextauth]/       #   NextAuth handler
    detect/                   #   проксі до Python-детектора
    bzvp-template/            #   генерація PDF шаблонів БЗВП
components/
  ui/                         # shadcn/ui примітиви
  shared/                     # компоненти застосунку
    auth/                     #   аутентифікація (NextAuth)
    military/                 #   військовий облік
    bzvp/                     #   БЗВП
    fuel/                     #   облік пального
    detection/                #   детекція об'єктів
prisma/
  schema.prisma               # схема БД (13 моделей + enum Role)
  seed.ts                     # seed-дані
src/
  actions/                    # Server Actions
    military.ts               #   військовий облік
    bzvp.ts                   #   БЗВП
    fuel.ts                   #   облік пального
    detection.ts              #   детекція об'єктів
    profile.ts                #   профіль користувача
    users.ts                  #   управління користувачами (admin)
    export-bzvp.ts            #   експорт БЗВП
    import-bzvp.ts            #   імпорт БЗВП (Excel)
  lib/
    auth.ts                   # NextAuth конфігурація
    prisma.ts                 # Prisma client
    utils.ts                  # cn() та інші утиліти
    audit.ts                  # система аудиту (лог дій)
    middleware-auth.ts         # NextAuth для Edge middleware (без провайдерів)
    detection-colors.ts        # кольори для детекції
    data/                     # дані для фільтрів/довідників
hooks/                        # кастомні React хуки (use-collapsed, use-debounce, use-mobile)
types/
  next-auth.d.ts               # розширення типів NextAuth (role, id)
proxy.ts                      # захист маршрутів (auth middleware)
```

## Система аутентифікації

- **NextAuth v5** з Credentials provider + JWT стратегією (без сесій у БД)
- Два екземпляри NextAuth: `auth.ts` (основний) та `middleware-auth.ts` (для Edge-сумісності, без провайдерів)
- Обидва мають `authorized` callback — інакше middleware не працює
- Три ролі: `admin`, `moderator`, `user`
- Middleware (`proxy.ts`) захищає маршрути:
  - `/military/*`, `/bzvp/*` — автентифікація обов'язкова
  - `/admin/*` — `admin` або `moderator`
  - `/fuel/*`, `/profile` — автентифікація обов'язкова
- Server Actions захищені — `requireModerator()` для створення/редагування, `requireAdmin()` для управління користувачами

## Адмін-панель

Модуль `/admin` — управління системою:

- **Журнал дій** (`/admin/logs`) — повний аудит всіх змін: дата, дія (створення/зміна/видалення), сутність, користувач, опис, деталі змін (до/після)
- **Користувачі** (`/admin/users`) — створення, редагування, видалення користувачів (тільки admin)

## Профіль користувача

Модуль `/profile` — особистий кабінет:

- Перегляд та редагування імені
- Зміна пароля
- Перегляд власних дій (аудит-лог)

## Облік пального

Модуль `/fuel` — облік видачі пального для автомобілів роти.

**Моделі БД:** `Vehicle` (транспортні засоби) та `FuelRecord` (заправки).

**Можливості:**
- Додавання/редагування/видалення автомобілів (марка, модель, держномер, тип пального, підрозділ)
- Фіксація заправок: дата, літри, ціна/л, вартість, пробіг, водій, накладна, постачальник
- Автоматичний розрахунок вартості
- Фільтр заправок за місяць/рік/довільний період
- Статистика на дашборді (загальні літри, витрати, к-сть заправок)
- Історія заправок для кожного авто
- Аудит всіх дій (лог адмін-панелі)

## Аудит (лог дій)

Всі дії користувачів (створення, оновлення, видалення) записуються в таблицю `AuditLog`:
- `action` — CREATE / UPDATE / DELETE
- `entityType` — назва моделі (MilitaryPersonnel, BzvpPersonnel, Vehicle, FuelRecord, User)
- `entityId` — ID запису
- `description` — текстовий опис змін
- `changes` — JSON з полями до/після (для UPDATE)
- `userId` — хто виконав дію

## Детекція об'єктів (Python)

Додаток має інтегрований детектор об'єктів на основі **YOLOv8n / YOLO26**, навчений на військових датасетах.

### Класи, що детектуються

| Клас | Об'єкти |
|------|---------|
| person | люди, солдати |
| tank | танки |
| vehicle | військова та цивільна техніка |
| aircraft | літаки, гелікоптери |

### Запуск Python-сервера

```bash
# 1. Активувати віртуальне середовище
cd detector
venv\Scripts\activate

# 2. Встановити залежності (при першому запуску)
pip install -r requirements.txt

# 3. Запустити сервер
python main.py
```

Сервер буде доступний на `http://localhost:8000`. Next.js звертається до нього через `/api/detect`.

### Структура папки `detector/`

```
detector/
  main.py                 # FastAPI сервер (SAHI + YOLO)
  train.py                # скрипт тренування на CPU (Roboflow)
  colab_train.ipynb       # Colab ноутбук для тренування на GPU
  requirements.txt        # залежності
  start-server.bat        # швидкий запуск (подвійний клік)
  best.pt                 # готова модель (YOLOv8n, military)
  yolo26n.pt              # YOLO26n nano (базова COCO)
  yolo26s.pt              # YOLO26s small (детальніша)
```

### Тренування власної моделі

1. Відкрити `detector/colab_train.ipynb` в [Google Colab](https://colab.research.google.com)
2. Виконати клітинки по порядку — датасети завантажаться автоматично з Kaggle + Roboflow
3. Після завершення завантажити `best.pt` і покласти в `detector/`

## Гіт-стратегія

1. `git checkout -b feature/nazva` — нова гілка для фічі
2. Працювати, комітити, пушити в гілку
3. `git checkout main && git pull`
4. `git merge feature/nazva --no-ff`
5. `git push origin main`
6. Видалити гілку
