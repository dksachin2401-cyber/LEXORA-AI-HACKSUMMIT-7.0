import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth.js';
import { encryptField, decryptField } from '../utils/fieldEncryption.js';

const router = Router();
const prisma = new PrismaClient();

// Get draft orders
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const drafts = await prisma.draftOrder.findMany({
      include: { case: true, signedBy: true },
      orderBy: { createdAt: 'desc' }
    });
    const decryptedDrafts = drafts.map(d => ({
      ...d,
      content: decryptField(d.content) || ''
    }));
    res.json({ success: true, drafts: decryptedDrafts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Create draft order
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { caseId, docType, title, content } = req.body;

    let targetCaseId = caseId;
    if (caseId) {
      const existing = await prisma.case.findFirst({
        where: { OR: [{ id: String(caseId) }, { caseNumber: String(caseId) }] }
      });
      if (existing) targetCaseId = existing.id;
    }
    if (!targetCaseId) {
      const firstCase = await prisma.case.findFirst();
      if (firstCase) targetCaseId = firstCase.id;
    }

    if (!targetCaseId) {
      return res.status(400).json({ error: 'No associated case found to link draft order.' });
    }

    const draft = await prisma.draftOrder.create({
      data: {
        caseId: targetCaseId,
        docType: docType || 'Order',
        title: title || 'Draft Court Order',
        content: encryptField(content) || '',
        status: 'DRAFT'
      }
    });

    // Create Audit Log
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: 'DRAFT_GENERATED',
          input: `Generated draft ${docType} for Case ID ${caseId}`,
          output: title,
          outcome: 'AWAITING_HUMAN_SIGN_OFF'
        }
      });
    }

    const decryptedDraft = {
      ...draft,
      content: decryptField(draft.content) || ''
    };

    res.json({ success: true, draft: decryptedDraft });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create draft order' });
  }
});

// Human Sign-Off (Approve / Reject) - Restricted to Judicial Officers, Staff & Admins
router.post('/:id/sign-off', authenticateToken, requireRole(['JUDGE', 'COURT_STAFF', 'STAFF', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const draftId = String(req.params.id);
    const { status, editedContent } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid sign-off status.' });
    }

    const draft = await prisma.draftOrder.update({
      where: { id: draftId },
      data: {
        status,
        content: editedContent ? (encryptField(editedContent) || undefined) : undefined,
        signedById: req.user?.id,
        signedAt: new Date()
      }
    });

    // Create Immutable Audit Log for human judicial decision
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          actorId: req.user.id,
          actorRole: req.user.role,
          action: status === 'APPROVED' ? 'HUMAN_SIGN_OFF_APPROVED' : 'HUMAN_SIGN_OFF_REJECTED',
          input: `Draft ID: ${draftId}`,
          output: `Judicial Officer ${req.user.name} marked draft as ${status}`,
          outcome: status
        }
      });
    }

    const decryptedDraft = {
      ...draft,
      content: decryptField(draft.content) || ''
    };

    res.json({ success: true, draft: decryptedDraft, badge: "Human Authenticated Sign-Off Completed" });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign off draft' });
  }
});

export default router;
