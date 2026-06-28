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
  api/auth/[...nextauth]/     #   NextAuth handler
components/
  ui/                         # shadcn/ui примітиви
  shared/                     # компоненти застосунку
    auth/                     #   аутентифікація (NextAuth)
    military/                 #   військовий облік
    bzvp/                     #   БЗВП
prisma/
  schema.prisma               # схема БД (11 моделей)
  seed.ts                     # seed-дані
src/
  actions/                    # Server Actions
  lib/                        # утиліти, auth config, prisma client
proxy.ts                     # захист маршрутів (auth middleware)
```

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
