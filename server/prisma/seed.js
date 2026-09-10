"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding Lexora AI Database...');
    // Clean existing tables
    await prisma.auditLog.deleteMany();
    await prisma.draftOrder.deleteMany();
    await prisma.evidence.deleteMany();
    await prisma.hearing.deleteMany();
    await prisma.document.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.aiAnalysis.deleteMany();
    await prisma.case.deleteMany();
    await prisma.user.deleteMany();
    const hashedPassword = await bcryptjs_1.default.hash('lexora123', 10);
    // 1. Create Users for all 5 Roles
    const judge = await prisma.user.create({
        data: {
            email: 'judge@lexora.gov.in',
            password: hashedPassword,
            name: 'Hon\'ble Justice Rajesh Sharma',
            role: 'JUDGE',
            designation: 'Senior High Court Judge',
            court: 'High Court of Judicature',
            avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150'
        }
    });
    const lawyer = await prisma.user.create({
        data: {
            email: 'lawyer@lexora.gov.in',
            password: hashedPassword,
            name: 'Advocate Priya Nair',
            role: 'LAWYER',
            designation: 'Senior Legal Practitioner',
            court: 'Supreme Court & High Court Bar',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
        }
    });
    const staff = await prisma.user.create({
        data: {
            email: 'staff@lexora.gov.in',
            password: hashedPassword,
            name: 'Amit Kumar',
            role: 'COURT_STAFF',
            designation: 'Chief Bench Registrar',
            court: 'High Court Registry',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        }
    });
    const citizen = await prisma.user.create({
        data: {
            email: 'citizen@lexora.gov.in',
            password: hashedPassword,
            name: 'Ramesh Patel',
            role: 'CITIZEN',
            designation: 'Litigant Citizen',
            court: 'N/A',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
        }
    });
    const admin = await prisma.user.create({
        data: {
            email: 'admin@lexora.gov.in',
            password: hashedPassword,
            name: 'Dr. Sunita Rao',
            role: 'ADMIN',
            designation: 'Director of Judicial Informatics',
            court: 'National Judicial Data Center',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
        }
    });
    console.log('Users created successfully.');
    // 2. Create Cases
    const case1 = await prisma.case.create({
        data: {
            caseNumber: 'WP(C) 412/2024',
            title: 'State Bank of India vs. M/s Apex Enterprises',
            description: 'Writ petition filed under Article 226 for recovery of commercial debts exceeding INR 45 Crores.',
            status: 'Active',
            priority: 'High',
            division: 'Commercial',
            petitioner: 'State Bank of India',
            respondent: 'M/s Apex Enterprises & Ors.',
            filingDate: '2024-02-10',
            nextHearing: '2026-08-14',
            court: 'High Court of Judicature',
            type: 'Writ Petition',
            delayProbability: 18.5,
            judgeId: judge.id,
            lawyerId: lawyer.id
        }
    });
    const case2 = await prisma.case.create({
        data: {
            caseNumber: 'CRL.A. 9912/2023',
            title: 'State of Maharashtra vs. Vikramaditya Deshmukh',
            description: 'Criminal Appeal against acquittal order in financial fraud under Section 420 & 120B IPC.',
            status: 'Pending',
            priority: 'High',
            division: 'Criminal',
            petitioner: 'State of Maharashtra',
            respondent: 'Vikramaditya Deshmukh',
            filingDate: '2023-11-04',
            nextHearing: '2026-08-18',
            court: 'High Court of Judicature',
            type: 'Criminal Appeal',
            delayProbability: 62.4,
            judgeId: judge.id,
            lawyerId: lawyer.id
        }
    });
    const case3 = await prisma.case.create({
        data: {
            caseNumber: 'CIV.SUIT 104/2025',
            title: 'Ramesh Patel vs. Municipal Corporation',
            description: 'Civil land title dispute regarding municipal acquisition notice.',
            status: 'Pending',
            priority: 'Medium',
            division: 'Civil',
            petitioner: 'Ramesh Patel',
            respondent: 'Municipal Corporation',
            filingDate: '2025-01-20',
            nextHearing: '2026-08-22',
            court: 'District Civil Court',
            type: 'Civil Suit',
            delayProbability: 34.0,
            lawyerId: lawyer.id
        }
    });
    console.log('Cases created.');
    // 3. Create Hearings
    await prisma.hearing.createMany({
        data: [
            {
                caseId: case1.id,
                date: '2026-08-14',
                time: '10:30 AM',
                courtRoom: 'Courtroom No. 4 (Bench II)',
                status: 'Scheduled',
                type: 'Arguments on Interim Relief',
                suggestedByAi: true,
                aiRationale: 'Optimized for low backlog on Friday morning session'
            },
            {
                caseId: case2.id,
                date: '2026-08-18',
                time: '02:15 PM',
                courtRoom: 'Courtroom No. 1 (Chief Justice Bench)',
                status: 'Scheduled',
                type: 'Framing of Charges',
                suggestedByAi: true,
                aiRationale: 'Aligned with criminal appeals listing queue'
            }
        ]
    });
    // 4. Create Draft Orders
    await prisma.draftOrder.create({
        data: {
            caseId: case1.id,
            docType: 'Notice',
            title: 'Show Cause Notice to Respondent',
            content: `DRAFT — AI-GENERATED, UNEXECUTED (REVIEW REQUIRED)\n\nIN THE HIGH COURT OF JUDICATURE\nCase No: WP(C) 412/2024\n\nTo,\nM/s Apex Enterprises\n\nWHEREAS the Petitioner has filed the present writ petition for recovery of dues...\nYOU ARE HEREBY SUMMONED to appear before this Court on 14th August 2026 at 10:30 AM.`,
            status: 'DRAFT'
        }
    });
    // 5. Create Audit Logs
    await prisma.auditLog.createMany({
        data: [
            {
                actorId: judge.id,
                actorRole: 'JUDGE',
                action: 'AI_SUMMARIZATION_REVIEW',
                input: 'WP(C) 412/2024 Petition Document',
                output: 'Fact summary accepted after minor correction on filing date.',
                sources: 'WP(C)_412_2024_Petition.pdf',
                outcome: 'ACCEPTED_BY_HUMAN'
            },
            {
                actorId: lawyer.id,
                actorRole: 'LAWYER',
                action: 'RAG_LEGAL_QUERY',
                input: 'Applicable precedents for Section 420 IPC delay probability',
                output: 'Retrieved Kesavananda Bharati & Maneka Gandhi precedents.',
                sources: 'Kesavananda Bharati v. State of Kerala (1973)',
                outcome: 'REVIEWED_HUMAN'
            }
        ]
    });
    console.log('Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
