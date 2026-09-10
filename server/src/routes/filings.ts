import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Helper to generate sequential-like unique filing number
function generateFilingNumber(): string {
  const rand = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  return `FIL-${year}-${rand}`;
}

// POST /api/filings — Submit e-filing petition
router.post('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, petitioner, respondent, filingType, court, caseId, documentId } = req.body;

    if (!title || !petitioner || !respondent) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'title, petitioner, and respondent are required.'
      });
    }

    const filingNumber = generateFilingNumber();
    const applicantId = req.user?.id || null;

    const filing = await prisma.filing.create({
      data: {
        filingNumber,
        applicantId,
        caseId: caseId || null,
        title,
        description: description || 'E-filed petition submitted via Citizen Portal.',
        documentId: documentId || null,
        filingType: filingType || 'Civil Suit',
        court: court || 'District Civil Court',
        petitioner,
        respondent,
        status: 'SUBMITTED' // Workflow: DRAFT -> SUBMITTED -> UNDER_REVIEW -> ACCEPTED / REJECTED
      }
    });

    // Log Audit Event
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: 'E_FILING_SUBMITTED',
          input: `Submitted petition: ${title} (${filingNumber})`,
          output: `Filing ID: ${filing.id}`,
          outcome: 'SUBMITTED'
        }
      }).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      filing,
      message: `E-filing submitted successfully. Your reference number is ${filingNumber}.`
    });
  } catch (error) {
    console.error('Failed to submit e-filing:', error);
    return res.status(500).json({ error: 'Failed to submit e-filing' });
  }
});

// GET /api/filings — Retrieve user-scoped filings
router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role?.toUpperCase() || 'CITIZEN';
    const userId   = req.user?.id;

    const where: any = {};
    if (userRole === 'CITIZEN' && userId) {
      where.applicantId = userId;
    } else if (userRole === 'LAWYER' && userId) {
      const userCases = await prisma.case.findMany({ where: { lawyerId: userId }, select: { id: true } });
      const userCaseIds = userCases.map(c => c.id);
      where.OR = [
        { applicantId: userId },
        { caseId: { in: userCaseIds } }
      ];
    } else if (userRole === 'JUDGE' && userId) {
      const userCases = await prisma.case.findMany({ where: { OR: [{ judgeId: userId }, { judgeId: null }] }, select: { id: true } });
      const userCaseIds = userCases.map(c => c.id);
      where.caseId = { in: userCaseIds };
    }

    const filings = await prisma.filing.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, filings });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch filings' });
  }
});

// GET /api/filings/track/:filingNumber — Public tracking by filing number
router.get('/track/:filingNumber', async (req: Request, res: Response) => {
  try {
    const filingNumber = String(req.params.filingNumber).trim().toUpperCase();
    const filing = await prisma.filing.findUnique({ where: { filingNumber } });

    if (!filing) {
      return res.status(404).json({
        error: 'Filing Not Found',
        message: `No e-filing found with reference number "${filingNumber}". Please verify and try again.`
      });
    }

    return res.json({ success: true, filing });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to track filing' });
  }
});

// PUT /api/filings/:id/status — Staff/Admin review status update
router.put('/:id/status', authenticateToken, requireRole(['ADMIN', 'COURT_STAFF', 'STAFF']), async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body; // UNDER_REVIEW, ACCEPTED, REJECTED

    if (!['UNDER_REVIEW', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const filing = await prisma.filing.update({
      where: { id },
      data: { status }
    });

    return res.json({ success: true, filing });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update filing status' });
  }
});

export default router;
