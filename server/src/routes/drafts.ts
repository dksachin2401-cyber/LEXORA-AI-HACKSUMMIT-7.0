import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get draft orders
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const drafts = await prisma.draftOrder.findMany({
      include: { case: true, signedBy: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, drafts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Create draft order
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { caseId, docType, title, content } = req.body;
    const draft = await prisma.draftOrder.create({
      data: {
        caseId,
        docType: docType || 'Order',
        title,
        content,
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

    res.json({ success: true, draft });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create draft order' });
  }
});

// Human Sign-Off (Approve / Reject)
router.post('/:id/sign-off', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, editedContent } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid sign-off status.' });
    }

    const draft = await prisma.draftOrder.update({
      where: { id },
      data: {
        status,
        content: editedContent || undefined,
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
          input: `Draft ID: ${id}`,
          output: `Judicial Officer ${req.user.name} marked draft as ${status}`,
          outcome: status
        }
      });
    }

    res.json({ success: true, draft, badge: "Human Authenticated Sign-Off Completed" });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sign off draft' });
  }
});

export default router;
