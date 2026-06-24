#!/usr/bin/env bash
# setup-maestro.sh
# Installs Maestro CLI for E2E testing on the current platform.
# Requires: Java 11+, curl

set -euo pipefail

echo "=== Setting up Maestro for E2E Testing ==="

# Check Java
if ! command -v java &>/dev/null; then
  echo "ERROR: Java 11+ is required. Install OpenJDK and try again."
  exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 11 ]; then
  echo "ERROR: Java 11+ required. Found version: $(java -version 2>&1 | head -1)"
  exit 1
fi

echo "Java version OK."

# Determine platform
OS="$(uname -s)"
case "$OS" in
  Linux*)   PLATFORM="linux" ;;
  Darwin*)  PLATFORM="darwin" ;;
  MINGW*|MSYS*|CYGWIN*)  PLATFORM="windows" ;;
  *)
    echo "ERROR: Unsupported platform: $OS"
    exit 1
    ;;
esac

MAESTRO_VERSION="latest"
INSTALL_DIR="$HOME/.maestro/bin"

mkdir -p "$INSTALL_DIR"

echo "Downloading Maestro CLI..."
curl -fsSL "https://get.maestro.mobile.dev" | bash

echo ""
echo "=== Maestro installed successfully ==="
echo "Add this to your shell profile if not already added:"
echo "  export PATH=\"\$PATH\":\"\$HOME/.maestro/bin\""
echo ""
echo "Verify installation: maestro --version"
