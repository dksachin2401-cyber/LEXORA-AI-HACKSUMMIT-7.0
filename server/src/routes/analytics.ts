import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// GET /api/analytics/dashboard — User-Scoped Dashboard Analytics
router.get('/dashboard', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const todaysDate = new Date().toISOString().split('T')[0];
    const userRole = req.user?.role?.toUpperCase() || '';
    const userId   = req.user?.id;
    const userName = req.user?.name || '';

    // Global base counts (used for Admin/Staff overview)
    const globalTotalCases = await prisma.case.count();
    const globalPendingCases = await prisma.case.count({ where: { status: 'Pending' } });
    const globalActiveCases = await prisma.case.count({ where: { status: 'Active' } });
    const globalClosedCases = await prisma.case.count({ where: { status: 'Closed' } });
    const globalHighPriority = await prisma.case.count({ where: { priority: 'High' } });
    const globalTotalHearings = await prisma.hearing.count();
    const globalTodaysHearings = await prisma.hearing.count({ where: { date: todaysDate } });
    const totalJudges = await prisma.user.count({ where: { role: 'JUDGE' } });
    const totalLawyers = await prisma.user.count({ where: { role: 'LAWYER' } });

    // 1. Lawyer-Scoped Stats
    let lawyerTotal = globalActiveCases + globalPendingCases;
    let lawyerPending = globalPendingCases;
    let lawyerClosed = globalClosedCases;
    let lawyerHearings = globalTotalHearings;

    if (userRole === 'LAWYER' && userId) {
      const userPending = await prisma.case.count({ where: { lawyerId: userId, status: 'Pending' } });
      const userActive = await prisma.case.count({ where: { lawyerId: userId, status: 'Active' } });
      const userClosed = await prisma.case.count({ where: { lawyerId: userId, status: 'Closed' } });
      const userHearings = await prisma.hearing.count({ where: { case: { lawyerId: userId } } });

      lawyerTotal = userPending + userActive;
      lawyerPending = userPending;
      lawyerClosed = userClosed;
      lawyerHearings = userHearings;
    }

    // 2. Judge-Scoped Stats
    let judgeTotal = globalTotalCases;
    let judgePending = globalPendingCases;
    let judgeTodaysHearings = globalTodaysHearings;
    let judgeHighPriority = globalHighPriority;

    if (userRole === 'JUDGE' && userId) {
      const benchWhere = { OR: [{ judgeId: userId }, { judgeId: null }] };
      judgeTotal = await prisma.case.count({ where: benchWhere });
      judgePending = await prisma.case.count({ where: { ...benchWhere, status: 'Pending' } });
      judgeTodaysHearings = await prisma.hearing.count({ where: { date: todaysDate, case: benchWhere } });
      judgeHighPriority = await prisma.case.count({ where: { ...benchWhere, priority: 'High' } });
    }

    // 3. Citizen-Scoped Stats
    let citizenActiveCases = globalActiveCases;
    let citizenTotalCases = globalTotalCases;
    let citizenUpcomingHearings = globalTodaysHearings;

    if (userRole === 'CITIZEN' && userName) {
      const citizenCaseWhere = { OR: [{ petitioner: { contains: userName } }, { respondent: { contains: userName } }] };
      citizenTotalCases = await prisma.case.count({ where: citizenCaseWhere });
      citizenActiveCases = await prisma.case.count({ where: { ...citizenCaseWhere, status: { in: ['Active', 'Pending'] } } });
      citizenUpcomingHearings = await prisma.hearing.count({ where: { case: citizenCaseWhere, date: { gte: todaysDate } } });
    }

    return res.json({
      judgeStats: {
        totalCases: judgeTotal,
        pendingCases: judgePending,
        todaysHearings: judgeTodaysHearings,
        highPriority: judgeHighPriority,
      },
      lawyerStats: {
        totalCases: lawyerTotal,
        pendingCases: lawyerPending,
        closedCases: lawyerClosed,
        activeHearings: lawyerHearings,
      },
      citizenStats: {
        totalCases: citizenTotalCases,
        activeCases: citizenActiveCases,
        upcomingHearings: citizenUpcomingHearings,
      },
      adminStats: {
        totalCases: globalTotalCases,
        pendingCases: globalPendingCases,
        disposedCases: globalClosedCases,
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
