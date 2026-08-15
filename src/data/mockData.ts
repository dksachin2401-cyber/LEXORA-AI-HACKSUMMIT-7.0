// ===== LEXORA AI — Mock Data =====
// Realistic Indian judicial system dummy data

// ----- Dashboard Statistics -----
export const judgeDashboardStats = {
  totalCases: 12547,
  pendingCases: 8320,
  todaysHearings: 156,
  highPriority: 245,
  disposedThisMonth: 342,
  avgDisposalDays: 127,
};

export const lawyerDashboardStats = {
  totalCases: 18,
  pendingCases: 12,
  closedCases: 6,
  activeHearings: 24,
};

export const adminDashboardStats = {
  totalCases: 25430,
  pendingCases: 15860,
  disposedCases: 9570,
  avgCaseTime: '2.4 Yrs',
  totalJudges: 148,
  totalCourts: 32,
};

// ----- Cases -----
export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  status: 'Pending' | 'Active' | 'Closed' | 'Adjourned' | 'Reserved';
  priority: 'High' | 'Medium' | 'Low';
  division: string;
  petitioner: string;
  respondent: string;
  filingDate: string;
  nextHearing: string;
  judge: string;
  court: string;
  type: string;
  description: string;
}

export const mockCases: CaseItem[] = [
  {
    id: '1',
    caseNumber: 'SC/2024/1256',
    title: 'State of U.P. vs. Ramesh Kumar',
    status: 'Pending',
    priority: 'High',
    division: 'Criminal',
    petitioner: 'State of Uttar Pradesh',
    respondent: 'Ramesh Kumar Singh',
    filingDate: '2024-01-15',
    nextHearing: '2024-08-22',
    judge: 'Hon. Justice Rajesh Kumar',
    court: 'Supreme Court of India',
    type: 'Criminal Appeal',
    description: 'Appeal against conviction under Section 302/34 IPC. The appellant challenges the High Court judgment affirming the trial court conviction.',
  },
  {
    id: '2',
    caseNumber: 'HC/2024/4567',
    title: 'Shilpa Bhatia vs. UOI',
    status: 'Active',
    priority: 'Medium',
    division: 'Civil',
    petitioner: 'Shilpa Bhatia',
    respondent: 'Union of India',
    filingDate: '2024-02-20',
    nextHearing: '2024-08-18',
    judge: 'Hon. Justice Meera Patel',
    court: 'Delhi High Court',
    type: 'Writ Petition',
    description: 'Petition challenging the constitutional validity of certain provisions of the Information Technology Act, 2000.',
  },
  {
    id: '3',
    caseNumber: 'WP/2024/8901',
    title: 'Anil Sharma vs. State',
    status: 'Pending',
    priority: 'High',
    division: 'Constitutional',
    petitioner: 'Anil Sharma',
    respondent: 'State of Maharashtra',
    filingDate: '2024-03-10',
    nextHearing: '2024-09-05',
    judge: 'Hon. Justice Suresh Reddy',
    court: 'Bombay High Court',
    type: 'Public Interest Litigation',
    description: 'PIL seeking directions for implementation of environmental protection measures in industrial zones.',
  },
  {
    id: '4',
    caseNumber: 'MV/2024/3456',
    title: 'Rajiv Sharma vs. State',
    status: 'Adjourned',
    priority: 'Medium',
    division: 'Criminal',
    petitioner: 'Rajiv Sharma',
    respondent: 'State of Rajasthan',
    filingDate: '2024-01-28',
    nextHearing: '2024-08-30',
    judge: 'Hon. Justice Priya Singh',
    court: 'Rajasthan High Court',
    type: 'Criminal Revision',
    description: 'Revision petition against order of Sessions Court in a matter involving Section 498A IPC.',
  },
  {
    id: '5',
    caseNumber: 'CS/2024/7890',
    title: 'Infosys Ltd vs. TechCorp',
    status: 'Active',
    priority: 'Low',
    division: 'Commercial',
    petitioner: 'Infosys Limited',
    respondent: 'TechCorp Solutions Pvt. Ltd.',
    filingDate: '2024-04-05',
    nextHearing: '2024-09-12',
    judge: 'Hon. Justice Arun Gupta',
    court: 'Commercial Court, Bangalore',
    type: 'Commercial Suit',
    description: 'Dispute arising from breach of software licensing agreement and intellectual property infringement.',
  },
  {
    id: '6',
    caseNumber: 'FA/2024/2345',
    title: 'Sunita Devi vs. Ram Prasad',
    status: 'Pending',
    priority: 'High',
    division: 'Family',
    petitioner: 'Sunita Devi',
    respondent: 'Ram Prasad',
    filingDate: '2024-02-14',
    nextHearing: '2024-08-25',
    judge: 'Hon. Justice Kavita Joshi',
    court: 'Family Court, Delhi',
    type: 'Divorce Petition',
    description: 'Petition for dissolution of marriage under Section 13 of the Hindu Marriage Act, 1955.',
  },
  {
    id: '7',
    caseNumber: 'CRN/2024/6789',
    title: 'State vs. Manish Gupta',
    status: 'Active',
    priority: 'High',
    division: 'Criminal',
    petitioner: 'State of Delhi',
    respondent: 'Manish Gupta',
    filingDate: '2024-03-22',
    nextHearing: '2024-08-20',
    judge: 'Hon. Justice Ravi Shankar',
    court: 'Sessions Court, Patiala House',
    type: 'Sessions Trial',
    description: 'Trial in a case involving economic offenses under Prevention of Money Laundering Act.',
  },
  {
    id: '8',
    caseNumber: 'WP/2024/1122',
    title: 'Anita Bhargava vs. UOI',
    status: 'Reserved',
    priority: 'Medium',
    division: 'Service',
    petitioner: 'Anita Bhargava',
    respondent: 'Union of India',
    filingDate: '2024-05-01',
    nextHearing: '2024-09-15',
    judge: 'Hon. Justice Deepak Mishra',
    court: 'Central Administrative Tribunal',
    type: 'Service Matter',
    description: 'Challenge to premature retirement order issued under FR 56(j) of Fundamental Rules.',
  },
  {
    id: '9',
    caseNumber: 'ARB/2024/4455',
    title: 'Tata Steel vs. JSW Steel',
    status: 'Active',
    priority: 'Low',
    division: 'Arbitration',
    petitioner: 'Tata Steel Ltd.',
    respondent: 'JSW Steel Ltd.',
    filingDate: '2024-04-18',
    nextHearing: '2024-10-01',
    judge: 'Sole Arbitrator: Justice (Retd.) S.K. Sharma',
    court: 'MCIA, Mumbai',
    type: 'Commercial Arbitration',
    description: 'Arbitration proceedings arising from disputes under a long-term supply agreement.',
  },
  {
    id: '10',
    caseNumber: 'CBI/2024/7788',
    title: 'CBI vs. Suresh Patel',
    status: 'Pending',
    priority: 'High',
    division: 'Criminal',
    petitioner: 'Central Bureau of Investigation',
    respondent: 'Suresh Patel & Others',
    filingDate: '2024-06-10',
    nextHearing: '2024-08-28',
    judge: 'Hon. Justice Vikram Nath',
    court: 'Special CBI Court, Delhi',
    type: 'Corruption Case',
    description: 'Case involving allegations of corruption and disproportionate assets by a public servant.',
  },
];

