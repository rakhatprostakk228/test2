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

# SQLite создаётся при старте; миграции и сиды — в start
RUN touch database/database.sqlite

EXPOSE 8000

# Render монтирует репо в /app: при Root "test2/backend" путь может быть /app/test2/backend
CMD sh -c 'for d in /app /app/backend /app/test2/backend; do [ -f "$d/artisan" ] && break; done && cd "$d" && php artisan migrate --force && (php artisan db:seed --force || true) && exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}'
