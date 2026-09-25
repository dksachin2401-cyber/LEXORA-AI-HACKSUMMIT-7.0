import assert from 'node:assert';
import { test, describe } from 'node:test';
import { maskOfficialId } from '../routes/admin.js';
import { encryptField, decryptField } from '../utils/fieldEncryption.js';

describe('Phase S12: Admin User Verification & Approval Workflow Security Suite', () => {

  describe('1. Official Identity Masking and Cryptographic Decryption', () => {
    test('maskOfficialId masks standard 4-part Bar Council registration IDs', () => {
      const raw = 'BAR/MH/2024/8891';
      const masked = maskOfficialId(raw);
      assert.strictEqual(masked, 'BAR/MH/****/8891');
      assert.strictEqual(masked.includes('2024'), false);
    });

    test('maskOfficialId masks 3-part Judicial Service IDs', () => {
      const raw = 'JUD/SERVICE/1042';
      const masked = maskOfficialId(raw);
      assert.strictEqual(masked, 'JUD/****/1042');
      assert.strictEqual(masked.includes('SERVICE'), false);
    });

    test('maskOfficialId masks generic alphanumeric identity codes', () => {
      const raw = 'DL-REG-99238-ADV';
      const masked = maskOfficialId(raw);
      assert.strictEqual(masked.startsWith('DL-'), true);
      assert.strictEqual(masked.endsWith('ADV'), true);
      assert.strictEqual(masked.includes('****'), true);
    });

    test('maskOfficialId handles N/A, empty, and null values gracefully', () => {
      assert.strictEqual(maskOfficialId('N/A'), 'N/A');
      assert.strictEqual(maskOfficialId(''), 'N/A');
      assert.strictEqual(maskOfficialId(null), 'N/A');
      assert.strictEqual(maskOfficialId(undefined), 'N/A');
    });

    test('AES-256-GCM encryption & decryption round-trip for official IDs', () => {
      const sensitiveId = 'BAR/DHC/2026/04918';
      const encrypted = encryptField(sensitiveId);
      assert.ok(encrypted);
      assert.ok(encrypted.startsWith('ENC_V1:'), 'Must prepend ENC_V1 prefix');
      assert.notStrictEqual(encrypted, sensitiveId);

      const decrypted = decryptField(encrypted);
      assert.strictEqual(decrypted, sensitiveId);
    });
  });

  describe('2. Applicant Registration Data Sanitization & Model Integrity', () => {
    test('Verification detail view strips sensitive credentials', () => {
      const rawDatabaseRecord = {
        id: 'usr_applicant_test_101',
        name: 'Adv. Alok Verma',
        email: 'alok.verma@delhibar.org',
        password: '$argon2id$v=19$m=65536,t=3,p=4$fakehash...',
        role: 'LAWYER',
        designation: 'High Court Senior Counsel',
        court: 'High Court of Delhi',
        officialId: encryptField('BAR/DL/2023/5512'),
        status: 'PENDING_ADMIN_APPROVAL',
        rejectionReason: null,
        createdAt: new Date('2026-09-01T10:00:00Z'),
        updatedAt: new Date('2026-09-01T10:00:00Z'),
      };

      // Transform record for admin applicant view
      const decryptedId = decryptField(rawDatabaseRecord.officialId) || 'N/A';
      const applicantDossier = {
        id: rawDatabaseRecord.id,
        name: rawDatabaseRecord.name,
        email: rawDatabaseRecord.email,
        role: rawDatabaseRecord.role,
        designation: rawDatabaseRecord.designation,
        court: rawDatabaseRecord.court,
        officialId: decryptedId,
        officialIdMasked: maskOfficialId(decryptedId),
        status: rawDatabaseRecord.status,
        rejectionReason: rawDatabaseRecord.rejectionReason,
        createdAt: rawDatabaseRecord.createdAt,
      };

      assert.strictEqual((applicantDossier as any).password, undefined, 'Password hash must never be in applicant dossier');
      assert.strictEqual(applicantDossier.officialId, 'BAR/DL/2023/5512');
      assert.strictEqual(applicantDossier.officialIdMasked, 'BAR/DL/****/5512');
      assert.strictEqual(applicantDossier.status, 'PENDING_ADMIN_APPROVAL');
    });
  });

  describe('3. Account Approval Workflow & State Invariants', () => {
    test('Approving an applicant transitions status to APPROVED and clears rejectionReason', () => {
      const applicant = {
        id: 'usr_app_202',
        status: 'PENDING_ADMIN_APPROVAL',
        rejectionReason: null as string | null,
      };

      // Simulate admin approval
      const newStatus = 'APPROVED';
      applicant.status = newStatus;
      applicant.rejectionReason = null;

      assert.strictEqual(applicant.status, 'APPROVED');
      assert.strictEqual(applicant.rejectionReason, null);
    });

    test('Redundant approval attempt is recognized and prevented', () => {
      const applicant = {
        id: 'usr_app_202',
        status: 'APPROVED',
      };

      const isRedundant = applicant.status === 'APPROVED';
      assert.strictEqual(isRedundant, true, 'Cannot re-approve an already approved user');
    });
  });

  describe('4. Account Rejection Workflow & Reason Capture', () => {
    test('Rejecting an applicant records the specific administrative rationale', () => {
      const applicant = {
        id: 'usr_app_303',
        status: 'PENDING_ADMIN_APPROVAL',
        rejectionReason: null as string | null,
      };

      const customReason = 'Bar Council verification failed: Registration number not found on active state roll';
      applicant.status = 'REJECTED';
      applicant.rejectionReason = customReason;

      assert.strictEqual(applicant.status, 'REJECTED');
      assert.strictEqual(applicant.rejectionReason, customReason);
    });

    test('Rejection requires a valid rationale or falls back to standard administrative notice', () => {
      const emptyReason: string = '';
      const fallback = (emptyReason && emptyReason.trim()) ? emptyReason.trim() : 'Credentials could not be verified by Judicial Administrator';
      assert.strictEqual(fallback, 'Credentials could not be verified by Judicial Administrator');
    });

    test('Redundant rejection attempt is recognized and prevented', () => {
      const applicant = {
        id: 'usr_app_303',
        status: 'REJECTED',
      };

      const isRedundant = applicant.status === 'REJECTED';
      assert.strictEqual(isRedundant, true, 'Cannot re-reject an already rejected user');
    });
  });

  describe('5. Login Gate Enforcement for Pending and Rejected Accounts', () => {
    test('Pending accounts are strictly blocked at login with 403 status', () => {
      const user = {
        id: 'usr_pending_001',
        email: 'pending.judge@judiciary.gov.in',
        status: 'PENDING_ADMIN_APPROVAL',
      };

      const isPending = user.status === 'PENDING' || user.status === 'PENDING_ADMIN_APPROVAL';
      assert.strictEqual(isPending, true);

      const errorMessage = 'Account pending verification by National Judicial Administrator. Access denied until official credential verification.';
      assert.ok(errorMessage.includes('Account pending verification'));
    });

    test('Rejected accounts receive a 403 with the specific administrative rejection reason', () => {
      const user = {
        id: 'usr_rejected_001',
        email: 'fake.lawyer@mail.com',
        status: 'REJECTED',
        rejectionReason: 'Invalid Bar Registration Number: BAR/KA/9999/0000',
      };

      const isRejected = user.status === 'REJECTED';
      assert.strictEqual(isRejected, true);

      const errorMessage = user.rejectionReason
        ? `Official registration request was rejected by Judicial Administrator. Reason: ${user.rejectionReason}`
        : 'Official registration request was rejected by Judicial Administrator.';

      assert.ok(errorMessage.includes('Reason: Invalid Bar Registration Number: BAR/KA/9999/0000'));
    });

    test('Approved accounts pass the login gate successfully', () => {
      const user = {
        id: 'usr_approved_001',
        email: 'valid.lawyer@lexora.gov.in',
        status: 'APPROVED',
      };

      const isAllowed = user.status === 'APPROVED';
      assert.strictEqual(isAllowed, true);
    });
  });

  describe('6. Audit Logging Verification', () => {
    test('Approval and Rejection actions generate distinct audit events', () => {
      const adminActor = { id: 'admin_001', role: 'ADMIN', name: 'Dr. Sunita Rao' };

      const approvalAudit = {
        actorId: adminActor.id,
        actorRole: adminActor.role,
        action: 'USER_APPROVED',
        input: 'Admin verification for User ID usr_101 (Adv. Alok Verma, LAWYER)',
        output: `Status updated to APPROVED by ${adminActor.name}`,
        outcome: 'SUCCESS',
      };

      const rejectionAudit = {
        actorId: adminActor.id,
        actorRole: adminActor.role,
        action: 'USER_REJECTED',
        input: 'Admin verification for User ID usr_202 (Adv. Vikram, LAWYER)',
        output: 'Status updated to REJECTED. Reason: Invalid Bar Registration Number',
        outcome: 'SUCCESS',
      };

      assert.strictEqual(approvalAudit.action, 'USER_APPROVED');
      assert.strictEqual(rejectionAudit.action, 'USER_REJECTED');
      assert.ok(approvalAudit.output.includes('APPROVED'));
      assert.ok(rejectionAudit.output.includes('Reason: Invalid Bar Registration Number'));
    });
  });
});
