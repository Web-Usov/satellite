# 🔒 Решение проблемы CORS

## Проблема

N2YO API не поддерживает прямые запросы из браузера из-за политики CORS (Cross-Origin Resource Sharing).

**Ошибка:**
```
Политика одного источника запрещает чтение удаленного ресурса на https://api.n2yo.com/...
(Причина: отсутствует заголовок CORS «Access-Control-Allow-Origin»)
```

---

## ✅ Решение для Development (Dev режим)

### Настроен Vite Proxy

В файле `vite.config.ts` настроен прокси-сервер:

```typescript
server: {
  proxy: {
    '/api/n2yo': {
      target: 'https://api.n2yo.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/n2yo/, '/rest/v1/satellite'),
    },
  },
}
```

**Как это работает:**
- В dev режиме запросы идут на `http://localhost:5173/api/n2yo/...`
- Vite перенаправляет их на `https://api.n2yo.com/rest/v1/satellite/...`
- Браузер думает, что запрос идет на тот же домен - нет CORS проблемы!

### Использование

После перезапуска dev сервера всё должно работать:

```bash
# Остановите текущий сервер (Ctrl+C)
# Запустите заново
pnpm dev
```

---

## 🚀 Решения для Production

Для продакшена нужно создать backend прокси. Вот несколько вариантов:

### Вариант 1: Serverless функция (рекомендуется)

#### Netlify Functions
```javascript
// netlify/functions/n2yo-proxy.js
exports.handler = async (event) => {
  const { path, apiKey } = event.queryStringParameters;
  const response = await fetch(`https://api.n2yo.com${path}?apiKey=${apiKey}`);
  const data = await response.json();
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};
```

#### Vercel Edge Functions
```typescript
// api/n2yo-proxy.ts
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get('path');
  const apiKey = url.searchParams.get('apiKey');
  
  const response = await fetch(`https://api.n2yo.com${path}?apiKey=${apiKey}`);
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Вариант 2: Express.js Backend

```bash
# Создайте отдельный backend
mkdir backend && cd backend
npm init -y
npm install express cors axios
```

```javascript
// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.get('/api/satellite/*', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.n2yo.com${req.path}${req.url.slice(req.path.length)}`
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Proxy running on :3001'));
```

### Вариант 3: Cloudflare Workers

```javascript
// worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const apiUrl = `https://api.n2yo.com${url.pathname}${url.search}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
```

### Вариант 4: NGINX Reverse Proxy

```nginx
location /api/n2yo/ {
    proxy_pass https://api.n2yo.com/rest/v1/satellite/;
    proxy_set_header Host api.n2yo.com;
    proxy_ssl_server_name on;
}
```

---

## 📝 Изменения в коде для Production

Если используете serverless функцию, измените API клиент:

```typescript
// src/services/api/n2yo.ts
const API_URL = import.meta.env.PROD 
  ? '/.netlify/functions/n2yo-proxy'  // или ваш endpoint
  : '/api/n2yo';
```

---

## 🔐 Безопасность

**⚠️ ВАЖНО:** В продакшене:
1. **Не храните API ключ в frontend коде**
2. **Используйте environment variables на backend**
3. **Добавьте rate limiting**
4. **Проверяйте источник запросов**

Пример для Netlify:
```javascript
// netlify/functions/n2yo-proxy.js
exports.handler = async (event) => {
  const API_KEY = process.env.N2YO_API_KEY; // Из Netlify env vars
  
  // Rate limiting
  // ...
  
  const response = await fetch(
    `https://api.n2yo.com${path}?apiKey=${API_KEY}`
  );
  // ...
};
```

---

## 🎯 Рекомендованная архитектура для Production

### Оптимальное решение: Netlify/Vercel + Functions

1. **Frontend (Vite)** → деплой на Netlify/Vercel
2. **Serverless Function** → обработка API запросов
3. **N2YO API** ← запросы только с backend

**Преимущества:**
- ✅ Нет CORS проблем
- ✅ API ключ скрыт
- ✅ Можно добавить кэширование
- ✅ Можно добавить rate limiting
- ✅ Бесплатно для небольших нагрузок

---

## 📊 Сравнение решений

| Решение | Сложность | Стоимость | Безопасность | Масштабируемость |
|---------|-----------|-----------|--------------|------------------|
| Vite Proxy (dev) | ⭐ | Бесплатно | ⚠️ Только dev | N/A |
| Netlify Functions | ⭐⭐ | Бесплатно* | ✅ | ⭐⭐⭐⭐ |
| Vercel Edge | ⭐⭐ | Бесплатно* | ✅ | ⭐⭐⭐⭐⭐ |
| Express Backend | ⭐⭐⭐ | От $5/мес | ✅ | ⭐⭐⭐ |
| Cloudflare Workers | ⭐⭐ | Бесплатно* | ✅ | ⭐⭐⭐⭐⭐ |

*В рамках free tier

---

## 🚦 Текущий статус

✅ **Dev режим:** Работает через Vite proxy  
⚠️ **Production:** Требуется настройка backend прокси

---

## 📚 Дополнительные ресурсы

- [Vite Server Proxy](https://vitejs.dev/config/server-options.html#server-proxy)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [CORS explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Для разработки сейчас всё работает! Для продакшена выберите один из вариантов выше.**

