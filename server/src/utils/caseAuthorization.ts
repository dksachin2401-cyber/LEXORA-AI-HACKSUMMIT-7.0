import { PrismaClient, Case } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name: string;
}

const defaultPrisma = new PrismaClient();

/**
 * Determines whether an authenticated user has permission to access a specific case.
 *
 * Rules:
 * - ADMIN / COURT_STAFF / STAFF: Allowed full judicial case access.
 * - LAWYER: Allowed ONLY if case.lawyerId === user.id (Strict isolation: an advocate NEVER sees another advocate's private case).
 * - JUDGE: Allowed if case.judgeId === user.id (or if case is unassigned and open to bench review).
 * - CITIZEN: Allowed if user.name matches case.petitioner or case.respondent, or if user filed the linked petition.
 */
export async function canAccessCase(
  user: AuthUser | undefined,
  caseRecordOrId: string | Partial<Case> | null,
  prisma: PrismaClient = defaultPrisma
): Promise<{ allowed: boolean; reason?: string; caseRecord?: Case | null }> {
  if (!user) {
    return { allowed: false, reason: 'Authentication required' };
  }

  const role = (user.role || '').toUpperCase();

  // Privileged administrative & registry roles have operational access
  if (['ADMIN', 'COURT_STAFF', 'STAFF'].includes(role)) {
    return { allowed: true };
  }

  let caseRecord: Case | null = null;
  if (typeof caseRecordOrId === 'string') {
    caseRecord = await prisma.case.findFirst({
      where: {
        OR: [{ id: caseRecordOrId }, { caseNumber: caseRecordOrId }],
      },
    });
  } else if (caseRecordOrId && typeof caseRecordOrId === 'object') {
    // If essential fields are present on the passed object
    if (caseRecordOrId.id && (caseRecordOrId.lawyerId !== undefined || caseRecordOrId.judgeId !== undefined)) {
      caseRecord = caseRecordOrId as Case;
    } else if (caseRecordOrId.id) {
      caseRecord = await prisma.case.findUnique({ where: { id: caseRecordOrId.id } });
    }
  }

  if (!caseRecord) {
    return { allowed: false, reason: 'Case not found' };
  }

  if (role === 'LAWYER') {
    if (caseRecord.lawyerId === user.id) {
      return { allowed: true, caseRecord };
    }
    return {
      allowed: false,
      reason: 'Access denied: Case is assigned to another legal counsel',
      caseRecord,
    };
  }

  if (role === 'JUDGE') {
    if (!caseRecord.judgeId || caseRecord.judgeId === user.id) {
      return { allowed: true, caseRecord };
    }
    return {
      allowed: false,
      reason: 'Access denied: Case is assigned to another judicial bench',
      caseRecord,
    };
  }

  if (role === 'CITIZEN') {
    const userName = (user.name || '').toLowerCase().trim();
    const petitioner = (caseRecord.petitioner || '').toLowerCase();
    const respondent = (caseRecord.respondent || '').toLowerCase();

    // Check if citizen is direct party (petitioner / respondent)
    if (
      (userName && petitioner.includes(userName)) ||
      (userName && respondent.includes(userName)) ||
      (user.email && petitioner.includes(user.email.toLowerCase())) ||
      (user.email && respondent.includes(user.email.toLowerCase()))
    ) {
      return { allowed: true, caseRecord };
    }

    // Check if citizen submitted an e-filing for this case
    const filing = await prisma.filing.findFirst({
      where: {
        applicantId: user.id,
        caseId: caseRecord.id,
      },
    });

    if (filing) {
      return { allowed: true, caseRecord };
    }

    return {
      allowed: false,
      reason: 'Access denied: You are not a registered party or applicant for this case',
      caseRecord,
    };
  }

  return { allowed: false, reason: 'Access denied: Role unauthorized' };
}

/**
 * Returns a Prisma `where` clause to filter Case queries based on the authenticated user's role and ID.
 */
export function getAuthorizedCaseWhere(user: AuthUser | undefined): any {
  if (!user) {
    return { id: '__UNAUTHENTICATED_ACCESS_DENIED__' };
  }

  const role = (user.role || '').toUpperCase();

  if (['ADMIN', 'COURT_STAFF', 'STAFF'].includes(role)) {
    return {};
  }

  if (role === 'LAWYER') {
    return { lawyerId: user.id };
  }

  if (role === 'JUDGE') {
    return {
      OR: [
        { judgeId: user.id },
        { judgeId: null }
      ]
    };
  }

  if (role === 'CITIZEN') {
    const userName = user.name || '';
    return {
      OR: [
        { petitioner: { contains: userName } },
        { respondent: { contains: userName } },
      ],
    };
  }

  return { id: '__UNKNOWN_ROLE_ACCESS_DENIED__' };
}

/**
 * Returns a Prisma `where` clause to filter Hearing queries based on the authenticated user's role and ID.
 */
export function getAuthorizedHearingWhere(user: AuthUser | undefined): any {
  if (!user) {
    return { id: '__UNAUTHENTICATED_ACCESS_DENIED__' };
  }

  const role = (user.role || '').toUpperCase();

  if (['ADMIN', 'COURT_STAFF', 'STAFF'].includes(role)) {
    return {};
  }

  if (role === 'LAWYER') {
    return {
      case: { lawyerId: user.id },
    };
  }

  if (role === 'JUDGE') {
    return {
      case: {
        OR: [
          { judgeId: user.id },
          { judgeId: null }
        ]
      },
    };
  }

  if (role === 'CITIZEN') {
    const userName = user.name || '';
    return {
      case: {
        OR: [
          { petitioner: { contains: userName } },
          { respondent: { contains: userName } },
        ],
      },
    };
  }

  return { id: '__UNKNOWN_ROLE_ACCESS_DENIED__' };
}
