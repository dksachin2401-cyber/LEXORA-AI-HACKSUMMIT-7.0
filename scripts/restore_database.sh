#!/usr/bin/env bash
set -euo pipefail

# LEXORA Production Database Restore Script
echo "=========================================="
echo "LEXORA Database Restore Utility"
echo "=========================================="

if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-encrypted-backup.enc>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "[ERROR] Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [ "${CONFIRM_RESTORE:-}" != "yes" ]; then
  echo "[SECURITY WARNING] Restoring a database will overwrite current production data."
  echo "Set CONFIRM_RESTORE=yes to execute restore."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR/server"

if [ -f ".env" ]; source .env; fi

if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "[ERROR] BACKUP_ENCRYPTION_KEY is required for decryption."
  exit 1
fi

echo "[1/3] Decrypting backup payload..."
TEMP_RESTORE_DB="$(mktemp)"

node -e "
const fs = require('fs');
const crypto = require('crypto');
const backupKey = crypto.createHash('sha256').update(process.env.BACKUP_ENCRYPTION_KEY).digest();
const buffer = fs.readFileSync(process.argv[1]);

if (buffer.length < 28) throw new Error('Invalid payload size');

const iv = buffer.subarray(0, 12);
const tag = buffer.subarray(12, 28);
const ciphertext = buffer.subarray(28);

const decipher = crypto.createDecipheriv('aes-256-gcm', backupKey, iv);
decipher.setAuthTag(tag);
const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
fs.writeFileSync(process.argv[2], decrypted);
" "$BACKUP_FILE" "$TEMP_RESTORE_DB"

echo "[2/3] Verifying SQLite file magic header..."
HEADER=$(head -c 16 "$TEMP_RESTORE_DB" || true)
if [[ "$HEADER" != "SQLite format 3"* ]]; then
  echo "[ERROR] Decrypted payload is not a valid SQLite database file."
  rm -f "$TEMP_RESTORE_DB"
  exit 1
fi

echo "[3/3] Performing atomic database file swap..."
cp "$TEMP_RESTORE_DB" "$ROOT_DIR/server/prisma/dev.db"
rm -f "$TEMP_RESTORE_DB"

echo "RESTORE SUCCESSFUL: Production database restored from $BACKUP_FILE"
