import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Public Pages
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';

// Role Portals
import { JudgeDashboard } from '@/pages/judge/JudgeDashboard';
import { CaseManagement } from '@/pages/judge/CaseManagement';
import { CaseDetails } from '@/pages/judge/CaseDetails';

import { LawyerDashboard } from '@/pages/lawyer/LawyerDashboard';
import { StaffDashboard } from '@/pages/staff/StaffDashboard';
import { SummonsNoticeGeneratorPage } from '@/pages/staff/SummonsNoticeGeneratorPage';

// Citizen Portal Pages
import { CitizenDashboard } from '@/pages/citizen/CitizenDashboard';
import { CheckCaseStatusPage } from '@/pages/citizen/CheckCaseStatusPage';
import { ViewCauseListsPage } from '@/pages/citizen/ViewCauseListsPage';
import { DownloadOrdersPage } from '@/pages/citizen/DownloadOrdersPage';
import { PayCourtFeesPage } from '@/pages/citizen/PayCourtFeesPage';
import { EfilingPortalPage } from '@/pages/citizen/EfilingPortalPage';
import { NationalJudicialStatsPage } from '@/pages/citizen/NationalJudicialStatsPage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { BenchAllocationPage } from '@/pages/admin/BenchAllocationPage';

// AI Tool Pages
import { CaseAnalyzer } from '@/pages/ai/CaseAnalyzer';
import { CaseSummarizer } from '@/pages/ai/CaseSummarizer';
import { SimilarCaseFinder } from '@/pages/ai/SimilarCaseFinder';
import { LegalAssistant } from '@/pages/ai/LegalAssistant';
import { LegalResearchEngine } from '@/pages/ai/LegalResearchEngine';
import { HearingScheduler } from '@/pages/ai/HearingScheduler';
import { DraftGenerator } from '@/pages/ai/DraftGenerator';
import { MultilingualTranslator } from '@/pages/ai/MultilingualTranslator';
import { EvidenceOrganizer } from '@/pages/ai/EvidenceOrganizer';
import { AuditLogsViewer } from '@/pages/ai/AuditLogsViewer';

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Landing & Login */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Dashboard Layout Shell */}
        <Route element={<DashboardLayout />}>
          {/* Judge Portal */}
          <Route path="/judge/dashboard" element={<JudgeDashboard />} />
          <Route path="/judge/cases" element={<CaseManagement />} />
          <Route path="/judge/cases/:id" element={<CaseDetails />} />
          <Route path="/judge/analytics" element={<JudgeDashboard />} />

          {/* Lawyer Portal */}
          <Route path="/lawyer/dashboard" element={<LawyerDashboard />} />
          <Route path="/lawyer/cases" element={<CaseManagement />} />

          {/* Court Staff Portal */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/notices" element={<SummonsNoticeGeneratorPage />} />

          {/* Litigant Citizen Self-Help Portal */}
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/case-status" element={<CheckCaseStatusPage />} />
          <Route path="/citizen/cause-lists" element={<ViewCauseListsPage />} />
          <Route path="/citizen/download-orders" element={<DownloadOrdersPage />} />
          <Route path="/citizen/pay-fees" element={<PayCourtFeesPage />} />
          <Route path="/citizen/efiling" element={<EfilingPortalPage />} />

          {/* System Admin Portal */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/cases" element={<CaseManagement />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/allocations" element={<BenchAllocationPage />} />
          <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
          <Route path="/admin/njdg" element={<NationalJudicialStatsPage />} />

          {/* 15 Core AI Feature Tools */}
          <Route path="/ai/analyzer" element={<CaseAnalyzer />} />
          <Route path="/ai/summarizer" element={<CaseSummarizer />} />
          <Route path="/ai/similar-cases" element={<SimilarCaseFinder />} />
          <Route path="/ai/assistant" element={<LegalAssistant />} />
          <Route path="/ai/research" element={<LegalResearchEngine />} />
          <Route path="/ai/scheduler" element={<HearingScheduler />} />
          <Route path="/ai/drafts" element={<DraftGenerator />} />
          <Route path="/ai/translator" element={<MultilingualTranslator />} />
          <Route path="/ai/evidence" element={<EvidenceOrganizer />} />
          <Route path="/audit" element={<AuditLogsViewer />} />

          {/* Fallback settings */}
          <Route path="/settings" element={<JudgeDashboard />} />
        </Route>

        {/* Fallback Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
