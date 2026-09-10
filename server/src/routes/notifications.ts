import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/notifications — Retrieve notifications strictly for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ success: true, notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read — Mark single notification as read
router.put('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const notifId = String(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notif = await prisma.notification.findUnique({ where: { id: notifId } });
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notif.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: Notification belongs to another user' });
    }

    const updated = await prisma.notification.update({
      where: { id: notifId },
      data: { read: true },
    });

    return res.json({ success: true, notification: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PUT /api/notifications/read-all — Mark all notifications as read for current user
router.put('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// DELETE /api/notifications/:id — Delete a notification
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const notifId = String(req.params.id);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notif = await prisma.notification.findUnique({ where: { id: notifId } });
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notif.userId !== userId) {
      return res.status(403).json({ error: 'Access denied: Notification belongs to another user' });
    }

    await prisma.notification.delete({ where: { id: notifId } });

    return res.json({ success: true, message: 'Notification removed' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
