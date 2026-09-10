import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateCryptoConfig, getInternalApiKey, encryptBuffer, decryptBuffer } from '../utils/cryptoUtils.js';
import { checkStorageHealth } from '../utils/storageMonitor.js';

describe('Phase 10 — Production Readiness & Deployment Hardening', () => {
  it('validateCryptoConfig passes when ENCRYPTION_KEY is valid', () => {
    process.env.ENCRYPTION_KEY = 'lexora_production_grade_32byte_secret_encryption_key_2026_secure!';
    assert.doesNotThrow(() => validateCryptoConfig());
  });

  it('validateCryptoConfig fails when ENCRYPTION_KEY is too short', () => {
    process.env.ENCRYPTION_KEY = 'short_key';
    assert.throws(() => validateCryptoConfig(), /at least 32 characters/);
    process.env.ENCRYPTION_KEY = 'lexora_production_grade_32byte_secret_encryption_key_2026_secure!';
  });

  it('getInternalApiKey throws in production when INTERNAL_API_KEY is missing', () => {
    const oldKey = process.env.INTERNAL_API_KEY;
    const oldEnv = process.env.NODE_ENV;

    delete process.env.INTERNAL_API_KEY;
    process.env.NODE_ENV = 'production';

    assert.throws(() => getInternalApiKey(), /INTERNAL_API_KEY is required in production/);

    process.env.INTERNAL_API_KEY = oldKey || 'lexora_internal_api_secret_key_2026';
    process.env.NODE_ENV = oldEnv || 'development';
  });

  it('checkStorageHealth returns valid status object for db, uploads, and backups', () => {
    const health = checkStorageHealth();
    assert.ok(health.db);
    assert.ok(health.uploads);
    assert.ok(health.backups);
    assert.strictEqual(typeof health.db.sizeMb, 'number');
  });

  it('AES-256-GCM encryption round-trip matches original plaintext', () => {
    process.env.ENCRYPTION_KEY = 'lexora_production_grade_32byte_secret_encryption_key_2026_secure!';
    const plaintext = Buffer.from('LEXORA Judicial Evidence Security Verification 2026');
    const encrypted = encryptBuffer(plaintext);
    const decrypted = decryptBuffer(encrypted);
    assert.strictEqual(decrypted.toString('utf-8'), plaintext.toString('utf-8'));
  });
});
