import assert from 'node:assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  encryptBuffer,
  decryptBuffer,
  validateCryptoConfig,
  getBackupEncryptionKey,
  zeroBuffer,
  KeyRegistry,
  CURRENT_KEY_VERSION,
} from '../utils/cryptoUtils.js';
import { encryptField, decryptField } from '../utils/fieldEncryption.js';

const VALID_TEST_KEY = 'lexora_test_master_encryption_key_32bytes_long_valid!';
const ALTERNATE_TEST_KEY = 'lexora_alternate_master_key_32bytes_long_valid!';

describe('Phase S2: Data Protection & Key Management Security Suite', () => {
  const originalEnvKey = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = VALID_TEST_KEY;
  });

  afterEach(() => {
    process.env.ENCRYPTION_KEY = originalEnvKey;
  });

  // ── CRYPTO HARDENING TESTS ───────────────────────────────────────────────
  test('1. AES-256-GCM valid encrypt and decrypt round-trip', () => {
    const secretText = 'CONFIDENTIAL_COURT_TRANSCRIPT_SESSION_2026';
    const inputBuffer = Buffer.from(secretText, 'utf-8');

    const encrypted = encryptBuffer(inputBuffer);
    assert.ok(encrypted.length > inputBuffer.length);
    assert.strictEqual(encrypted[0], CURRENT_KEY_VERSION, 'First byte must be Key Version 1 (0x01)');

    const decrypted = decryptBuffer(encrypted);
    assert.strictEqual(decrypted.toString('utf-8'), secretText);
  });

  test('2. Modified ciphertext must be rejected with explicit authentication failure', () => {
    const encrypted = encryptBuffer(Buffer.from('TOP_SECRET_JUDICIAL_RECORD', 'utf-8'));
    // Flip a byte in the ciphertext portion (after 29-byte header)
    encrypted[32] ^= 0xff;

    assert.throws(
      () => decryptBuffer(encrypted),
      /Cryptographic authentication failed/
    );
  });

  test('3. Modified IV must be rejected with explicit authentication failure', () => {
    const encrypted = encryptBuffer(Buffer.from('TOP_SECRET_JUDICIAL_RECORD', 'utf-8'));
    // Flip a byte in IV (indices 1 to 12)
    encrypted[5] ^= 0xff;

    assert.throws(
      () => decryptBuffer(encrypted),
      /Cryptographic authentication failed/
    );
  });

  test('4. Modified authentication tag must be rejected with explicit authentication failure', () => {
    const encrypted = encryptBuffer(Buffer.from('TOP_SECRET_JUDICIAL_RECORD', 'utf-8'));
    // Flip a byte in Auth Tag (indices 13 to 28)
    encrypted[15] ^= 0xff;

    assert.throws(
      () => decryptBuffer(encrypted),
      /Cryptographic authentication failed/
    );
  });

  test('5. Decryption with wrong key must be rejected with explicit authentication failure', () => {
    const encrypted = encryptBuffer(Buffer.from('SENSITIVE_JUDICIAL_MEMO', 'utf-8'));
    const wrongKeyBuffer = crypto.createHash('sha256').update(ALTERNATE_TEST_KEY).digest();

    assert.throws(
      () => decryptBuffer(encrypted, wrongKeyBuffer),
      /Cryptographic authentication failed/
    );
  });

  test('6. Truncated encrypted file must be rejected with explicit error', () => {
    const shortBuffer = Buffer.from([0x01, 0x02, 0x03, 0x04]); // 4 bytes < 28 bytes required

    assert.throws(
      () => decryptBuffer(shortBuffer),
      /Cryptographic authentication failed: Invalid payload length/
    );
  });

  test('7. Missing ENCRYPTION_KEY must fail closed', () => {
    delete process.env.ENCRYPTION_KEY;

    assert.throws(
      () => validateCryptoConfig(),
      /ENCRYPTION_KEY environment variable is missing/
    );
  });

  test('8. Short ENCRYPTION_KEY (< 32 chars) must fail closed', () => {
    process.env.ENCRYPTION_KEY = 'short_key_12345';

    assert.throws(
      () => validateCryptoConfig(),
      /ENCRYPTION_KEY must be at least 32 characters long/
    );
  });

  test('9. Known insecure default ENCRYPTION_KEY must be rejected', () => {
    process.env.ENCRYPTION_KEY = 'default_lexora_master_encryption_key_2026';

    assert.throws(
      () => validateCryptoConfig(),
      /Insecure default ENCRYPTION_KEY detected/
    );
  });

  // ── KEY VERSIONING & LEGACY COMPATIBILITY ────────────────────────────────
  test('10. Encrypted payload includes version 1 header byte', () => {
    const encrypted = encryptBuffer(Buffer.from('CASE_EVIDENCE_DATA', 'utf-8'));
    assert.strictEqual(encrypted[0], 0x01);
  });

  test('11. Legacy unversioned S1 28-byte payload remains readable', () => {
    const key = crypto.createHash('sha256').update(VALID_TEST_KEY).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const rawText = 'LEGACY_S1_DOC_PRODUCED_BEFORE_HEADER_VERSIONING';
    const ciphertext = Buffer.concat([cipher.update(rawText, 'utf-8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // S1 Legacy Format: [12-byte IV][16-byte AuthTag][Ciphertext] = 28-byte header
    const legacyPayload = Buffer.concat([iv, tag, ciphertext]);

    const decrypted = decryptBuffer(legacyPayload);
    assert.strictEqual(decrypted.toString('utf-8'), rawText);
  });

  // ── DATABASE FIELD ENCRYPTION TESTS ─────────────────────────────────────
  test('12. Field encryption round-trip encrypts and decrypts correctly', () => {
    const plainBarId = 'BAR_COUNCIL_ID_MH_998822_CONFIDENTIAL';
    const encryptedField = encryptField(plainBarId);

    assert.ok(encryptedField?.startsWith('ENC_V1:'), 'Field must be prefixed with ENC_V1:');
    assert.notStrictEqual(encryptedField, plainBarId);

    const decryptedField = decryptField(encryptedField);
    assert.strictEqual(decryptedField, plainBarId);
  });

  test('13. Legacy plaintext database records are decrypted verbatim (seamless migration)', () => {
    const legacyPlaintext = 'LEGACY_UNENCRYPTED_BAR_ID_12345';
    const result = decryptField(legacyPlaintext);

    assert.strictEqual(result, legacyPlaintext);
  });

  test('14. Field encryption is idempotent (prevents double-encryption)', () => {
    const sensitiveData = 'JUDICIAL_DESCRIPTION_NOTE';
    const encryptedOnce = encryptField(sensitiveData);
    const encryptedTwice = encryptField(encryptedOnce);

    assert.strictEqual(encryptedOnce, encryptedTwice, 'Re-encrypting an encrypted string must return the exact same payload');
  });

  // ── BACKUP & MEMORY SAFETY TESTS ─────────────────────────────────────────
  test('15. Backup encryption key must be independent and fail closed if unconfigured', () => {
    delete process.env.BACKUP_ENCRYPTION_KEY;

    assert.throws(
      () => getBackupEncryptionKey(),
      /BACKUP_ENCRYPTION_KEY environment variable is not configured/
    );

    process.env.BACKUP_ENCRYPTION_KEY = 'lexora_backup_key_32bytes_long_valid_secret!';
    const keyBuf = getBackupEncryptionKey();
    assert.strictEqual(keyBuf.length, 32);
    delete process.env.BACKUP_ENCRYPTION_KEY;
  });

  test('16. zeroBuffer safely overwrites memory in place', () => {
    const buf = Buffer.from('CONFIDENTIAL_TEMPORARY_BUFFER_IN_RAM', 'utf-8');
    assert.notStrictEqual(buf.toString('utf-8'), '\0'.repeat(buf.length));

    zeroBuffer(buf);
    assert.strictEqual(buf.toString('utf-8'), '\0'.repeat(buf.length));
  });
});