// ----- Case Trend Data (Monthly) -----
export const caseTrendData = [
  { month: 'Jan', filed: 420, disposed: 380, pending: 8100 },
  { month: 'Feb', filed: 380, disposed: 410, pending: 8070 },
  { month: 'Mar', filed: 450, disposed: 390, pending: 8130 },
  { month: 'Apr', filed: 410, disposed: 430, pending: 8110 },
  { month: 'May', filed: 390, disposed: 420, pending: 8080 },
  { month: 'Jun', filed: 440, disposed: 460, pending: 8060 },
  { month: 'Jul', filed: 470, disposed: 440, pending: 8090 },
  { month: 'Aug', filed: 430, disposed: 450, pending: 8070 },
  { month: 'Sep', filed: 400, disposed: 470, pending: 8000 },
  { month: 'Oct', filed: 460, disposed: 480, pending: 7980 },
  { month: 'Nov', filed: 420, disposed: 490, pending: 7910 },
  { month: 'Dec', filed: 380, disposed: 500, pending: 7790 },
];

// ----- Case Category Distribution -----
export const caseCategoryData = [
  { name: 'Criminal', value: 4200, color: '#ef4444' },
  { name: 'Civil', value: 3800, color: '#3b82f6' },
  { name: 'Constitutional', value: 1200, color: '#C6A537' },
  { name: 'Family', value: 1800, color: '#a855f7' },
  { name: 'Commercial', value: 900, color: '#0FD5C4' },
  { name: 'Service', value: 647, color: '#f59e0b' },
];

