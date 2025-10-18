# Satellite Pass Predictor

Веб-приложение для прогнозирования проходов спутников над наземными станциями с использованием N2YO.com API.

## 📦 Структура монорепозитория

```
marsel/
├── apps/
│   ├── client/          # Frontend (React + TypeScript)
│   └── server/          # Backend Proxy (Node.js + Express)
├── docker-compose.yml   # Docker оркестрация
├── package.json         # Root workspace
└── README.md           # Этот файл
```

---

## 🚀 Быстрый старт

### Docker (рекомендуется)

```bash
# 1. Настройте API ключ
cp .env.docker .env

# 2. Запустите
docker-compose up -d --build

# 3. Откройте браузер
open http://localhost
```

### Разработка (pnpm workspaces)

```bash
# 1. Установите зависимости
pnpm install

# 2. Настройте переменные окружения
# Для клиента
echo "VITE_BACKEND_API_URL=http://localhost:3001/api/satellite" > apps/client/.env

# Для сервера
echo "N2YO_API_KEY=XE2AXJ-DZHKN8-WW968Z-5L0N" > apps/server/.env

# 3. Запустите оба приложения
pnpm dev

# Или по отдельности:
pnpm dev:client   # Frontend на :5173
pnpm dev:server   # Proxy на :3001
```

---

## 📋 Команды

### Разработка
```bash
pnpm dev           # Запустить client + server
pnpm dev:client    # Только client
pnpm dev:server    # Только server
```

### Сборка
```bash
pnpm build         # Собрать всё
pnpm build:client  # Только client
pnpm build:server  # Только server (нет сборки)
```

### Docker
```bash
pnpm docker:build  # Собрать образы
pnpm docker:up     # Запустить
pnpm docker:down   # Остановить
pnpm docker:logs   # Логи
```

### Утилиты
```bash
pnpm lint          # Линтинг всех проектов
pnpm lint:fix      # Автоисправление
pnpm type-check    # Проверка типов
pnpm clean         # Очистка node_modules и dist
```

---

## 🎯 Apps

### Client (Frontend)
- **Path:** `apps/client`
- **Tech:** React 19, TypeScript, Material-UI, Vite
- **Port:** 5173 (dev), 80 (production)
- **Commands:**
  ```bash
  cd apps/client
  pnpm dev      # Development
  pnpm build    # Production build
  ```

### Server (Proxy)
- **Path:** `apps/server`
- **Tech:** Node.js, Express, Axios
- **Port:** 3001
- **Commands:**
  ```bash
  cd apps/server
  pnpm dev      # Development with --watch
  pnpm start    # Production
  ```

---

## 🐳 Docker

### Архитектура
```
Browser → :80 Client (Nginx + React)
              ↓ /api/*
              → :3001 Server (Node.js/Express)
                      ↓ HTTPS
                      → N2YO.com API
```

### Команды
```bash
# Сборка и запуск
docker-compose up -d --build

# Остановка
docker-compose down

# Логи
docker-compose logs -f client
docker-compose logs -f server

# Статус
docker-compose ps

# Health check
curl http://localhost:3001/health
```

---

## 📦 Публикация образов

### Быстрая публикация
```bash
# Авторизуйтесь в Docker Hub
docker login

# Опубликуйте все образы
./build-and-push-all.sh YOUR_USERNAME
```

### По отдельности
```bash
# Client
./build-and-push.sh YOUR_USERNAME

# Server
cd apps/server
./build-and-push.sh YOUR_USERNAME
```

