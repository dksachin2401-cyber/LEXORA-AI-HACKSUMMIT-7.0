#!/usr/bin/env bash
set -euo pipefail

# LEXORA Backup Verification Script
if [ $# -lt 1 ]; then
  echo "Usage: $0 <path-to-encrypted-backup.enc>"
  exit 1
fi

BACKUP_FILE="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$ROOT_DIR/server"

if [ -f ".env" ]; source .env; fi

if [ -z "${BACKUP_ENCRYPTION_KEY:-}" ]; then
  echo "[ERROR] BACKUP_ENCRYPTION_KEY is missing."
  exit 1
fi

TEMP_DB="$(mktemp)"
trap 'rm -f "$TEMP_DB"' EXIT

node -e "
const fs = require('fs');
const crypto = require('crypto');
const backupKey = crypto.createHash('sha256').update(process.env.BACKUP_ENCRYPTION_KEY).digest();
const buffer = fs.readFileSync(process.argv[1]);

const iv = buffer.subarray(0, 12);
const tag = buffer.subarray(12, 28);
const ciphertext = buffer.subarray(28);

const decipher = crypto.createDecipheriv('aes-256-gcm', backupKey, iv);
decipher.setAuthTag(tag);
const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
fs.writeFileSync(process.argv[2], decrypted);
" "$BACKUP_FILE" "$TEMP_DB"

HEADER=$(head -c 16 "$TEMP_DB" || true)
if [[ "$HEADER" == "SQLite format 3"* ]]; then
  echo "BACKUP VERIFICATION: PASS"
  exit 0
else
  echo "BACKUP VERIFICATION: FAIL (Corrupt SQLite payload)"
  exit 1
fi
