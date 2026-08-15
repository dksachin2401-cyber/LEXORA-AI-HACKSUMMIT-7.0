import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /api/ai/analyze
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { caseId, fileName } = req.body;

    // Simulate AI document processing pipeline
    const findings = [
      'Document analysis confirms procedural compliance under relevant judicial acts.',
      'Key evidence aligns with established Supreme Court guidelines on Section 302 IPC.',
      'Recommended for priority hearing due to statutory timeline thresholds.',
    ];

    const precedents = [
      'State of Maharashtra v. Prakash (2020) 3 SCC 410',
      'Venkatesh v. Union of India AIR 2019 SC 1850',
    ];

    const recommendations = [
      'Issue direction for expedited witness cross-examination',
      'Refer to mediation cell if agreed by both counsel',
    ];

    if (caseId) {
      await prisma.aiAnalysis.upsert({
        where: { caseId },
        update: {
          keyFindings: JSON.stringify(findings),
          legalPrecedents: JSON.stringify(precedents),
          riskLevel: 'Medium',
          recommendations: JSON.stringify(recommendations),
        },
        create: {
          caseId,
          keyFindings: JSON.stringify(findings),
          legalPrecedents: JSON.stringify(precedents),
          riskLevel: 'Medium',
          recommendations: JSON.stringify(recommendations),
        },
      });
    }

    return res.json({
      success: true,
      findings,
      precedents,
      riskLevel: 'Medium',
      recommendations,
      confidenceScore: 94.8,
    });
  } catch (error) {
    return res.status(500).json({ error: 'AI analysis service failed' });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, caseId } = req.body;

    let responseText = 'Based on Indian constitutional law and precedents, ';

    if (message.toLowerCase().includes('summary') || message.toLowerCase().includes('key points')) {
      responseText += 'the primary issue concerns the balance between statutory authority and fundamental rights protection under Article 14. Key milestones include filing verification and preliminary evidence submission.';
    } else if (message.toLowerCase().includes('precedent') || message.toLowerCase().includes('case law')) {
      responseText += 'the leading authority is Apex Court ruling in Supreme Court Appeals (2021) 4 SCC 120, which establishes the standard for procedural compliance.';
    } else if (message.toLowerCase().includes('outcome') || message.toLowerCase().includes('predict')) {
      responseText += 'statistical risk modeling suggests a 78% probability of resolution within 3 hearing cycles if evidence deposition completes on schedule.';
    } else {
      responseText += 'I have analyzed your query against the active court record. The current status requires verification of filed affidavits before the next scheduled hearing.';
    }

    return res.json({
      role: 'ai',
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (error) {
    return res.status(500).json({ error: 'AI Legal Assistant service unavailable' });
  }
});

// POST /api/ai/predict-delay
router.post('/predict-delay', async (req: Request, res: Response) => {
  try {
    const { caseAge, adjournments, lawyerExp, hearingResult, caseType } = req.body;

    const ageFactor = (Number(caseAge) || 8) * 4;
    const adjFactor = (Number(adjournments) || 5) * 8;
    const expDiscount = (Number(lawyerExp) || 3) * 2;

    const rawProb = Math.min(95, Math.max(15, 30 + ageFactor + adjFactor - expDiscount));
    const delayProbability = parseFloat(rawProb.toFixed(1));

    const riskLevel = delayProbability > 70 ? 'High' : delayProbability > 40 ? 'Medium' : 'Low';

    return res.json({
      delayProbability,
      riskLevel,
      factors: [
        { factor: 'Case Age', impact: 'High', description: `Case age is ${caseAge || 8} months` },
        { factor: 'Adjournments', impact: 'High', description: `${adjournments || 5} adjournments recorded` },
        { factor: 'Documentation', impact: 'Medium', description: 'Documentation status requires update' },
      ],
      recommendations: [
        'Prioritize document completion and affidavit submissions',
        'Schedule continuous hearing dates',
        'Consider alternative dispute resolution (ADR)',
      ],
    });
  } catch (error) {
    return res.status(500).json({ error: 'Delay prediction service failed' });
  }
});

export default router;
