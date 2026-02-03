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

# Render может монтировать репо в /app: при Root Directory "test2/backend" файлы оказываются в /app/backend/
CMD sh -c 'if [ -f /app/artisan ]; then d=/app; else d=/app/backend; fi && cd "$d" && php artisan migrate --force && (php artisan db:seed --force || true) && exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}'
