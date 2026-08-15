import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/cases
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, division, priority, search } = req.query;

    const where: any = {};
    if (status && status !== 'All') where.status = String(status);
    if (division) where.division = String(division);
    if (priority) where.priority = String(priority);

    if (search) {
      where.OR = [
        { caseNumber: { contains: String(search) } },
        { title: { contains: String(search) } },
        { petitioner: { contains: String(search) } },
        { respondent: { contains: String(search) } },
      ];
    }

    const cases = await prisma.case.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        hearings: true,
        aiAnalysis: true,
      },
    });

    return res.json(cases);
  } catch (error) {
    console.error('Fetch cases error:', error);
    return res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// GET /api/cases/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const c = await prisma.case.findFirst({
      where: {
        OR: [{ id }, { caseNumber: id }],
      },
      include: {
        hearings: true,
        documents: true,
        aiAnalysis: true,
        judge: { select: { id: true, name: true, designation: true } },
        lawyer: { select: { id: true, name: true, designation: true } },
      },
    });

    if (!c) {
      return res.status(404).json({ error: 'Case not found' });
    }

    return res.json(c);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch case details' });
  }
});

// POST /api/cases
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      caseNumber,
      title,
      description,
      priority,
      division,
      petitioner,
      respondent,
      court,
      type,
    } = req.body;

    if (!caseNumber || !title || !petitioner || !respondent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title,
        description: description || '',
        status: 'Pending',
        priority: priority || 'Medium',
        division: division || 'Criminal',
        petitioner,
        respondent,
        filingDate: new Date().toISOString().split('T')[0],
        nextHearing: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        court: court || 'High Court of Delhi',
        type: type || 'Writ Petition',
        judgeId: req.user?.role === 'JUDGE' ? req.user.id : undefined,
        lawyerId: req.user?.role === 'LAWYER' ? req.user.id : undefined,
      },
    });

    return res.status(201).json(newCase);
  } catch (error) {
    console.error('Create case error:', error);
    return res.status(500).json({ error: 'Failed to create case' });
  }
});

// PUT /api/cases/:id
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = await prisma.case.update({
      where: { id },
      data: req.body,
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update case' });
  }
});

// DELETE /api/cases/:id
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.case.delete({ where: { id } });
    return res.json({ success: true, message: 'Case deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete case' });
  }
});

export default router;
