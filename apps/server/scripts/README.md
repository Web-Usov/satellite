# Скрипты Server

## Настройка

Создайте файл `.env` в директории `scripts/`:
```bash
DOCKER_USERNAME=webusov
```

## Доступные скрипты

### build-and-push.sh
Собирает Docker образ и публикует в Docker Hub

```bash
./build-and-push.sh
```

**Что делает:**
1. Загружает конфигурацию из `.env`
2. Читает версию из `package.json`
3. Добавляет метаданные (версия, дата, git commit)
4. Собирает Docker образ
5. Пушит образ в Docker Hub с тегами `latest` и `v{version}`

## Описание переменных

- `DOCKER_USERNAME` - Ваш username в Docker Hub
