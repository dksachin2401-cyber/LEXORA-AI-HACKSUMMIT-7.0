import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics/dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const totalCases = await prisma.case.count();
    const pendingCases = await prisma.case.count({ where: { status: 'Pending' } });
    const activeCases = await prisma.case.count({ where: { status: 'Active' } });
    const closedCases = await prisma.case.count({ where: { status: 'Closed' } });
    const highPriority = await prisma.case.count({ where: { priority: 'High' } });

    const totalHearings = await prisma.hearing.count();
    const todaysDate = new Date().toISOString().split('T')[0];
    const todaysHearingsCount = await prisma.hearing.count({
      where: { date: todaysDate },
    });

    const totalJudges = await prisma.user.count({ where: { role: 'JUDGE' } });
    const totalLawyers = await prisma.user.count({ where: { role: 'LAWYER' } });

    return res.json({
      judgeStats: {
        totalCases,
        pendingCases,
        todaysHearings: todaysHearingsCount,
        highPriority,
      },
      lawyerStats: {
        totalCases: activeCases + pendingCases,
        pendingCases,
        closedCases,
        activeHearings: totalHearings,
      },
      adminStats: {
        totalCases,
        pendingCases,
        disposedCases: closedCases,
        avgCaseTime: '1.8 Yrs',
        totalJudges: totalJudges || 1,
        totalCourts: 12,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Analytics service error' });
  }
});

export default router;
