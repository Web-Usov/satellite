#!/bin/bash

# Server Build and Push Script
set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Определяем директорию скрипта
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Загружаем переменные из .env файла если он существует
ENV_FILE="$SCRIPT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}📄 Загрузка конфигурации из .env...${NC}"
    set -a
    source "$ENV_FILE"
    set +a
else
    echo -e "${YELLOW}⚠️  Файл .env не найден в $SCRIPT_DIR${NC}"
    echo -e "${YELLOW}   Скопируйте .env.example в .env и настройте переменные${NC}\n"
fi

# Определяем корень проекта (ищем pnpm-workspace.yaml)
PROJECT_ROOT="$SCRIPT_DIR"

while [[ "$PROJECT_ROOT" != "/" ]]; do
    if [[ -f "$PROJECT_ROOT/pnpm-workspace.yaml" ]]; then
        break
    fi
    PROJECT_ROOT="$(dirname "$PROJECT_ROOT")"
done

if [[ ! -f "$PROJECT_ROOT/pnpm-workspace.yaml" ]]; then
    echo -e "${RED}❌ Ошибка: не найден корень проекта (pnpm-workspace.yaml)${NC}"
    exit 1
fi

# Конфигурация
DOCKER_USERNAME="${DOCKER_USERNAME:-webusov}"
IMAGE_NAME="satellite-server"
PACKAGE_JSON="$PROJECT_ROOT/apps/server/package.json"
DOCKERFILE="$PROJECT_ROOT/apps/server/Dockerfile"
CONTEXT="$PROJECT_ROOT/apps/server"
FULL_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}"

if [[ ! -f "$PACKAGE_JSON" ]]; then
    echo -e "${RED}❌ Ошибка: не найден package.json${NC}"
    exit 1
fi

VERSION=$(grep -oP '(?<="version":\s")[^"]+' "$PACKAGE_JSON")
if [[ -z "$VERSION" ]]; then
    echo -e "${RED}❌ Ошибка: не удалось прочитать версию из package.json${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Сборка и публикация Proxy Server образа${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Image: ${FULL_IMAGE}"
echo "Tags: latest, v${VERSION}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не установлен${NC}"
    exit 1
fi

# Проверка авторизации
echo -e "\n${YELLOW}🔐 Проверка авторизации в Docker Hub...${NC}"
if ! grep -q "index.docker.io" ~/.docker/config.json 2>/dev/null; then
    echo -e "${RED}❌ Не авторизован в Docker Hub${NC}"
    echo -e "${YELLOW}Запустите: docker login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Авторизация подтверждена${NC}"

# Получаем метаданные для сборки
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Сборка образа
echo -e "\n${YELLOW}🔨 Сборка образа...${NC}"
echo "  Версия: v${VERSION}"
echo "  Git commit: ${VCS_REF}"
echo "  Дата сборки: ${BUILD_DATE}"
docker build \
    -f "${DOCKERFILE}" \
    -t "${FULL_IMAGE}:latest" \
    -t "${FULL_IMAGE}:v${VERSION}" \
    --build-arg VERSION="${VERSION}" \
    --build-arg BUILD_DATE="${BUILD_DATE}" \
    --build-arg VCS_REF="${VCS_REF}" \
    --platform linux/amd64 \
    "${CONTEXT}"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Образ собран успешно${NC}"
else
    echo -e "${RED}❌ Ошибка при сборке образа${NC}"
    exit 1
fi

# Показываем информацию об образе
echo -e "\n${YELLOW}📦 Информация об образе:${NC}"
docker images "${FULL_IMAGE}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"

# Публикация
echo -e "\n${YELLOW}📤 Публикация образа в Docker Hub...${NC}"
docker push "${FULL_IMAGE}:latest"
docker push "${FULL_IMAGE}:v${VERSION}"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ Proxy образ успешно опубликован!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "\n${YELLOW}📋 Использование:${NC}"
    echo "  docker pull ${FULL_IMAGE}:latest"
    echo "  docker run -p 3001:3001 -e N2YO_API_KEY=your_key ${FULL_IMAGE}:latest"
    echo ""
    echo -e "${YELLOW}🔗 Docker Hub:${NC}"
    echo "  https://hub.docker.com/r/${FULL_IMAGE}"
    echo ""
    echo -e "${YELLOW}🚀 Деплой в Portainer:${NC}"
    echo "  ./deploy.sh"
else
    echo -e "${RED}❌ Ошибка при публикации образа${NC}"
    exit 1
fi

