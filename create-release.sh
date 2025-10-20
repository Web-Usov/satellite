#!/bin/bash

# Скрипт для создания релиза
# Использование: ./create-release.sh v1.4.0 "Описание изменений"

set -e

VERSION=$1
DESCRIPTION=$2

if [ -z "$VERSION" ]; then
    echo "❌ Ошибка: Укажите версию"
    echo "Использование: ./create-release.sh v1.4.0 \"Описание изменений\""
    exit 1
fi

if [ -z "$DESCRIPTION" ]; then
    echo "❌ Ошибка: Укажите описание"
    echo "Использование: ./create-release.sh v1.4.0 \"Описание изменений\""
    exit 1
fi

echo "🚀 Создание релиза $VERSION..."

# Проверяем, что мы в git репозитории
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Ошибка: Не в git репозитории"
    exit 1
fi

# Проверяем, что нет несохраненных изменений
if ! git diff-index --quiet HEAD --; then
    echo "❌ Ошибка: Есть несохраненные изменения. Сначала закоммитьте их."
    exit 1
fi

# Проверяем, что тег не существует
if git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo "❌ Ошибка: Тег $VERSION уже существует"
    exit 1
fi

echo "📝 Создание тега $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION: $DESCRIPTION"

echo "📤 Отправка тега на GitHub..."
git push origin "$VERSION"

echo "✅ Релиз $VERSION создан!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Перейдите на GitHub: https://github.com/web-usov/satellite-pass-predictor/releases"
echo "2. Найдите тег $VERSION и нажмите 'Edit'"
echo "3. Добавьте описание из CHANGELOG.md"
echo "4. GitHub Actions автоматически создаст архив релиза"
echo ""
echo "🎉 Релиз готов!"
