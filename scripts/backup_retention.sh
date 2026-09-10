#!/usr/bin/env bash
set -euo pipefail

# LEXORA Backup Retention Enforcement Script
# Deletes backups older than BACKUP_RETENTION_DAYS (default 30).
# Never deletes the sole available backup.

RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")/backups"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "No backups directory found at $BACKUP_DIR."
  exit 0
fi

echo "Enforcing backup retention policy ($RETENTION_DAYS days)..."

TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "*.enc" | wc -l)

if [ "$TOTAL_BACKUPS" -le 1 ]; then
  echo "Retention policy skipped: Only $TOTAL_BACKUPS backup exists. Solitary backups are protected."
  exit 0
fi

DELETED_COUNT=0
while IFS= read -r file; do
  # Double check total backups count before removing
  CURRENT_COUNT=$(find "$BACKUP_DIR" -name "*.enc" | wc -l)
  if [ "$CURRENT_COUNT" -gt 1 ]; then
    rm -f "$file"
    rm -f "${file%.enc}.manifest.json" 2>/dev/null || true
    echo "Removed stale backup: $(basename "$file")"
    DELETED_COUNT=$((DELETED_COUNT + 1))
  fi
done < <(find "$BACKUP_DIR" -name "*.enc" -mtime +"$RETENTION_DAYS")

echo "RETENTION CLEANUP: $DELETED_COUNT stale backup files removed."
