#!/bin/sh
# Runs on every container start (web / worker / scheduler share this image).
# Env vars from Railway only exist at RUNTIME, so caching must happen here —
# never during `docker build`.
set -e

echo "[start-container] Caching config/routes/views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Re-link the public storage disk (legacy /storage/products/* files) since
# the container filesystem is not persisted between deploys on Railway.
php artisan storage:link || true

# Auto-migrate on boot. Only the "web" service should do this — set
# RUN_MIGRATIONS=false on the worker/scheduler Railway services to avoid
# multiple services racing to migrate at the same time on deploy.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    echo "[start-container] Running migrations..."
    php artisan migrate --force
fi

# Hand off to the process this service was started with. If no CMD/Custom
# Start Command was provided, default to `php artisan serve`, expanding
# $PORT natively in THIS shell — never via a quoted string passed through
# Docker CMD arrays or Railway's startCommand, since nested shell-quoting
# across those layers is what silently left "${PORT:-8080}" unexpanded
# and made ServeCommand receive it as a literal string.
if [ "$#" -eq 0 ]; then
    exec php artisan serve --host=0.0.0.0 --port="${PORT:-8080}"
fi

exec "$@"
