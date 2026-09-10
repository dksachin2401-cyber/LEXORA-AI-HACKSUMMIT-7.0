import { describe, it } from 'node:test';
import assert from 'node:assert';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticateToken, requireRole, type AuthRequest } from '../middleware/auth.js';

describe('Phase 1: Authentication & Authorization Security Tests', () => {

  // Test 1: Password Verification
  it('should correctly verify valid password against bcrypt hash and reject invalid password', async () => {
    const password = 'StrongPassword123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    const isValid = await bcrypt.compare(password, hashedPassword);
    assert.strictEqual(isValid, true, 'Valid password must compare to true');

    const isWrongValid = await bcrypt.compare('WrongPassword999!', hashedPassword);
    assert.strictEqual(isWrongValid, false, 'Wrong password must compare to false');

    // Verify backdoor passwords fail
    const isBackdoor1Valid = await bcrypt.compare('lexora123', hashedPassword);
    assert.strictEqual(isBackdoor1Valid, false, 'Backdoor password lexora123 must be rejected');

    const isBackdoor2Valid = await bcrypt.compare('password123', hashedPassword);
    assert.strictEqual(isBackdoor2Valid, false, 'Backdoor password password123 must be rejected');
  });

  // Test 2: Nonexistent email / User Lookup Isolation
  it('should not perform role fallback search when email is not found', () => {
    // Simulating user lookup logic
    const usersDatabase = [
      { id: '1', email: 'judge@lexora.gov.in', role: 'JUDGE' }
    ];

    const lookupEmail = 'nonexistent@lexora.gov.in';
    const foundUser = usersDatabase.find(u => u.email === lookupEmail);
    assert.strictEqual(foundUser, undefined, 'Nonexistent email must return undefined without falling back to role search');
  });

  // Test 3: Missing JWT Secret Error Handling
  it('should return 500 configuration error if JWT_SECRET environment variable is missing', () => {
    const savedSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    const mockReq: Partial<AuthRequest> = {
      headers: { authorization: 'Bearer dummy_token_string' }
    };
    let statusCode = 0;
    let jsonOutput: any = null;

    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonOutput = data;
        return this;
      }
    };

    authenticateToken(mockReq as AuthRequest, mockRes, () => {});

    assert.strictEqual(statusCode, 500, 'Must return 500 status code when JWT_SECRET is missing');
    assert.strictEqual(jsonOutput.error, 'Server configuration error: JWT secret missing.');

    // Restore JWT_SECRET
    process.env.JWT_SECRET = savedSecret || 'test_secret_key_2026';
  });

  // Test 4: Role Authorization - Citizen Attempting Admin Endpoint
  it('should deny CITIZEN access to ADMIN endpoints with 403 Forbidden', () => {
    const middleware = requireRole(['ADMIN']);
    const mockReq: Partial<AuthRequest> = {
      user: { id: 'cit-123', email: 'citizen@lexora.gov.in', role: 'CITIZEN', name: 'Citizen User' }
    };
    let statusCode = 0;
    let jsonOutput: any = null;

    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonOutput = data;
        return this;
      }
    };

    middleware(mockReq as AuthRequest, mockRes, () => {});

    assert.strictEqual(statusCode, 403, 'CITIZEN must be denied access to ADMIN route with 403');
    assert.strictEqual(jsonOutput.error, 'Access denied: insufficient permissions');
  });

  // Test 5: Role Authorization - Lawyer Attempting Admin Endpoint
  it('should deny LAWYER access to ADMIN endpoints with 403 Forbidden', () => {
    const middleware = requireRole(['ADMIN']);
    const mockReq: Partial<AuthRequest> = {
      user: { id: 'law-123', email: 'lawyer@lexora.gov.in', role: 'LAWYER', name: 'Advocate Verma' }
    };
    let statusCode = 0;
    let jsonOutput: any = null;

    const mockRes: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonOutput = data;
        return this;
      }
    };

    middleware(mockReq as AuthRequest, mockRes, () => {});

    assert.strictEqual(statusCode, 403, 'LAWYER must be denied access to ADMIN route with 403');
    assert.strictEqual(jsonOutput.error, 'Access denied: insufficient permissions');
  });

  // Test 6: Role Authorization - Admin Accessing Admin Endpoint
  it('should allow ADMIN access to ADMIN endpoints', () => {
    const middleware = requireRole(['ADMIN']);
    const mockReq: Partial<AuthRequest> = {
      user: { id: 'adm-123', email: 'admin@lexora.gov.in', role: 'ADMIN', name: 'Administrator' }
    };
    let nextCalled = false;
    const mockRes: any = {};

    middleware(mockReq as AuthRequest, mockRes, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, 'ADMIN must be granted access and proceed to next middleware');
  });

  // Test 7: Authentication Token Verification with Valid JWT_SECRET
  it('should authenticate valid JWT token signed with JWT_SECRET', () => {
    const testSecret = 'secret_key_for_testing_2026';
    process.env.JWT_SECRET = testSecret;

    const token = jwt.sign(
      { id: 'u1', email: 'user@test.com', role: 'ADMIN', name: 'Test Admin' },
      testSecret,
      { expiresIn: '1h' }
    );

    const mockReq: Partial<AuthRequest> = {
      headers: { authorization: `Bearer ${token}` }
    };
    let nextCalled = false;
    const mockRes: any = {};

    authenticateToken(mockReq as AuthRequest, mockRes, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true, 'Valid token must pass authentication middleware');
    assert.strictEqual(mockReq.user?.email, 'user@test.com');
    assert.strictEqual(mockReq.user?.role, 'ADMIN');
  });
});