// ----- Court Performance -----
export const courtPerformanceData = [
  { court: 'Supreme Court', disposed: 1420, pending: 3200, rate: 89 },
  { court: 'Delhi HC', disposed: 2340, pending: 4500, rate: 78 },
  { court: 'Bombay HC', disposed: 1980, pending: 3800, rate: 82 },
  { court: 'Madras HC', disposed: 1560, pending: 2900, rate: 75 },
  { court: 'Calcutta HC', disposed: 1100, pending: 3100, rate: 68 },
];

// ----- AI Recommendations -----
export const aiRecommendations = [
  {
    id: 'rec1',
    caseNumber: 'WP/2024/1256',
    title: 'Urgent: Environmental PIL requires immediate hearing',
    priority: 'High',
    reason: 'Case involves time-sensitive environmental degradation. Delay may cause irreversible damage.',
    suggestedDate: '2024-08-15',
  },
  {
    id: 'rec2',
    caseNumber: 'CR/2024/3456',
    title: 'Case eligible for mediation referral',
    priority: 'Medium',
    reason: 'Based on case analysis, parties may benefit from ADR. Similar cases had 72% settlement rate.',
    suggestedDate: '2024-08-20',
  },
];

// ----- Hearing Schedule -----
export interface HearingItem {
  id: string;
  caseNumber: string;
  title: string;
  time: string;
  courtRoom: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Postponed';
  type: string;
}

export const todaysHearings: HearingItem[] = [
  {
    id: 'h1',
    caseNumber: 'SC/2024/1256',
    title: 'State of U.P. vs. Ramesh Kumar',
    time: '10:00 AM',
    courtRoom: 'Court Room 1',
    status: 'Completed',
    type: 'Arguments',
  },
  {
    id: 'h2',
    caseNumber: 'HC/2024/4567',
    title: 'Shilpa Bhatia vs. UOI',
    time: '11:30 AM',
    courtRoom: 'Court Room 3',
    status: 'In Progress',
    type: 'Evidence',
  },
  {
    id: 'h3',
    caseNumber: 'WP/2024/8901',
    title: 'Anil Sharma vs. State',
    time: '02:00 PM',
    courtRoom: 'Court Room 2',
    status: 'Scheduled',
    type: 'Hearing',
  },
  {
    id: 'h4',
    caseNumber: 'FA/2024/2345',
    title: 'Sunita Devi vs. Ram Prasad',
    time: '03:30 PM',
    courtRoom: 'Court Room 5',
    status: 'Scheduled',
    type: 'Mediation',
  },
];

// ----- Case Timeline Events -----
export const caseTimelineEvents = [
  {
    date: '2024-01-15',
    event: 'Case Filed',
    description: 'FIR registered and case filed before the court.',
    type: 'filing',
  },
  {
    date: '2024-02-10',
    event: 'First Hearing',
    description: 'Preliminary hearing conducted. Notices issued to respondent.',
    type: 'hearing',
  },
  {
    date: '2024-03-18',
    event: 'Evidence Submitted',
    description: 'Prosecution submitted documentary evidence and witness list.',
    type: 'document',
  },
  {
    date: '2024-04-22',
    event: 'Arguments Heard',
    description: 'Arguments from both sides heard. Case reserved for order.',
    type: 'hearing',
  },
  {
    date: '2024-06-15',
    event: 'AI Analysis Generated',
    description: 'LEXORA AI generated comprehensive case analysis with precedent mapping.',
    type: 'ai',
  },
  {
    date: '2024-07-20',
    event: 'Adjournment',
    description: 'Case adjourned to next date for further arguments on constitutional validity.',
    type: 'adjournment',
  },
];

