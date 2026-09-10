import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDemoEnvironment() {
  console.log('==========================================');
  console.log('LEXORA Safe Synthetic Demo Environment Reset');
  console.log('==========================================');

  if (process.env.CONFIRM_DEMO_RESET !== 'yes') {
    console.log('[SECURITY GATE] Set CONFIRM_DEMO_RESET=yes to execute demo environment reset.');
    process.exit(1);
  }

  console.log('[1/3] Removing transient demo hearings, drafts, and evidence records...');
  await prisma.hearing.deleteMany({
    where: { case: { caseNumber: { in: ['WP(C) 412/2024', 'CRL.A. 9912/2023', 'CIV.SUIT 104/2025'] } } },
  });
  await prisma.draftOrder.deleteMany({
    where: { case: { caseNumber: { in: ['WP(C) 412/2024', 'CRL.A. 9912/2023', 'CIV.SUIT 104/2025'] } } },
  });
  await prisma.evidence.deleteMany({
    where: { case: { caseNumber: { in: ['WP(C) 412/2024', 'CRL.A. 9912/2023', 'CIV.SUIT 104/2025'] } } },
  });
  await prisma.aiAnalysis.deleteMany({
    where: { case: { caseNumber: { in: ['WP(C) 412/2024', 'CRL.A. 9912/2023', 'CIV.SUIT 104/2025'] } } },
  });

  console.log('[2/3] Re-seeding pristine benchmark demo cases & AI recommendation state...');
  const case1 = await prisma.case.findFirst({ where: { caseNumber: 'WP(C) 412/2024' } });

  if (case1) {
    await prisma.hearing.create({
      data: {
        caseId: case1.id,
        date: '2026-08-14',
        time: '10:30 AM',
        courtRoom: 'Courtroom No. 4 (Bench II)',
        status: 'SUGGESTED',
        type: 'Arguments on Interim Relief',
        suggestedByAi: true,
        aiRationale: 'AI Suggested schedule based on judicial docket availability. Human review required.',
      },
    });

    await prisma.draftOrder.create({
      data: {
        caseId: case1.id,
        docType: 'Notice',
        title: 'Show Cause Notice to Respondent',
        content: `DRAFT — AI-GENERATED, UNEXECUTED (REVIEW REQUIRED)\n\nIN THE HIGH COURT OF JUDICATURE\nCase No: WP(C) 412/2024\n\nTo,\nM/s Apex Enterprises\n\nWHEREAS the Petitioner has filed the present writ petition for recovery of dues...\nYOU ARE HEREBY SUMMONED to appear before this Court on 14th August 2026 at 10:30 AM.`,
        status: 'DRAFT',
      },
    });
  }

  console.log('[3/3] Creating immutable audit trail entry...');
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (admin) {
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorRole: 'ADMIN',
        action: 'DEMO_ENVIRONMENT_RESET_CLI',
        input: 'Execution of CLI reset script',
        output: 'Demo environment reset complete',
        outcome: 'SUCCESS',
      },
    });
  }

  console.log('\nDEMO RESET SUCCESS: Pristine demo state restored. Global legal corpus preserved.');
}

resetDemoEnvironment()
  .catch((e) => {
    console.error('[DEMO RESET ERROR]', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