Подробнее в [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🔧 Конфигурация

### Environment Variables

**Client (`.env` в apps/client/):**
```env
VITE_BACKEND_API_URL=http://localhost:3001/api/satellite
```

**Server (`.env` в apps/server/):**
```env
N2YO_API_KEY=your_api_key
```

**Docker (`.env` в корне):**
```env
N2YO_API_KEY=your_api_key
```

### Получение API ключа
1. Зарегистрируйтесь на [N2YO.com](https://www.n2yo.com/)
2. Перейдите в [API раздел](https://www.n2yo.com/api/)
3. Запросите API ключ

**Лимиты:** 100 запросов/час на бесплатном тарифе

---

## 🛠 Технологии

### Monorepo
- **pnpm workspaces** - управление зависимостями
- **Turborepo-ready** - готово к интеграции Turborepo

### Client
- React 19.2, TypeScript 5.9
- Material-UI v7, Emotion
- Zustand (state), Axios (HTTP)
- Day.js (dates), Vite 7 (build)
- satellite.js (локальные расчеты орбит)

### Server
- Node.js 22, Express 4
- Axios (proxy), CORS middleware
- satellite.js (поддержка backend расчетов)

### DevOps
- Docker, Docker Compose
- Nginx (production)
- Health checks, Multi-stage builds

---

## 📚 Документация

- **[AGENTS.MD](./AGENTS.MD)** - Техническое задание для ИИ
- **[PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md)** - Анализ разработки
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Публикация Docker образов

---

## 🧪 Тестирование

```bash
# Health checks
curl http://localhost/
curl http://localhost:3001/health

# API test (TLE для ISS)
curl "http://localhost:3001/api/satellite/tle/25544"

# API test (проходы ISS над Москвой - старый метод)
curl "http://localhost:3001/api/satellite/radiopasses/25544/55.7558/37.6173/156/7/10"
```

---

## 📊 Метрики

| Компонент | Размер образа | RAM | CPU |
|-----------|---------------|-----|-----|
| Client | ~45 MB | 50 MB | 0.1 core |
| Server | ~85 MB | 100 MB | 0.1 core |
| **Итого** | **~130 MB** | **150 MB** | **0.2 core** |

---

## 🎯 Архитектура расчетов

### Режимы работы

Приложение поддерживает **3 режима расчета** (переключатель в левом сайдбаре):

#### 1. API TLE (рекомендуется, по умолчанию)
- Получение TLE через N2YO API + высокоточные локальные расчеты с satellite.js
- **API запросов:** N (где N - количество спутников)
- **Преимущества:** быстрее, точнее, меньше нагрузка на API
- **Процесс:**
  ```
  1. Для каждого спутника: GET /api/satellite/tle/{noradId}
  2. Кэширование TLE + satname
  3. Локальные расчеты SGP4/SDP4:
     - Шаг 5 секунд для обнаружения проходов
     - Бинарный поиск для уточнения времени (точность 0.1 сек)
     - Двухэтапный поиск максимума возвышения
     - Проход от горизонта (0°) до горизонта
     - Фильтрация по minElevation
  4. Сортировка результатов
  ```

#### 2. API Radio (классический метод)
- Прямые запросы проходов через N2YO API
- **API запросов:** N×M (где N - спутники, M - станции)
- **Преимущества:** проверенный метод, результаты от N2YO
- **Процесс:**
  ```
  1. Для каждой пары (спутник, станция):
     GET /api/satellite/radiopasses/{id}/{lat}/{lng}/{alt}/{days}/{minEl}
  2. Сортировка результатов
  ```

#### 3. Input TLE (скоро)
- Ручной ввод TLE для оффлайн расчетов
- Только локальные вычисления, без API запросов

### Сравнение режимов

| Параметр | API TLE | API Radio |
|----------|---------|-----------|
| **API запросов** | N | N×M |
| **Скорость** | Быстро | Медленно |
| **Расчет** | Локально | На сервере N2YO |
| **Кэширование** | ✅ Да | ❌ Нет |
| **Пример (3×5)** | 3 запроса | 15 запросов |

### Переключение режима

Используйте переключатель в левом сайдбаре:
- **API TLE** - высокоточные локальные расчеты (рекомендуется)
- **API Radio** - классический метод через N2YO API
- **Input TLE** - будет доступно позже

### Формат времени

Все даты и время отображаются в **UTC** (Coordinated Universal Time) для обеспечения единообразия между разными временными зонами

---

## 💡 Использование

### 1. Добавьте спутники
- Введите NORAD ID и название
- Или выберите популярные (ISS, Starlink, Hubble)

### 2. Добавьте станции
- Название, координаты (широта, долгота)
- Высота над уровнем моря
- Минимальный угол места (рекомендуется 10°)

### 3. Рассчитайте проходы
- Период: 1-10 дней (по умолчанию 7)
- Следите за прогрессом (загрузка TLE + локальные расчеты)

### 4. Изучите результаты
- Группировка по станциям
- Expandable секции
- Таблица с детальной информацией

---

## 🐛 Troubleshooting

### Workspace errors
```bash
pnpm install          # Переустановить зависимости
pnpm store prune      # Очистить кэш pnpm
```

### Docker issues
```bash
docker-compose down -v    # Полная остановка с volumes
docker system prune -a    # Очистка Docker
```

### API errors
- Проверьте API ключ в `.env`
- Проверьте лимиты (100 req/hour)
- Проверьте health: `curl localhost:3001/health`

---

## 📝 Лицензия

MIT

---

**Monorepo структура готова! 🚀**

Запустите:
```bash
pnpm install && pnpm dev
```

Или с Docker:
```bash
docker-compose up -d
```

Открывайте: **http://localhost** 🛰️✨
