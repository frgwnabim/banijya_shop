# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: Build frontend assets (Vite + React) — compiled ahead of time,
# production NEVER runs `npm run dev`.
# ---------------------------------------------------------------------------
FROM node:20-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY resources/ resources/
COPY vite.config.js jsconfig.json ./
COPY public/ public/
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Install PHP (Composer) dependencies without dev packages.
# ---------------------------------------------------------------------------
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --no-interaction \
        --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# ---------------------------------------------------------------------------
# Stage 3: Runtime image.
# ---------------------------------------------------------------------------
FROM php:8.2-cli-bookworm AS runtime

# System packages + PHP extensions actually used by the app:
# pdo_pgsql/pgsql (PostgreSQL), gd (Intervention Image), zip (dompdf/composer
# archives), bcmath (decimal money math), pcntl (graceful queue:work /
# schedule:work signal handling), exif (image orientation), opcache (perf).
# NOTE: Redis is accessed via the pure-PHP `predis/predis` package (already
# in composer.json / REDIS_CLIENT=predis), so the ext-redis PECL extension
# is NOT required.
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev \
        libzip-dev \
        libpng-dev \
        libjpeg62-turbo-dev \
        libfreetype6-dev \
        libonig-dev \
        unzip \
        git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" \
        pdo_pgsql \
        pgsql \
        gd \
        zip \
        bcmath \
        pcntl \
        exif \
        mbstring \
        opcache \
    && apt-get purge -y --auto-remove \
    && rm -rf /var/lib/apt/lists/*

# Basic production-leaning opcache config.
RUN { \
        echo 'opcache.enable=1'; \
        echo 'opcache.enable_cli=0'; \
        echo 'opcache.memory_consumption=128'; \
        echo 'opcache.max_accelerated_files=10000'; \
        echo 'opcache.validate_timestamps=0'; \
    } > /usr/local/etc/php/conf.d/opcache-recommended.ini

WORKDIR /var/www/html

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build

RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/start-container.sh /usr/local/bin/start-container.sh
RUN chmod +x /usr/local/bin/start-container.sh

USER www-data

# Railway assigns $PORT dynamically at runtime — not known at build time.
EXPOSE 8080

ENTRYPOINT ["start-container.sh"]
CMD ["sh", "-c", "php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
