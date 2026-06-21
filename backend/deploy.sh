#!/bin/bash
# Sellingpoint Production Deployment Script

set -e

echo "🚀 Deploying Sellingpoint..."

# Maintenance mode
php artisan down --message="Updating, back shortly" --retry=60 || true

# Pull latest code
git pull origin main

# Install PHP dependencies (no dev, optimized)
composer install --no-dev --optimize-autoloader --no-interaction

# Run migrations
php artisan migrate --force

# Clear and rebuild caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Create storage symlink if not exists
php artisan storage:link 2>/dev/null || true

# Restart queue workers
php artisan queue:restart

# Come back online
php artisan up

echo "✅ Deployment complete!"
