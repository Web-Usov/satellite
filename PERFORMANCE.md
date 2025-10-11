# Советы по оптимизации производительности

## Текущие оптимизации

### 1. Управление состоянием (Zustand)
- ✅ Используется Zustand для эффективного управления состоянием
- ✅ Persist middleware для сохранения данных в localStorage
- ✅ DevTools для отладки

### 2. API запросы
- ✅ Задержка 100мс между запросами для соблюдения лимитов API
- ✅ Обработка ошибок и retry логика
- ✅ Отображение прогресса выполнения
- ✅ Параллельные запросы с контролем

### 3. React оптимизации
- ✅ Использование React 19 с автоматическими оптимизациями
- ✅ Material-UI компоненты с встроенной оптимизацией

## Дополнительные оптимизации (опционально)

### 1. React.memo для компонентов

Оберните часто перерисовывающиеся компоненты в `React.memo`:

```typescript
export const SatelliteInput = React.memo(() => {
  // ...
});
```

### 2. useMemo для сложных вычислений

```typescript
const sortedPasses = useMemo(() => {
  return passes.sort((a, b) => a.startUTC - b.startUTC);
}, [passes]);
```

### 3. useCallback для функций-колбэков

```typescript
const handleAdd = useCallback(() => {
  // ...
}, [dependencies]);
```

### 4. Виртуализация больших списков

Для списков с большим количеством элементов используйте:
- `react-window` или `react-virtualized`
- Material-UI DataGrid уже включает виртуализацию

### 5. Lazy loading компонентов

```typescript
const StationSchedule = lazy(() => import('./components/StationSchedule'));

<Suspense fallback={<LoadingSpinner />}>
  <StationSchedule />
</Suspense>
```

### 6. Дебаунс для пользовательского ввода

```typescript
const debouncedValue = useDebounce(inputValue, 500);
```

### 7. Service Worker для кэширования

Добавьте PWA функционал с помощью `vite-plugin-pwa`:

```bash
pnpm add -D vite-plugin-pwa
```

### 8. Оптимизация бандла

В `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui': ['@mui/material', '@mui/icons-material'],
          'data-grid': ['@mui/x-data-grid'],
        }
      }
    }
  }
});
```

## Мониторинг производительности

### Chrome DevTools

1. Откройте DevTools (F12)
2. Перейдите на вкладку Performance
3. Запишите профиль во время работы с приложением
4. Проанализируйте узкие места

### React DevTools Profiler

1. Установите расширение React DevTools
2. Используйте Profiler для анализа рендеринга
3. Оптимизируйте компоненты с частой перерисовкой

### Lighthouse

```bash
npm install -g lighthouse
lighthouse http://localhost:5173 --view
```

## Метрики для отслеживания

- **First Contentful Paint (FCP)** - < 1.8s
- **Largest Contentful Paint (LCP)** - < 2.5s
- **Time to Interactive (TTI)** - < 3.8s
- **Total Blocking Time (TBT)** - < 200ms
- **Cumulative Layout Shift (CLS)** - < 0.1

## API оптимизации

### Кэширование ответов

```typescript
const cache = new Map();

async function getCachedPasses(key: string, fetcher: () => Promise<any>) {
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const data = await fetcher();
  cache.set(key, data);
  return data;
}
```

### Batch запросы

Группируйте запросы для одинаковых станций:

```typescript
const batchRequests = async () => {
  const requests = satellites.map(sat => 
    stations.map(station => 
      () => n2yoClient.getRadioPasses(sat.noradId, station, days)
    )
  ).flat();
  
  // Выполняйте по N запросов параллельно
  const BATCH_SIZE = 3;
  for (let i = 0; i < requests.length; i += BATCH_SIZE) {
    const batch = requests.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(fn => fn()));
  }
};
```

## Оптимизация localStorage

```typescript
// Используйте сжатие для больших объемов данных
import pako from 'pako';

const compressed = pako.deflate(JSON.stringify(data));
localStorage.setItem(key, btoa(String.fromCharCode(...compressed)));
```

## Рекомендации по хостингу

- **Netlify** - автоматический deploy из git
- **Vercel** - оптимизация для React приложений
- **GitHub Pages** - бесплатный хостинг
- **Cloudflare Pages** - CDN + бесплатный SSL

Все они поддерживают переменные окружения для API ключей.

