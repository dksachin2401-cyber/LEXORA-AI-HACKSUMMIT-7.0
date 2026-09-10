#!/usr/bin/env bash
set -euo pipefail

# LEXORA Production Database Backup Script
echo "=========================================="
echo "LEXORA Database Backup Execution"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$ROOT_DIR/server"

if [ -f ".env" ]; source .env; fi

if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "[ERROR] BACKUP_ENCRYPTION_KEY environment variable is not set."
  exit 1
fi

echo "[1/2] Creating encrypted backup snapshot..."
npx tsx scripts/backup.ts

echo "[2/2] Backup pipeline complete."
echo "SUCCESS: Database backup created."