// ----- AI Chat Messages -----
export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export const aiChatHistory: ChatMessage[] = [
  {
    id: 'msg1',
    role: 'user',
    content: 'Summarize the key points of case SC/2024/1256',
    timestamp: '10:30 AM',
  },
  {
    id: 'msg2',
    role: 'ai',
    content: 'This is a criminal appeal filed by the prosecution challenging the acquittal dated 15 Jan 2024. The main issues involve:\n\n1. Violation of Article 14, maintaining the equality of fundamental rights, precedential clarity\n2. Evidence evaluation under Section 302/34 IPC\n3. Key points include:\n   - Violation of Article 14\n   - 3 Related justice principles\n   - Multiple witness testimonies',
    timestamp: '10:30 AM',
  },
];

// ----- Lawyer Cases -----
export const lawyerCases = [
  {
    id: 'lc1',
    caseNumber: 'HC/2024/4567',
    title: 'Shilpa Bhatia vs. UOI',
    client: 'Shilpa Bhatia',
    nextHearing: '2024-08-18',
    status: 'Active' as const,
    courtRoom: 'Court Room 3',
  },
  {
    id: 'lc2',
    caseNumber: 'CS/2024/7890',
    title: 'Infosys Ltd vs. TechCorp',
    client: 'Infosys Limited',
    nextHearing: '2024-09-12',
    status: 'Active' as const,
    courtRoom: 'Court Room 7',
  },
  {
    id: 'lc3',
    caseNumber: 'FA/2024/2345',
    title: 'Sunita Devi vs. Ram Prasad',
    client: 'Sunita Devi',
    nextHearing: '2024-08-25',
    status: 'Pending' as const,
    courtRoom: 'Court Room 5',
  },
  {
    id: 'lc4',
    caseNumber: 'WP/2024/1122',
    title: 'Anita Bhargava vs. UOI',
    client: 'Anita Bhargava',
    nextHearing: '2024-09-15',
    status: 'Reserved' as const,
    courtRoom: 'Court Room 2',
  },
];

// ----- Notifications -----
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
}

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Case Assigned',
    message: 'Case WP/2024/9012 has been assigned to your bench.',
    time: '5 min ago',
    type: 'info',
    read: false,
  },
  {
    id: 'n2',
    title: 'Hearing Reminder',
    message: 'Hearing for SC/2024/1256 starts in 30 minutes.',
    time: '30 min ago',
    type: 'warning',
    read: false,
  },
  {
    id: 'n3',
    title: 'AI Analysis Ready',
    message: 'AI case analysis for HC/2024/4567 is complete.',
    time: '1 hr ago',
    type: 'success',
    read: true,
  },
  {
    id: 'n4',
    title: 'High Priority Alert',
    message: '3 cases require urgent attention this week.',
    time: '2 hrs ago',
    type: 'alert',
    read: true,
  },
];

// ----- Delay Prediction Factors -----
export const delayFactors = [
  { factor: 'Case Age', impact: 'High', description: 'Case is 8 months old' },
  { factor: 'Adjournments', impact: 'High', description: '5 adjournments recorded' },
  { factor: 'Documentation', impact: 'Medium', description: 'Incomplete documentation' },
  { factor: 'Witness Availability', impact: 'Medium', description: '2 witnesses pending examination' },
  { factor: 'Court Workload', impact: 'Low', description: 'Current docket is manageable' },
];

// ----- Suggested Prompts for AI Chat -----
export const suggestedPrompts = [
  'Summarize the key points of this case',
  'What are the relevant legal precedents?',
  'List the fundamental rights involved',
  'Predict the likely outcome based on similar cases',
  'What are the grounds for appeal?',
  'Suggest mediation possibilities',
];
