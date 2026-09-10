import assert from 'node:assert';
import { test, describe, beforeEach } from 'node:test';
import { encryptBuffer, decryptBuffer, getInternalApiKey } from '../utils/cryptoUtils.js';

describe('Cryptographic Security Utilities Unit Tests', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = 'lexora_test_master_encryption_key_32bytes_long_valid!';
  });

  test('should correctly encrypt and decrypt raw buffer using AES-256-GCM', () => {
    const rawText = 'CONFIDENTIAL_JUDICIAL_RECORD_TOP_SECRET_12345';
    const plainBuffer = Buffer.from(rawText, 'utf-8');

    const encryptedBuffer = encryptBuffer(plainBuffer);

    // Encrypted buffer must be longer (1-byte Version + 12-byte IV + 16-byte AuthTag = 29-byte overhead)
    assert.strictEqual(encryptedBuffer.length, plainBuffer.length + 29);
    assert.notStrictEqual(encryptedBuffer.toString('hex'), plainBuffer.toString('hex'));

    const decryptedBuffer = decryptBuffer(encryptedBuffer);
    assert.strictEqual(decryptedBuffer.toString('utf-8'), rawText);
  });

  test('should return raw buffer as fallback if attempting to decrypt unencrypted legacy file', () => {
    const legacyRawText = 'LEGACY_UNENCRYPTED_PDF_FILE_HEADER_%PDF-1.4';
    const legacyBuffer = Buffer.from(legacyRawText, 'utf-8');

    const resultBuffer = decryptBuffer(legacyBuffer);
    assert.strictEqual(resultBuffer.toString('utf-8'), legacyRawText);
  });

  test('should produce non-empty internal API key for Express -> FastAPI authentication', () => {
    const key = getInternalApiKey();
    assert.ok(key && key.length > 10, 'Internal API key must be non-empty string');
  });
});
