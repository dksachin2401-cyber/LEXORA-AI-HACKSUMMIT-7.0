import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getBackupEncryptionKey } from '../src/utils/cryptoUtils.js';

/**
 * Backup Pipeline Strategy:
 * Encrypts SQLite database using BACKUP_ENCRYPTION_KEY (AES-256-GCM)
 * and generates a SHA-256 integrity manifest.
 */
export async function createEncryptedBackup(): Promise<string> {
  const backupKey = getBackupEncryptionKey();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Backup Error: Database file not found at ${dbPath}`);
  }

  const dbBuffer = fs.readFileSync(dbPath);
  const sha256Plaintext = crypto.createHash('sha256').update(dbBuffer).digest('hex');

  // Encrypt database snapshot with dedicated BACKUP_ENCRYPTION_KEY using AES-256-GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', backupKey, iv);
  const encryptedDb = Buffer.concat([cipher.update(dbBuffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Encrypted Backup Format: [12-byte IV][16-byte Tag][Ciphertext]
  const backupPayload = Buffer.concat([iv, authTag, encryptedDb]);
  const targetFile = path.join(backupDir, `lexora_db_backup_${timestamp}.enc`);
  const manifestFile = path.join(backupDir, `lexora_db_backup_${timestamp}.manifest.json`);

  fs.writeFileSync(targetFile, backupPayload);

  const manifest = {
    timestamp: new Date().toISOString(),
    backup_file: path.basename(targetFile),
    db_path: 'prisma/dev.db',
    size_bytes: backupPayload.length,
    sha256_plaintext: sha256Plaintext,
    version: '1',
    algorithm: 'AES-256-GCM',
  };

  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2));

  console.log(`[BACKUP] Encrypted backup created: ${targetFile}`);
  console.log(`[BACKUP] Manifest created: ${manifestFile}`);
  return targetFile;
}

if (process.argv[1] && (process.argv[1].endsWith('backup.ts') || process.argv[1].endsWith('backup.js'))) {
  createEncryptedBackup().catch((err) => {
    console.error('[BACKUP ERROR]', err.message);
    process.exit(1);
  });
}
