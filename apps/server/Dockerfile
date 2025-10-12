# Dockerfile for Server (Proxy)
FROM node:22-alpine

WORKDIR /app

# Установка wget для health check
RUN apk add --no-cache wget

# Копируем package.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --production

# Копируем код
COPY . .

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "server.js"]

