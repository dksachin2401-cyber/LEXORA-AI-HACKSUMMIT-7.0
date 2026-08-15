import {
  LayoutDashboard,
  FolderOpen,
  FileSearch,
  Bot,
  Clock,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  Scale,
  Users,
  Briefcase,
  FileText,
  Search,
  BookOpen,
  CalendarPlus,
  Globe,
  FileCode,
  ShieldCheck,
  FolderKanban,
  HelpCircle,
  Building,
  Download,
  CreditCard,
  FilePlus,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: number;
}

export const judgeNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Judge Dashboard', icon: LayoutDashboard, path: '/judge/dashboard' },
  { id: 'cases', label: 'Smart Case Vault', icon: FolderOpen, path: '/judge/cases' },
  { id: 'analyzer', label: 'AI Document Analyzer', icon: FileSearch, path: '/ai/analyzer' },
  { id: 'similar-cases', label: 'Similar Case Finder', icon: Search, path: '/ai/similar-cases' },
  { id: 'assistant', label: 'AI Legal Assistant', icon: Bot, path: '/ai/assistant' },
  { id: 'research', label: 'Legal Research Engine', icon: BookOpen, path: '/ai/research' },
  { id: 'drafts', label: 'AI Draft Generator', icon: FileCode, path: '/ai/drafts' },
  { id: 'evidence', label: 'Judicial Evidence & Bench Notes', icon: FolderKanban, path: '/ai/evidence' },
  { id: 'translator', label: 'Multilingual Translator', icon: Globe, path: '/ai/translator' },
  { id: 'audit', label: 'Judicial Audit Logs', icon: ShieldCheck, path: '/audit' },
];

export const lawyerNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Lawyer Dashboard', icon: LayoutDashboard, path: '/lawyer/dashboard' },
  { id: 'my-cases', label: 'My Cases', icon: Briefcase, path: '/lawyer/cases' },
  { id: 'analyzer', label: 'AI Document Analyzer', icon: FileSearch, path: '/ai/analyzer' },
  { id: 'similar-cases', label: 'Similar Case Finder', icon: Search, path: '/ai/similar-cases' },
  { id: 'assistant', label: 'AI Legal Assistant', icon: Bot, path: '/ai/assistant' },
  { id: 'research', label: 'Legal Research Engine', icon: BookOpen, path: '/ai/research' },
  { id: 'drafts', label: 'Draft Pleadings', icon: FileCode, path: '/ai/drafts' },
  { id: 'translator', label: 'Multilingual Translator', icon: Globe, path: '/ai/translator' },
];

export const staffNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Staff Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
  { id: 'cases', label: 'Case Filings', icon: FolderOpen, path: '/judge/cases' },
  { id: 'scheduler', label: 'Courtroom Allocations', icon: CalendarPlus, path: '/admin/allocations' },
  { id: 'drafts', label: 'Summons & Real Notices', icon: FileCode, path: '/staff/notices' },
  { id: 'evidence', label: 'Evidence Indexer', icon: FolderKanban, path: '/ai/evidence' },
];

export const citizenNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Citizen Self-Help Portal', icon: HelpCircle, path: '/citizen/dashboard' },
  { id: 'case-status', label: 'Check Case Status', icon: Search, path: '/citizen/case-status' },
  { id: 'cause-lists', label: 'View Cause Lists', icon: Calendar, path: '/citizen/cause-lists' },
  { id: 'download-orders', label: 'Download Orders', icon: Download, path: '/citizen/download-orders' },
  { id: 'pay-fees', label: 'Pay Court Fees Online', icon: CreditCard, path: '/citizen/pay-fees' },
  { id: 'efiling', label: 'e-Filing Portal', icon: FilePlus, path: '/citizen/efiling' },
  { id: 'assistant', label: 'Plain-Language AI Help', icon: Bot, path: '/ai/assistant' },
  { id: 'translator', label: 'Multilingual Translator', icon: Globe, path: '/ai/translator' },
];

export const adminNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'users', label: 'User & Role Management', icon: Users, path: '/admin/users' },
  { id: 'allocations', label: 'Judicial Bench Allocation', icon: Building, path: '/admin/allocations' },
  { id: 'cases', label: 'All Cases Registry', icon: FolderOpen, path: '/admin/cases' },
  { id: 'analytics', label: 'System Analytics', icon: BarChart3, path: '/admin/analytics' },
  { id: 'njdg', label: 'National Judicial Stats (NJDG)', icon: BarChart3, path: '/admin/njdg' },
  { id: 'audit', label: 'System Audit Trail', icon: ShieldCheck, path: '/audit' },
];

export function getNavItems(role: string): NavItem[] {
  const normalized = (role || 'judge').toLowerCase();
  switch (normalized) {
    case 'judge':
      return judgeNavItems;
    case 'lawyer':
      return lawyerNavItems;
    case 'court_staff':
    case 'staff':
      return staffNavItems;
    case 'citizen':
      return citizenNavItems;
    case 'admin':
      return adminNavItems;
    default:
      return judgeNavItems;
  }
}
