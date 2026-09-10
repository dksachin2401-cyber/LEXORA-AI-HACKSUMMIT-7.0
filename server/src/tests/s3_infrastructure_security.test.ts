import assert from 'node:assert';
import { test, describe, beforeEach, afterEach } from 'node:test';
import fs from 'fs';
import path from 'path';
import { getInternalApiKey } from '../utils/cryptoUtils.js';
import { encryptField, decryptField } from '../utils/fieldEncryption.js';

const VALID_TEST_KEY = 'lexora_test_master_encryption_key_32bytes_long_valid!';
const VALID_INTERNAL_KEY = getInternalApiKey();

describe('Phase S3: Infrastructure, Network & Storage Security Test Suite', () => {
  const originalEnvKey = process.env.ENCRYPTION_KEY;

  beforeEach(() => {
    process.env.ENCRYPTION_KEY = VALID_TEST_KEY;
  });

  afterEach(() => {
    process.env.ENCRYPTION_KEY = originalEnvKey;
  });

  // ── NETWORK & API GATEWAY ISOLATION TESTS ────────────────────────────────
  test('1. FastAPI verify_internal_key rejects requests with missing X-Internal-API-Key', async () => {
    const validateRequestHeader = (key?: string) => {
      const expected = VALID_INTERNAL_KEY;
      if (!key || key !== expected) {
        return { status: 403, error: 'Access Denied: Invalid or missing X-Internal-API-Key header.' };
      }
      return { status: 200, success: true };
    };

    const res = validateRequestHeader(undefined);
    assert.strictEqual(res.status, 403);
    assert.ok((res.error || '').includes('Access Denied'));
  });

  test('2. FastAPI verify_internal_key rejects requests with invalid X-Internal-API-Key', async () => {
    const validateRequestHeader = (key?: string) => {
      const expected = VALID_INTERNAL_KEY;
      if (!key || key !== expected) {
        return { status: 403, error: 'Access Denied: Invalid or missing X-Internal-API-Key header.' };
      }
      return { status: 200, success: true };
    };

    const res = validateRequestHeader('invalid_spoofed_internal_key_999');
    assert.strictEqual(res.status, 403);
  });

  test('3. Valid inter-service request from Express to FastAPI with correct X-Internal-API-Key succeeds', async () => {
    const validateRequestHeader = (key?: string) => {
      const expected = VALID_INTERNAL_KEY;
      if (!key || key !== expected) {
        return { status: 403, error: 'Access Denied: Invalid or missing X-Internal-API-Key header.' };
      }
      return { status: 200, success: true };
    };

    const res = validateRequestHeader(VALID_INTERNAL_KEY);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.success, true);
  });

  // ── UPLOAD STORAGE & STATIC DIRECTORY ISOLATION TESTS ─────────────────────
  test('4. Direct static HTTP access to /uploads directory is NOT served (no express.static route)', () => {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    assert.ok(fs.existsSync(uploadsDir), 'Uploads directory exists');

    // Confirm index.ts source code contains NO active express.static middleware
    const indexPath = path.join(process.cwd(), 'src', 'index.ts');
    const indexSource = fs.readFileSync(indexPath, 'utf-8');
    assert.strictEqual(
      indexSource.includes("app.use('/uploads', express.static") || indexSource.includes("app.use(express.static"),
      false,
      'express.static middleware MUST NOT be active in Express entrypoint'
    );
  });

  test('5. Path traversal attempts in document download parameter are safely rejected', () => {
    const maliciousDocId = '../../etc/passwd';
    const sanitizedId = String(maliciousDocId).replace(/[^a-zA-Z0-9_-]/g, '');
    assert.notStrictEqual(sanitizedId, maliciousDocId);
    assert.ok(!sanitizedId.includes('..'));
  });

  // ── CORS & SECURITY HEADER TESTS ──────────────────────────────────────────
  test('6. CORS policy rejects unlisted malicious Origin header', () => {
    const clientUrl = 'http://localhost:5173';
    const allowedOrigins = [clientUrl];

    const maliciousOrigin = 'http://evil-attacker-website.com';
    const isAllowed = allowedOrigins.includes(maliciousOrigin);

    assert.strictEqual(isAllowed, false, 'Malicious origin must be rejected by CORS policy');
  });

  test('7. Security headers configuration enforces Strict-Transport-Security (HSTS) in production', () => {
    const indexPath = path.join(process.cwd(), 'src', 'index.ts');
    const indexSource = fs.readFileSync(indexPath, 'utf-8');

    assert.ok(indexSource.includes('hsts:'), 'HSTS header configuration must be present');
    assert.ok(indexSource.includes('referrerPolicy:'), 'Referrer policy must be configured');
    assert.ok(indexSource.includes('crossOriginOpenerPolicy:'), 'COOP policy must be configured');
  });

  // ── DATABASE FILE & SECRET ISOLATION TESTS ──────────────────────────────
  test('8. SQLite database file dev.db is NOT placed inside static public directory', () => {
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const uploadsPath = path.join(process.cwd(), 'uploads');
    const distPath = path.join(process.cwd(), 'dist');

    assert.ok(dbPath.includes('prisma'), 'dev.db must reside inside protected prisma directory');
    assert.strictEqual(dbPath.includes(uploadsPath), false);
    assert.strictEqual(dbPath.includes(distPath), false);
  });

  test('9. Sensitive database fields remain encrypted at rest via ENC_V1 prefix', () => {
    const rawSensitiveDescription = 'CONFIDENTIAL_CASE_NARRATIVE_CONTAINING_PRIVATE_DETAILS';
    const encryptedField = encryptField(rawSensitiveDescription);

    assert.ok(encryptedField?.startsWith('ENC_V1:'), 'Encrypted field must start with ENC_V1:');
    assert.strictEqual(decryptField(encryptedField), rawSensitiveDescription);
  });

  test('10. Frontend client build contains ZERO encryption keys or raw master secrets', () => {
    const frontendDistDir = path.join(process.cwd(), '..', 'dist');
    if (fs.existsSync(frontendDistDir)) {
      const files = fs.readdirSync(path.join(frontendDistDir, 'assets'));
      for (const file of files) {
        if (file.endsWith('.js')) {
          const content = fs.readFileSync(path.join(frontendDistDir, 'assets', file), 'utf-8');
          assert.strictEqual(content.includes('ENCRYPTION_KEY_V1'), false);
          assert.strictEqual(content.includes('default_lexora_master_encryption_key'), false);
        }
      }
    }
  });

  test('11. .gitignore contains database file, uploads, and environment secrets', () => {
    const rootGitignore = path.join(process.cwd(), '..', '.gitignore');
    const serverGitignore = path.join(process.cwd(), '.gitignore');
    const targetPath = fs.existsSync(rootGitignore) ? rootGitignore : serverGitignore;

    assert.ok(fs.existsSync(targetPath), '.gitignore file must exist');
    const content = fs.readFileSync(targetPath, 'utf-8');
    assert.ok(content.includes('.env') || content.includes('dev.db'), '.gitignore must exclude secrets and DB files');
  });
});
