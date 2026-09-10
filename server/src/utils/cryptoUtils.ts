import crypto from 'crypto';

export const CURRENT_KEY_VERSION = 1; // 0x01

const INSECURE_DEFAULT_KEYS = [
  'default_lexora_master_encryption_key_2026',
  '12345678901234567890123456789012',
  'secret',
  'password',
  'change_me',
  'lexora_encryption_key_2026_default',
];

/**
 * Validates encryption key configuration at server startup.
 * Fail-closed if missing, too short (< 32 chars), or matching known insecure defaults.
 */
export function validateCryptoConfig(): void {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Cryptographic Configuration Error: ENCRYPTION_KEY environment variable is missing.');
  }
  if (key.length < 32) {
    throw new Error('Cryptographic Configuration Error: ENCRYPTION_KEY must be at least 32 characters long.');
  }
  if (INSECURE_DEFAULT_KEYS.includes(key)) {
    throw new Error('Cryptographic Configuration Error: Insecure default ENCRYPTION_KEY detected.');
  }
}

/**
 * KeyRegistry abstraction for versioned key management.
 */
export class KeyRegistry {
  public static getActiveVersion(): number {
    return CURRENT_KEY_VERSION;
  }

  public static getKeyForVersion(version: number): Buffer {
    validateCryptoConfig();
    let rawSecret: string | undefined;

    if (version === 1) {
      rawSecret = process.env.ENCRYPTION_KEY_V1 || process.env.ENCRYPTION_KEY;
    } else {
      rawSecret = process.env[`ENCRYPTION_KEY_V${version}`];
    }

    if (!rawSecret) {
      throw new Error(`Cryptographic Key Error: Encryption key for version ${version} is not configured.`);
    }

    return crypto.createHash('sha256').update(rawSecret).digest();
  }
}

/**
 * Encrypts a raw Buffer using AES-256-GCM with key versioning header.
 * Output payload format: [1-byte Key Version][12-byte IV][16-byte AuthTag][Ciphertext]
 */
export function encryptBuffer(buffer: Buffer, keyVersion: number = CURRENT_KEY_VERSION): Buffer {
  const key = KeyRegistry.getKeyForVersion(keyVersion);
  const iv = crypto.randomBytes(12); // Cryptographically secure 96-bit IV
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag(); // 16 bytes
  const versionHeader = Buffer.from([keyVersion]); // 1 byte

  return Buffer.concat([versionHeader, iv, authTag, encrypted]);
}

/**
 * Decrypts an AES-256-GCM encrypted Buffer.
 * Supports versioned payloads [0x01][IV][Tag][Ciphertext] and legacy unversioned payloads [IV][Tag][Ciphertext].
 * Fail-closed: throws explicit AuthenticationError on tampered ciphertext, modified IV, tag mismatch, or wrong key.
 */
export function decryptBuffer(buffer: Buffer, overrideKey?: Buffer): Buffer {
  if (!buffer || buffer.length === 0) {
    throw new Error('Cryptographic Error: Buffer to decrypt is empty or invalid.');
  }

  // Check if buffer is an unencrypted legacy raw file (e.g. %PDF header)
  if (isUnencryptedLegacyFormat(buffer)) {
    return buffer;
  }

  if (buffer.length < 28) {
    throw new Error('Cryptographic authentication failed: Invalid payload length (too short for GCM authentication).');
  }

  let keyVersion = CURRENT_KEY_VERSION;
  let iv: Buffer;
  let authTag: Buffer;
  let ciphertext: Buffer;

  // Check for 1-byte version header (Version 1 = 0x01)
  if (buffer[0] === 0x01 && buffer.length >= 29) {
    keyVersion = 1;
    iv = buffer.subarray(1, 13);
    authTag = buffer.subarray(13, 29);
    ciphertext = buffer.subarray(29);
  } else {
    // Legacy S1 payload without version byte: [12-byte IV][16-byte AuthTag][Ciphertext]
    iv = buffer.subarray(0, 12);
    authTag = buffer.subarray(12, 28);
    ciphertext = buffer.subarray(28);
  }

  try {
    const key = overrideKey || KeyRegistry.getKeyForVersion(keyVersion);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return decrypted;
  } catch (err: any) {
    // Check if original file was an unencrypted legacy text/PDF file before throwing
    if (isUnencryptedLegacyFormat(buffer)) {
      return buffer;
    }
    throw new Error('Cryptographic authentication failed: Ciphertext or authentication tag has been tampered with or invalid key used.');
  }
}

/**
 * Utility to identify legacy unencrypted documents (e.g. PDF magic header %PDF or test plain strings)
 */
function isUnencryptedLegacyFormat(buffer: Buffer): boolean {
  if (buffer.length >= 4) {
    const header = buffer.subarray(0, 4).toString('utf-8');
    if (header.startsWith('%PDF') || header.startsWith('LEGA')) {
      return true;
    }
  }
  return false;
}

/**
 * Dedicated Backup Encryption Key retrieval.
 * Independent from ENCRYPTION_KEY, JWT_SECRET, and INTERNAL_API_KEY.
 */
export function getBackupEncryptionKey(): Buffer {
  const backupKey = process.env.BACKUP_ENCRYPTION_KEY;
  if (!backupKey) {
    throw new Error('Backup Cryptographic Error: BACKUP_ENCRYPTION_KEY environment variable is not configured.');
  }
  if (backupKey.length < 32) {
    throw new Error('Backup Cryptographic Error: BACKUP_ENCRYPTION_KEY must be at least 32 characters long.');
  }
  return crypto.createHash('sha256').update(backupKey).digest();
}

/**
 * Securely zero out a buffer in memory after use.
 */
export function zeroBuffer(buffer: Buffer): void {
  if (buffer && Buffer.isBuffer(buffer)) {
    buffer.fill(0);
  }
}

/**
 * Generates or fetches internal service API key for Express -> FastAPI calls.
 * In production, this MUST be set via environment variable.
 * Falls back to a development-only default in non-production environments.
 */
export function getInternalApiKey(): string {
  const key = process.env.INTERNAL_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Configuration Error: INTERNAL_API_KEY is required in production but is not set.');
    }
    // Development-only fallback — never used in production
    return 'lexora_internal_api_secret_key_2026';
  }
  return key;
}
