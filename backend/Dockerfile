# Backend (Laravel) — для деплоя на Render / Railway
FROM php:8.2-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
    git unzip libzip-dev libpng-dev libsqlite3-dev \
    && docker-php-ext-install zip pdo pdo_sqlite \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

ENV COMPOSER_ALLOW_SUPERUSER=1
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-scripts

# Laravel требует bootstrap/cache (и storage) — создаём и даём права на запись
RUN mkdir -p bootstrap/cache storage storage/logs storage/framework/cache storage/framework/sessions storage/framework/views \
    && chmod -R 777 bootstrap/cache storage

# SQLite создаётся при старте; миграции и сиды — в start
RUN touch database/database.sqlite

EXPOSE 8000

# Поиск artisan и запуск (Render монтирует репо в /app; при ошибке — вывод структуры каталогов)
CMD sh -c 'd=; for p in /app /app/backend /app/test2/backend; do [ -f "$p/artisan" ] && d=$p && break; done; if [ -z "$d" ]; then echo "=== artisan not found ==="; ls -la /app 2>/dev/null; ls -la /app/backend 2>/dev/null; ls -la /app/test2 2>/dev/null; exit 1; fi; cd "$d" && php artisan migrate --force && (php artisan db:seed --force || true) && exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}'
