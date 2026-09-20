# Informational reference for the 3 Railway services that run from this
# same codebase/image. Railway's Dockerfile builder does NOT read this file
# automatically — each service's actual start command is configured in the
# Railway dashboard (Settings -> Deploy -> Custom Start Command), overriding
# the Dockerfile's default CMD. Kept here so the 3 roles are documented in
# one place and so this also works out-of-the-box if the project is ever
# built with Nixpacks instead of the Dockerfile.
web: php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
worker: php artisan queue:work --tries=3
scheduler: php artisan schedule:work
