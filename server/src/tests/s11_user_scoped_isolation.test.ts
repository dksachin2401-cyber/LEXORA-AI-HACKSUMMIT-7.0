import assert from 'node:assert';
import { test, describe } from 'node:test';
import { canAccessCase, getAuthorizedCaseWhere, getAuthorizedHearingWhere, AuthUser } from '../utils/caseAuthorization.js';

describe('Phase S11: User-Scoped Isolation & Zero Cross-Advocate Leakage Security Suite', () => {
  // Test Mock Users
  const advocatePriya: AuthUser = {
    id: 'lawyer_priya_001',
    email: 'lawyer@lexora.gov.in',
    role: 'LAWYER',
    name: 'Advocate Priya Nair',
  };

  const advocateArjun: AuthUser = {
    id: 'lawyer_arjun_002',
    email: 'arjun.sharma@lexora.gov.in',
    role: 'LAWYER',
    name: 'Advocate Arjun Sharma',
  };

  const judgeSharma: AuthUser = {
    id: 'judge_sharma_001',
    email: 'judge@lexora.gov.in',
    role: 'JUDGE',
    name: "Hon'ble Justice Rajesh Sharma",
  };

  const judgeRao: AuthUser = {
    id: 'judge_rao_002',
    email: 'ananya.rao@judiciary.gov.in',
    role: 'JUDGE',
    name: "Hon'ble Justice Ananya Rao",
  };

  const citizenRamesh: AuthUser = {
    id: 'citizen_ramesh_001',
    email: 'citizen@lexora.gov.in',
    role: 'CITIZEN',
    name: 'Ramesh Patel',
  };

  const citizenNeha: AuthUser = {
    id: 'citizen_neha_002',
    email: 'neha.verma@citizen.gov.in',
    role: 'CITIZEN',
    name: 'Neha Verma',
  };

  const courtStaff: AuthUser = {
    id: 'staff_amit_001',
    email: 'staff@lexora.gov.in',
    role: 'COURT_STAFF',
    name: 'Amit Kumar',
  };

  const adminUser: AuthUser = {
    id: 'admin_sunita_001',
    email: 'admin@lexora.gov.in',
    role: 'ADMIN',
    name: 'Dr. Sunita Rao',
  };

  // Mock Cases
  const casePriyaOnly = {
    id: 'case_priya_101',
    caseNumber: 'LEX/ENV/001/2026',
    title: 'Greenfield Bio-Energy vs State',
    lawyerId: 'lawyer_priya_001',
    judgeId: 'judge_sharma_001',
    petitioner: 'Greenfield Bio-Energy Pvt. Ltd.',
    respondent: 'State Environmental Tribunal',
  };

  const caseArjunOnly = {
    id: 'case_arjun_202',
    caseNumber: 'LEX/COM/006/2026',
    title: 'Kavya Enterprises vs Delta Logistics',
    lawyerId: 'lawyer_arjun_002',
    judgeId: 'judge_rao_002',
    petitioner: 'Kavya Enterprises',
    respondent: 'Delta Logistics Pvt. Ltd.',
  };

  const caseCitizenRamesh = {
    id: 'case_ramesh_303',
    caseNumber: 'LEX/PROP/004/2026',
    title: 'Sunrise Housing vs Municipal Authority',
    lawyerId: 'lawyer_priya_001',
    judgeId: 'judge_sharma_001',
    petitioner: 'Sunrise Housing Cooperative (Ramesh Patel)',
    respondent: 'Municipal Authority',
  };

  // ── 1. ADVOCATE TO ADVOCATE CASE ISOLATION ─────────────────────────────────
  test('1. Advocate A is strictly authorized for own assigned case', async () => {
    const access = await canAccessCase(advocatePriya, casePriyaOnly);
    assert.strictEqual(access.allowed, true);
  });

  test('2. Advocate A is strictly FORBIDDEN from accessing Advocate B assigned case', async () => {
    const access = await canAccessCase(advocatePriya, caseArjunOnly);
    assert.strictEqual(access.allowed, false);
    assert.ok(access.reason?.includes('assigned to another legal counsel'));
  });

  test('3. Advocate B is strictly FORBIDDEN from accessing Advocate A assigned case', async () => {
    const access = await canAccessCase(advocateArjun, casePriyaOnly);
    assert.strictEqual(access.allowed, false);
    assert.ok(access.reason?.includes('assigned to another legal counsel'));
  });

  // ── 2. CASE PRISMA WHERE CLAUSE SCOPING ────────────────────────────────────
  test('4. Advocate case query where clause strictly scopes by lawyerId', () => {
    const wherePriya = getAuthorizedCaseWhere(advocatePriya);
    assert.deepStrictEqual(wherePriya, { lawyerId: 'lawyer_priya_001' });

    const whereArjun = getAuthorizedCaseWhere(advocateArjun);
    assert.deepStrictEqual(whereArjun, { lawyerId: 'lawyer_arjun_002' });
  });

  test('5. Judge case query where clause scopes by assigned bench or unassigned', () => {
    const whereJudge = getAuthorizedCaseWhere(judgeSharma);
    assert.deepStrictEqual(whereJudge, {
      OR: [
        { judgeId: 'judge_sharma_001' },
        { judgeId: null },
      ],
    });
  });

  test('6. Citizen case query where clause scopes by petitioner/respondent party name', () => {
    const whereCitizen = getAuthorizedCaseWhere(citizenRamesh);
    assert.deepStrictEqual(whereCitizen, {
      OR: [
        { petitioner: { contains: 'Ramesh Patel' } },
        { respondent: { contains: 'Ramesh Patel' } },
      ],
    });
  });

  test('7. Admin and Court Staff queries have unrestricted system-wide case scope', () => {
    const whereAdmin = getAuthorizedCaseWhere(adminUser);
    assert.deepStrictEqual(whereAdmin, {});

    const whereStaff = getAuthorizedCaseWhere(courtStaff);
    assert.deepStrictEqual(whereStaff, {});
  });

  // ── 3. HEARINGS QUERY SCOPING ─────────────────────────────────────────────
  test('8. Advocate hearing query where clause strictly scopes to cases assigned to lawyerId', () => {
    const whereHearing = getAuthorizedHearingWhere(advocatePriya);
    assert.deepStrictEqual(whereHearing, {
      case: { lawyerId: 'lawyer_priya_001' },
    });
  });

  test('9. Judge hearing query where clause strictly scopes to bench cases', () => {
    const whereHearing = getAuthorizedHearingWhere(judgeSharma);
    assert.deepStrictEqual(whereHearing, {
      case: {
        OR: [
          { judgeId: 'judge_sharma_001' },
          { judgeId: null },
        ],
      },
    });
  });

  // ── 4. JUDGE BENCH PRIVACY ────────────────────────────────────────────────
  test('10. Judge A is allowed for cases assigned to Judge A bench', async () => {
    const access = await canAccessCase(judgeSharma, casePriyaOnly);
    assert.strictEqual(access.allowed, true);
  });

  test('11. Judge A is FORBIDDEN from private matters assigned exclusively to Judge B bench', async () => {
    const access = await canAccessCase(judgeSharma, caseArjunOnly);
    assert.strictEqual(access.allowed, false);
    assert.ok(access.reason?.includes('assigned to another judicial bench'));
  });

  // ── 5. CITIZEN PARTY ISOLATION ────────────────────────────────────────────
  test('12. Citizen party is authorized for case matching citizen name', async () => {
    const access = await canAccessCase(citizenRamesh, caseCitizenRamesh);
    assert.strictEqual(access.allowed, true);
  });

  test('13. Citizen is FORBIDDEN from unassigned/unrelated private cases', async () => {
    const access = await canAccessCase(citizenNeha, caseCitizenRamesh);
    assert.strictEqual(access.allowed, false);
    assert.ok(access.reason?.includes('not a registered party'));
  });

  // ── 6. ADMIN & STAFF ADMINISTRATIVE OVERSIGHT ─────────────────────────────
  test('14. Admin has authorized oversight across all case records', async () => {
    const accessPriyaCase = await canAccessCase(adminUser, casePriyaOnly);
    const accessArjunCase = await canAccessCase(adminUser, caseArjunOnly);
    assert.strictEqual(accessPriyaCase.allowed, true);
    assert.strictEqual(accessArjunCase.allowed, true);
  });

  test('15. Court Staff has operational oversight for registry processing', async () => {
    const access = await canAccessCase(courtStaff, casePriyaOnly);
    assert.strictEqual(access.allowed, true);
  });

  // ── 7. UNKNOWN OR UNAUTHENTICATED REQUESTS FAIL CLOSED ─────────────────────
  test('16. Unauthenticated requests fail closed with denial', async () => {
    const access = await canAccessCase(undefined, casePriyaOnly);
    assert.strictEqual(access.allowed, false);
    assert.strictEqual(access.reason, 'Authentication required');

    const whereUnauth = getAuthorizedCaseWhere(undefined);
    assert.ok(whereUnauth.id.includes('DENIED'));
  });
});
