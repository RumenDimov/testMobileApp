#!/usr/bin/env bash
# run-e2e.sh
# Builds the Expo app, installs on emulator, runs Maestro E2E tests.
#
# Usage:
#   ./e2e/scripts/run-e2e.sh [flow-name]
#
#   Without arguments: runs all flows in e2e/flows/
#   With flow name:    runs a specific flow (e.g., "onboarding")
#
# Prerequisites:
#   1. Android emulator running (or connected device)
#   2. Maestro CLI installed (see setup-maestro.sh)
#   3. Expo CLI and EAS CLI installed

set -euo pipefail

FLOW="${1:-}"
E2E_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_DIR="$(cd "$E2E_DIR/.." && pwd)"
MAESTRO_DIR="$E2E_DIR/.maestro"

echo "=== CarePractice E2E Test Runner ==="
echo "Project: $PROJECT_DIR"
echo ""

# Step 1: Check Android emulator/device
echo "[1/4] Checking Android device..."
DEVICES=$(adb devices -l 2>/dev/null | awk 'NR>1 && NF{count++} END{print count+0}')
if [ "$DEVICES" -eq 0 ]; then
  echo "ERROR: No Android device/emulator connected."
  echo "Start an emulator or connect a device with USB debugging enabled."
  exit 1
fi
echo "  Found $DEVICES device(s)."

# Step 2: Build the app
echo "[2/4] Building APK..."
cd "$PROJECT_DIR"

# Check if prebuild has been run (ios/android directories exist)
if [ ! -d "android" ]; then
  echo "  Running expo prebuild (first time)..."
  npx expo prebuild --platform android --clean
fi

# Build debug APK
echo "  Building debug APK..."
npx expo run:android --variant debug 2>&1 | tail -5
echo "  Build complete."

# Step 3: Install APK on device
echo "[3/4] Installing APK..."
APK_PATH=$(find android/app/build/outputs/apk/debug -name "*.apk" 2>/dev/null | head -1)
if [ -z "$APK_PATH" ]; then
  echo "ERROR: APK not found. Build may have failed."
  exit 1
fi
adb install -r "$APK_PATH" 2>&1
echo "  APK installed."

# Step 4: Run Maestro tests
echo "[4/4] Running Maestro tests..."
if [ -n "$FLOW" ]; then
  FLOW_FILE="$E2E_DIR/flows/$FLOW.yaml"
  if [ ! -f "$FLOW_FILE" ]; then
    echo "ERROR: Flow file not found: $FLOW_FILE"
    exit 1
  fi
  echo "  Running flow: $FLOW"
  maestro test "$FLOW_FILE" --config "$MAESTRO_DIR/config.yaml"
else
  echo "  Running all flows in $E2E_DIR/flows/"
  maestro test "$E2E_DIR/flows/" --config "$MAESTRO_DIR/config.yaml"
fi

echo ""
echo "=== E2E tests complete ==="
