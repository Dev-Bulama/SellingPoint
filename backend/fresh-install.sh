#!/usr/bin/env bash
# =============================================================================
# Sellingpoint -- Fresh Local Development Setup
# =============================================================================
# WARNING: This script drops and recreates the database.
# FOR LOCAL / DEVELOPMENT ONLY. NEVER RUN IN PRODUCTION.
#
# Usage:
#   chmod +x fresh-install.sh
#   ./fresh-install.sh
# =============================================================================

set -euo pipefail

echo "========================================"
echo "  Sellingpoint -- Fresh Dev Install"
echo "  WARNING: Local/Dev use ONLY"
echo "========================================"
echo ""
read -p "This will DROP all database tables and reseed. Continue? [y/N] " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Install all dependencies (including dev)
echo "[1/8] Installing Composer dependencies..."
composer install --no-interaction

# 2. Copy .env if missing
if [ ! -f ".env" ]; then
  echo "[2/8] Creating .env from .env.example..."
  cp .env.example .env
  echo "      Edit .env with your database credentials, then re-run this script."
  exit 0
else
  echo "[2/8] .env already exists, skipping copy."
fi

# 3. Generate app key
echo "[3/8] Generating application key..."
php artisan key:generate

# 4. Clear caches
echo "[4/8] Clearing caches..."
php artisan optimize:clear 2>/dev/null || true

# 5. Fresh migration + seed
echo "[5/8] Running fresh migrations and seeders..."
php artisan migrate:fresh --seed --force

# 6. Create storage symlink
echo "[6/8] Creating storage symlink..."
php artisan storage:link 2>/dev/null || true

# 7. Set permissions
echo "[7/8] Setting permissions..."
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

# 8. Done
echo ""
echo "========================================"
echo "  Fresh install complete!"
echo ""
echo "  Admin panel: http://localhost:8000/admin"
echo "  Email:       admin@sellingpoint.com"
echo "  Password:    password"
echo ""
echo "  Start server: php artisan serve"
echo "========================================"
