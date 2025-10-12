#!/bin/bash

# Client Build and Push Script
set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Определяем корень проекта (ищем pnpm-workspace.yaml)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
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
DOCKER_USERNAME="webusov"
IMAGE_NAME="satellite-client"
VERSION="1.0.0"
DOCKERFILE="$PROJECT_ROOT/apps/client/Dockerfile"
CONTEXT="$PROJECT_ROOT"
FULL_IMAGE="${DOCKER_USERNAME}/${IMAGE_NAME}"

echo -e "${GREEN}🚀 Сборка и публикация Frontend образа${NC}"
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

# Сборка образа
echo -e "\n${YELLOW}🔨 Сборка образа...${NC}"
docker build \
    -f "${DOCKERFILE}" \
    -t "${FULL_IMAGE}:latest" \
    -t "${FULL_IMAGE}:v${VERSION}" \
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
    echo -e "${GREEN}✅ Frontend образ успешно опубликован!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "\n${YELLOW}📋 Использование:${NC}"
    echo "  docker pull ${FULL_IMAGE}:latest"
    echo "  docker run -p 80:80 ${FULL_IMAGE}:latest"
    echo ""
    echo -e "${YELLOW}🔗 Docker Hub:${NC}"
    echo "  https://hub.docker.com/r/${FULL_IMAGE}"
else
    echo -e "${RED}❌ Ошибка при публикации образа${NC}"
    exit 1
fi

