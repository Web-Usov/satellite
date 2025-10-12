# Satellite Pass Predictor - Техническое задание

## Описание проекта

**Satellite Pass Predictor** - это веб-приложение для прогнозирования проходов спутников над наземными станциями. Приложение позволяет пользователям добавлять спутники и наземные станции, а затем получать расписание всех проходов для каждой станции.

## Цели проекта

- Создать простой и интуитивный интерфейс для работы со спутниками и станциями
- Предоставить точное расписание проходов спутников
- Обеспечить быструю разработку с использованием готовых UI компонентов
- Создать переиспользуемую архитектуру с четким разделением ответственности

## Функциональные требования

### Основные функции

1. **Управление спутниками**
   - Добавление спутников по NORAD ID
   - Удаление спутников из списка

2. **Управление наземными станциями**
   - Добавление станций с параметрами (название, координаты, высота, минимальный угол возвышения)
   - Удаление станций
   - Валидация географических координат

3. **Расчет проходов**
   - Выполнение N×M запросов к API (N спутников × M станций)
   - Настройка периода прогнозирования (1-10 дней)
   - Отображение прогресса расчета
   - Обработка ошибок API

4. **Отображение результатов**
   - Группировка результатов по станциям
   - Сортировка проходов по времени
   - Отображение детальной информации о каждом проходе
   - Экспандируемые секции для каждой станции

### Дополнительные функции

- Сохранение настроек в localStorage
- Отображение популярных спутников с подсказками
- Валидация форм с информативными сообщениями об ошибках
- Responsive дизайн

## Технологический стек

### Core
- **React 19.2** - основная библиотека
- **TypeScript** - типизация
- **Vite** - сборщик и dev сервер
- **pnpm** - менеджер пакетов

### UI Framework
- **Material-UI v6** - основная UI библиотека
- **@mui/x-data-grid** - таблицы с расширенным функционалом
- **@mui/x-date-pickers** - компоненты для работы с датами
- **@mui/icons-material** - иконки

### State Management
- **Zustand** - управление состоянием
- **Zustand persist** - сохранение состояния
- **Zustand devtools** - отладка

### HTTP & Utilities
- **Axios** - HTTP клиент
- **Day.js** - работа с датами

### API
- **N2YO.com API** - источник данных о спутниках

## Архитектура приложения

### Структура проекта

```
src/
├── components/           # React компоненты
│   ├── ui/              # Переиспользуемые UI компоненты
│   ├── SatelliteInput/   # Управление спутниками
│   ├── StationInput/     # Управление станциями
│   ├── CalculateButton/  # Запуск расчетов
│   ├── StationSchedule/  # Отображение результатов
│   └── index.ts         # Реэкспорт компонентов
├── services/            # Бизнес-логика и API
│   ├── api/            # API клиенты
│   ├── utils/          # Утилитарные функции
│   └── index.ts        # Реэкспорт сервисов
├── stores/             # Zustand stores
│   ├── appStore.ts     # Главный store приложения
│   └── index.ts        # Реэкспорт stores
├── types/              # TypeScript типы
│   ├── satellite.ts    # Типы спутников
│   ├── station.ts      # Типы станций
│   ├── pass.ts         # Типы проходов
│   ├── api.ts          # API типы
│   └── index.ts        # Реэкспорт типов
├── constants/          # Константы приложения
│   ├── app.ts          # Конфигурация приложения
│   └── index.ts        # Реэкспорт констант
├── hooks/              # Кастомные хуки
│   ├── useLocalStorage.ts # Работа с localStorage
│   └── index.ts        # Реэкспорт хуков
├── App.tsx             # Главный компонент
└── main.tsx            # Точка входа
```

### Принципы архитектуры

1. **Модульность** - каждый компонент в отдельной папке с index.ts
2. **Переиспользуемость** - общие компоненты в папке ui/
3. **Типизация** - строгая типизация всех сущностей
4. **Разделение ответственности** - логика в services/, UI в components/
5. **Централизованное состояние** - Zustand store для всех данных

## Основные сущности

### Satellite (Спутник)
```typescript
interface Satellite {
  noradId: number;     // Уникальный идентификатор NORAD
  name: string;        // Название спутника
}
```

### GroundStation (Наземная станция)
```typescript
interface GroundStation {
  id: string;           // Уникальный идентификатор
  name: string;         // Название станции
  latitude: number;     // Широта (-90 до 90)
  longitude: number;    // Долгота (-180 до 180)
  altitude: number;     // Высота над уровнем моря (метры)
  minElevation: number; // Минимальный угол возвышения (градусы)
}
```

### PassData (Данные прохода)
```typescript
interface PassData {
  startUTC: number;        // Unix timestamp начала прохода
  maxUTC: number;          // Unix timestamp максимального возвышения
  endUTC: number;          // Unix timestamp окончания прохода
  maxEl: number;           // Максимальный угол возвышения (градусы)
  startAz: number;         // Азимут начала (градусы)
  maxAz: number;           // Азимут максимума (градусы)
  endAz: number;           // Азимут окончания (градусы)
  startAzCompass: string;  // Направление начала (N, NE, E, etc.)
  maxAzCompass: string;    // Направление максимума
  endAzCompass: string;    // Направление окончания
  satelliteName?: string;  // Название спутника (добавляется при обработке)
  stationId?: string;      // ID станции (добавляется при обработке)
  stationName?: string;    // Название станции (добавляется при обработке)
}
```

### StationSchedule (Расписание станции)
```typescript
interface StationSchedule {
  stationId: string;      // ID станции
  stationName: string;    // Название станции
  passes: PassData[];     // Массив всех проходов для этой станции
}
```

