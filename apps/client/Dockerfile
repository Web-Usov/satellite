# Multi-stage build for Client (Frontend)
FROM node:22-alpine AS builder

WORKDIR /workspace

# Устанавливаем pnpm
RUN npm install -g pnpm

# Копируем workspace конфигурацию
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Копируем package.json всех проектов
COPY apps/server/package.json ./apps/server/
COPY apps/client/package.json ./apps/client/

# Устанавливаем зависимости
RUN pnpm install --frozen-lockfile

# Копируем исходники клиента
COPY apps/client ./apps/client/

# Собираем
WORKDIR /workspace/apps/client
RUN pnpm build

# Production stage
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /workspace/apps/client/dist /usr/share/nginx/html

# Копируем конфигурацию Nginx
COPY apps/client/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

