#!/usr/bin/env bash
# Setup swap on the server (e.g. for t2.small to avoid OOM).
# Run once on the server: sudo bash scripts/setup-server-swap.sh
# Or let GitHub Actions run it automatically during deploy.

set -e

SWAP_FILE="${SWAP_FILE:-/swapfile}"
SWAP_SIZE_GB="${SWAP_SIZE_GB:-2}"

if [ "$(id -u)" -ne 0 ]; then
  echo "This script should be run as root (sudo)."
  exit 1
fi

if swapon --show 2>/dev/null | grep -q .; then
  echo "Swap is already active:"
  swapon --show
  exit 0
fi

if [ -f "$SWAP_FILE" ]; then
  echo "Swap file $SWAP_FILE exists, enabling..."
  chmod 600 "$SWAP_FILE"
  swapon "$SWAP_FILE" || true
  if swapon --show | grep -q "$SWAP_FILE"; then
    echo "Swap enabled from existing file."
    if ! grep -q "^$SWAP_FILE " /etc/fstab 2>/dev/null; then
      echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
      echo "Added to /etc/fstab for reboot."
    fi
    exit 0
  fi
fi

echo "Creating ${SWAP_SIZE_GB}G swap file at $SWAP_FILE ..."
dd if=/dev/zero of="$SWAP_FILE" bs=1M count=$((SWAP_SIZE_GB * 1024)) status=progress
chmod 600 "$SWAP_FILE"
mkswap "$SWAP_FILE"
swapon "$SWAP_FILE"

if ! grep -q "^$SWAP_FILE " /etc/fstab 2>/dev/null; then
  echo "$SWAP_FILE none swap sw 0 0" >> /etc/fstab
  echo "Added to /etc/fstab for reboot."
fi

echo "Swap is now active:"
swapon --show
echo "Done."
