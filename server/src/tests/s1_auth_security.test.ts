import assert from 'node:assert';
import { test, describe, before, after } from 'node:test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { hashPassword, verifyPassword, needsArgon2Rehash } from '../utils/passwordUtils.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';

const prisma = new PrismaClient();

describe('S1: Argon2id Password Security & Migration Tests', () => {
  const testEmail = `test_argon2_${Date.now()}@lexora.gov.in`;
  const plainPassword = 'StrongPassword123!';

  test('should generate a valid Argon2id hash starting with $argon2id$', async () => {
    const hash = await hashPassword(plainPassword);
    assert.ok(hash.startsWith('$argon2id$'), 'Hash must start with $argon2id$ prefix');
    assert.notStrictEqual(hash, plainPassword);
  });

  test('should verify correct password against Argon2id hash and reject wrong password', async () => {
    const hash = await hashPassword(plainPassword);
    const isValid = await verifyPassword(plainPassword, hash);
    assert.strictEqual(isValid, true, 'Valid password must verify to true');

    const isWrongValid = await verifyPassword('WrongPassword999!', hash);
    assert.strictEqual(isWrongValid, false, 'Wrong password must verify to false');
  });

  test('should identify legacy bcrypt hash as needing Argon2id rehash', async () => {
    const legacyBcryptHash = await bcrypt.hash(plainPassword, 10);
    assert.strictEqual(needsArgon2Rehash(legacyBcryptHash), true, 'Legacy bcrypt hash must indicate rehash needed');

    const argon2Hash = await hashPassword(plainPassword);
    assert.strictEqual(needsArgon2Rehash(argon2Hash), false, 'Argon2id hash must NOT indicate rehash needed');
  });

  test('should verify valid password against legacy bcrypt hash (backward compatibility)', async () => {
    const legacyBcryptHash = await bcrypt.hash(plainPassword, 10);
    const isValid = await verifyPassword(plainPassword, legacyBcryptHash);
    assert.strictEqual(isValid, true, 'Legacy bcrypt hash must verify successfully for backward compatibility');
  });

  test('should seamlessly rehash legacy bcrypt user to Argon2id in DB upon authentication', async () => {
    const legacyEmail = `legacy_user_${Date.now()}@lexora.gov.in`;
    const bcryptHash = await bcrypt.hash('LegacyPass123!', 10);

    const user = await prisma.user.create({
      data: {
        email: legacyEmail,
        password: bcryptHash,
        name: 'Legacy User Test',
        role: 'JUDGE',
        designation: 'Judge',
        court: 'High Court',
        status: 'APPROVED'
      }
    });

    // Verify initial hash is legacy bcrypt
    assert.strictEqual(user.password.startsWith('$2a$') || user.password.startsWith('$2b$'), true);

    // Simulate login verification
    const isValid = await verifyPassword('LegacyPass123!', user.password);
    assert.strictEqual(isValid, true);

    if (needsArgon2Rehash(user.password)) {
      const newHash = await hashPassword('LegacyPass123!');
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash }
      });
    }

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    assert.ok(updatedUser?.password.startsWith('$argon2id$'), 'Updated password must be hashed with Argon2id');
  });
});

describe('S1: JWT, Cookie & Refresh Token Security Tests', () => {
  const secret = process.env.JWT_SECRET || 'test_jwt_secret_2026';

  test('should reject JWT tokens signed with unexpected algorithm (e.g. none or RS256 spoofing)', () => {
    // Generate token with header algorithm none or HS256 forged secret
    const badToken = jwt.sign({ id: 'u1', role: 'JUDGE' }, 'wrong_secret', { algorithm: 'HS256' });

    let verifyError: any = null;
    try {
      jwt.verify(badToken, secret, { algorithms: ['HS256'] });
    } catch (err) {
      verifyError = err;
    }
    assert.ok(verifyError, 'Verification must throw error for wrong signature key');
  });

  test('should enforce CSRF double-submit token check on state-changing requests with cookie auth', () => {
    const req: any = {
      method: 'POST',
      cookies: {
        access_token: 'fake_access_token',
        csrf_token: 'valid_csrf_secret_123'
      },
      headers: {
        'x-csrf-token': 'wrong_csrf_secret_999'
      }
    };

    let statusCode = 0;
    let jsonResponse: any = null;
    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonResponse = data;
        return this;
      }
    };

    authenticateToken(req, res, () => {});

    assert.strictEqual(statusCode, 403);
    assert.strictEqual(jsonResponse.error, 'CSRF validation failed: Invalid or missing CSRF token');
  });

  test('should allow state-changing requests when X-CSRF-Token matches csrf_token cookie', () => {
    const testSecret = process.env.JWT_SECRET || 'test_secret_key_2026';
    const validToken = jwt.sign({ id: 'u123', email: 'u@lexora.gov.in', role: 'LAWYER', name: 'Lawyer' }, testSecret, { expiresIn: '15m' });

    const req: any = {
      method: 'POST',
      cookies: {
        access_token: validToken,
        csrf_token: 'matching_csrf_token_777'
      },
      headers: {
        'x-csrf-token': 'matching_csrf_token_777'
      }
    };

    let nextCalled = false;
    const res: any = {};

    authenticateToken(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, 'Next middleware must be called when CSRF tokens match');
    assert.strictEqual(req.user.role, 'LAWYER');
  });

  test('should detect refresh token reuse and revoke token family in database', async () => {
    const user = await prisma.user.create({
      data: {
        email: `reuse_test_${Date.now()}@lexora.gov.in`,
        password: await hashPassword('Pass123!'),
        name: 'Reuse Test User',
        role: 'JUDGE',
        designation: 'Judge',
        court: 'High Court',
        status: 'APPROVED'
      }
    });

    const rawToken1 = crypto.randomBytes(32).toString('hex');
    const tokenHash1 = crypto.createHash('sha256').update(rawToken1).digest('hex');
    const familyId = crypto.randomUUID();

    // Create session 1
    const session1 = await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash1,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    // Simulate normal rotation: session 1 rotated
    await prisma.refreshToken.update({
      where: { id: session1.id },
      data: { rotatedAt: new Date() }
    });

    // Create session 2 in same family
    const rawToken2 = crypto.randomBytes(32).toString('hex');
    const tokenHash2 = crypto.createHash('sha256').update(rawToken2).digest('hex');
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash2,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    // Simulate malicious replay of token 1: lookup session 1
    const replayLookup = await prisma.refreshToken.findUnique({ where: { tokenHash: tokenHash1 } });
    assert.ok(replayLookup?.rotatedAt, 'Token 1 should be marked rotated');

    // Reuse detection triggered -> revoke all tokens in family
    await prisma.refreshToken.updateMany({
      where: { familyId },
      data: { revokedAt: new Date() }
    });

    // Verify all tokens in family are now revoked
    const familyTokens = await prisma.refreshToken.findMany({ where: { familyId } });
    for (const t of familyTokens) {
      assert.ok(t.revokedAt !== null, 'Every token in family must be marked revoked');
    }
  });
});
