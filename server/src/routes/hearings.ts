import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/hearings
router.get('/', async (req: Request, res: Response) => {
  try {
    const hearings = await prisma.hearing.findMany({
      include: {
        case: { select: { caseNumber: true, title: true, priority: true } },
      },
      orderBy: { date: 'asc' },
    });
    return res.json(hearings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch hearings' });
  }
});

// POST /api/hearings
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { caseId, date, time, courtRoom, type } = req.body;
    const newHearing = await prisma.hearing.create({
      data: {
        caseId,
        date: date || new Date().toISOString().split('T')[0],
        time: time || '10:00 AM',
        courtRoom: courtRoom || 'Court Room 1',
        type: type || 'Hearing',
        status: 'Scheduled',
      },
    });
    return res.status(201).json(newHearing);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to schedule hearing' });
  }
});

export default router;
