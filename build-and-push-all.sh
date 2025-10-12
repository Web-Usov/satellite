#!/bin/bash

# Build and Push All Images Script
set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Конфигурация
DOCKER_USERNAME="webusov"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 Satellite Pass Predictor - Публикация всех образов${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Docker Username: ${GREEN}${DOCKER_USERNAME}${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Засекаем время
START_TIME=$(date +%s)

# 1. Server
echo -e "${YELLOW}[1/2] Публикация Server...${NC}\n"
cd apps/server
./build-and-push.sh
cd ../..

echo ""
echo -e "${GREEN}✅ Server опубликован${NC}"
echo ""

# 2. Client
echo -e "${YELLOW}[2/2] Публикация Client...${NC}\n"
cd apps/client
./build-and-push.sh
cd ../..

echo ""
echo -e "${GREEN}✅ Client опубликован${NC}"
echo ""

# Подсчитываем время
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Итоговая информация
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Все образы успешно опубликованы!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n${YELLOW}⏱️  Время выполнения: ${DURATION}s${NC}\n"

echo -e "${YELLOW}📦 Опубликованные образы:${NC}"
echo "  1. ${DOCKER_USERNAME}/satellite-server:latest"
echo "  2. ${DOCKER_USERNAME}/satellite-server:v1.0.0"
echo "  3. ${DOCKER_USERNAME}/satellite-client:latest"
echo "  4. ${DOCKER_USERNAME}/satellite-client:v1.0.0"

echo -e "\n${YELLOW}🚀 Быстрый запуск:${NC}"
echo "  1. Скачайте docker-compose.yml из репозитория"
echo "  2. Создайте .env файл с N2YO_API_KEY"
echo "  3. Запустите: docker-compose up -d"

echo -e "\n${YELLOW}🔗 Docker Hub:${NC}"
echo "  Proxy:    https://hub.docker.com/r/${DOCKER_USERNAME}/satellite-proxy"
echo "  Frontend: https://hub.docker.com/r/${DOCKER_USERNAME}/satellite-client"

echo -e "\n${YELLOW}📝 Обновите docker-compose.yml:${NC}"
echo "  Замените 'build' на 'image: ${DOCKER_USERNAME}/satellite-...:latest'"

echo ""

