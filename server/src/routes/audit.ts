import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Get audit logs - Scoped strictly to actor for non-admin users
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user?.role?.toUpperCase() || '';
    const userId   = req.user?.id;

    const where: any = {};
    if (!['ADMIN', 'COURT_STAFF', 'STAFF'].includes(userRole) && userId) {
      where.actorId = userId;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: { actor: { select: { name: true, email: true, role: true, court: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Post audit entry
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { action, input, output, sources, outcome } = req.body;
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const log = await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        actorRole: req.user.role,
        action,
        input: typeof input === 'string' ? input : JSON.stringify(input),
        output: typeof output === 'string' ? output : JSON.stringify(output),
        sources: sources ? (typeof sources === 'string' ? sources : JSON.stringify(sources)) : null,
        outcome: outcome || 'REVIEWED_HUMAN'
      }
    });

    res.json({ success: true, log });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record audit log' });
  }
});

export default router;