## N2YO API Integration

### Endpoint
`/radiopasses/{id}/{observer_lat}/{observer_lng}/{observer_alt}/{days}/{min_elevation}`

### Параметры запроса
- `id` - NORAD ID спутника
- `observer_lat` - широта наблюдателя
- `observer_lng` - долгота наблюдателя  
- `observer_alt` - высота наблюдателя (метры)
- `days` - количество дней прогноза (1-10)
- `min_elevation` - минимальный угол возвышения (градусы)

### Ответ API
```typescript
interface N2YOPassResponse {
  info: {
    satid: number;           // NORAD ID
    satname: string;         // Название спутника
    transactionscount: number; // Счетчик запросов
    passescount: number;     // Количество проходов
  };
  passes: PassData[];        // Массив проходов
}
```

### Лимиты API
- 1000 запросов в час на бесплатном тарифе
- Timeout: 10 секунд на запрос
- Задержка между запросами: 100мс

## UI/UX Requirements

### Layout
- **Single Page Application** - все функции на одной странице
- **Two-column layout** - ввод данных слева, результаты справа
- **Responsive design** - адаптация под мобильные устройства

### Components
- **Material Design** - следование принципам Material Design
- **Consistent spacing** - единообразные отступы
- **Loading states** - индикаторы загрузки для всех асинхронных операций
- **Error handling** - понятные сообщения об ошибках
- **Form validation** - валидация на клиенте с мгновенной обратной связью

### Interaction
- **Add/Remove patterns** - кнопки + и × для добавления/удаления элементов
- **Collapsible sections** - сворачиваемые секции для результатов
- **Sorting** - автоматическая сортировка проходов по времени
- **Progress indication** - показ прогресса при множественных API запросах

## План разработки

### Phase 1: Основа проекта
- [ ] Настройка Vite + React + TypeScript
- [ ] Установка и настройка Material-UI
- [ ] Создание структуры проекта
- [ ] Настройка TypeScript типов
- [ ] Создание констант и базовых утилит

### Phase 2: Базовые компоненты 
- [ ] Создание UI компонентов (LoadingSpinner, ErrorAlert)
- [ ] Компонент SatelliteInput с валидацией
- [ ] Компонент StationInput с формой
- [ ] Интеграция Zustand store
- [ ] Сохранение данных в localStorage

### Phase 3: API интеграция 
- [ ] Создание N2YO API клиента
- [ ] Компонент CalculateButton
- [ ] Обработка множественных API запросов
- [ ] Error handling и retry логика
- [ ] Индикация прогресса

### Phase 4: Отображение результатов 
- [ ] Компонент StationSchedule
- [ ] Таблица проходов с сортировкой
- [ ] Форматирование дат и времени
- [ ] Collapsible секции для станций
- [ ] Responsive layout

### Phase 5: Полировка 
- [ ] Финальная валидация и тестирование
- [ ] UI/UX улучшения
- [ ] Performance оптимизации
- [ ] Error handling edge cases
- [ ] Documentation

## Требования к разработке

### Code Quality
- Используйте TypeScript для всех файлов
- Создавайте index.ts файлы для реэкспорта в каждой папке
- Следуйте принципам SOLID
- Создавайте переиспользуемые функции и компоненты
- Добавляйте комментарии к сложной логике

### Error Handling
- Обрабатывайте все возможные ошибки API
- Показывайте понятные сообщения пользователю
- Логируйте ошибки в консоль для отладки
- Предусмотрите fallback состояния

### Performance
- Используйте React.memo для оптимизации рендеринга
- Дебаунс для пользовательского ввода
- Lazy loading для больших компонентов
- Минимизация API запросов

### Accessibility
- Proper ARIA labels для всех интерактивных элементов
- Keyboard navigation поддержка
- Screen reader compatibility
- Semantic HTML структура

### Environment
- Настройте environment variables для API ключей
- Создайте .env.example файл
- Добавьте .env в .gitignore
- Документируйте необходимые переменные окружения

## Решение CORS проблемы

### Проблема
N2YO API не поддерживает прямые запросы из браузера из-за политики CORS.

**Ошибка:**
```
Политика одного источника запрещает чтение удаленного ресурса на https://api.n2yo.com/...
(Причина: отсутствует заголовок CORS «Access-Control-Allow-Origin»)
```

### Решение для Development
Настроен Vite Proxy в `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api/n2yo': {
      target: 'https://api.n2yo.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/n2yo/, '/rest/v1/satellite'),
      secure: true,
    },
  },
},
```

### Решение для Production (Docker)
Создан Express.js прокси-сервер:

**Архитектура:**
```
Browser → :80 Frontend (Nginx + React)
             ↓ /api/*
             → :3001 Proxy (Node.js/Express)
                     ↓ HTTPS
                     → N2YO.com API
```

**Преимущества:**
- ✅ Нет CORS проблем
- ✅ API ключ скрыт на backend
- ✅ Готово к production
- ✅ Легко масштабируется

**Реализация:** 
- `proxy-server/server.js` - Express сервер
- `proxy-server/Dockerfile` - Docker образ
- `docker-compose.yml` - оркестрация сервисов
- `nginx.conf` - проксирование `/api/*` запросов

### Альтернативные решения
- **Netlify/Vercel Functions** - serverless функции
- **Cloudflare Workers** - edge computing
- **NGINX Reverse Proxy** - для VPS

⚠️ **Важно:** Никогда не используйте публичные CORS прокси в production из-за проблем с безопасностью, надежностью и производительностью.

---

Этот документ служит техническим заданием для разработки приложения. Следуйте описанной архитектуре и требованиям для создания качественного, поддерживаемого кода.