# Dockerfile for Server (Proxy)
FROM node:22-alpine

ARG VERSION=dev
ARG BUILD_DATE
ARG VCS_REF

LABEL org.opencontainers.image.title="Satellite Pass Predictor - Proxy Server" \
      org.opencontainers.image.description="N2YO API Proxy Server" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.revision="${VCS_REF}" \
      org.opencontainers.image.authors="webusov" \
      org.opencontainers.image.vendor="webusov" \
      maintainer="webusov"

ENV APP_VERSION=${VERSION}

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

