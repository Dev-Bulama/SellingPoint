#!/usr/bin/env bash
# =============================================================================
# Sellingpoint -- Android Release Build Script
# =============================================================================
# Builds a signed release APK and AAB (Android App Bundle) for Play Store.
#
# BEFORE RUNNING:
# 1. Generate a keystore (one-time, keep it safe forever):
#      keytool -genkeypair -v \
#        -keystore android/app/sellingpoint.keystore \
#        -alias sellingpoint \
#        -keyalg RSA -keysize 2048 \
#        -validity 10000
#
# 2. Add to android/gradle.properties:
#      MYAPP_RELEASE_STORE_FILE=sellingpoint.keystore
#      MYAPP_RELEASE_KEY_ALIAS=sellingpoint
#      MYAPP_RELEASE_STORE_PASSWORD=YOUR_STORE_PASSWORD
#      MYAPP_RELEASE_KEY_PASSWORD=YOUR_KEY_PASSWORD
#
# 3. Ensure android/app/build.gradle has the signingConfig (see ANDROID-BUILD.md).
#
# Usage:
#   chmod +x android-build.sh
#   ./android-build.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo "  Sellingpoint -- Android Release Build"
echo "========================================"

# 1. Install JS dependencies
echo "[1/5] Installing Node.js dependencies..."
npm install

# 2. Clean previous build artifacts
echo "[2/5] Cleaning previous Android build..."
cd android
./gradlew clean
cd ..

# 3. Build release APK (for direct installation / testing)
echo "[3/5] Building release APK..."
cd android
./gradlew assembleRelease
cd ..

APK_PATH="android/app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
  echo "      APK built: $APK_PATH"
fi

# 4. Build release AAB (for Play Store upload)
echo "[4/5] Building release AAB (Play Store)..."
cd android
./gradlew bundleRelease
cd ..

AAB_PATH="android/app/build/outputs/bundle/release/app-release.aab"
if [ -f "$AAB_PATH" ]; then
  echo "      AAB built: $AAB_PATH"
fi

echo ""
echo "[5/5] Build complete!"
echo ""
echo "========================================"
echo "  Output files:"
echo ""
echo "  APK (direct install):"
echo "  $APK_PATH"
echo ""
echo "  AAB (Google Play Store):"
echo "  $AAB_PATH"
echo ""
echo "  Upload the AAB to Google Play Console."
echo "========================================"
