#!/usr/bin/env bash
# =============================================================================
# Sellingpoint -- Production Deployment Script
# =============================================================================
# Run this on the production server after pulling latest code.
# Requires: PHP 8.2+, Composer, MySQL 8, a working .env file
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo "  Sellingpoint -- Production Deploy"
echo "========================================"

# 1. Enable maintenance mode
echo "[1/10] Enabling maintenance mode..."
php artisan down --message="Maintenance in progress. Back shortly." --retry=60 || true

# 2. Pull latest code
echo "[2/10] Pulling latest code..."
git pull origin main

# 3. Install PHP dependencies (no dev packages)
echo "[3/10] Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

# 4. Clear all caches
echo "[4/10] Clearing old caches..."
php artisan optimize:clear
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear

# 5. Run database migrations
echo "[5/10] Running migrations..."
php artisan migrate --force

# 6. Create storage symlink
echo "[6/10] Ensuring storage symlink..."
php artisan storage:link 2>/dev/null || true

# 7. Rebuild caches
echo "[7/10] Building production caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 8. Restart queue workers
echo "[8/10] Restarting queue workers..."
php artisan queue:restart

# 9. Set permissions
echo "[9/10] Fixing permissions..."
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# 10. Bring site back up
echo "[10/10] Disabling maintenance mode..."
php artisan up

echo ""
echo "========================================"
echo "  Deployment complete! Site is live."
echo "========================================"
