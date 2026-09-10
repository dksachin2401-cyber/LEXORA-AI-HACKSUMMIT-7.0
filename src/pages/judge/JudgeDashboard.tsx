import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Clock, Calendar, AlertTriangle, FileText, CheckCircle, XCircle, Scale, ChevronRight, Eye, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { api } from '@/services/api';

export const JudgeDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<any[]>([]);
  const [hearings, setHearings] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [chromaOnline, setChromaOnline] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [casesRes, hearingsRes, activityRes, analyticsRes, healthRes] = await Promise.allSettled([
        api.getCases(),
        api.getHearings(),
        api.getAuditLogs(),
        api.getAnalytics(),
        api.getAiHealth(),
      ]);

      if (casesRes.status === 'fulfilled') {
        const rawCases = casesRes.value;
        setCases(Array.isArray(rawCases) ? rawCases : rawCases?.data || []);
      }

      if (hearingsRes.status === 'fulfilled') {
        const rawHearings = hearingsRes.value;
        setHearings(Array.isArray(rawHearings) ? rawHearings : rawHearings?.data || []);
      }

      if (activityRes.status === 'fulfilled' && activityRes.value?.logs) {
        setActivity(activityRes.value.logs);
      }

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value);
      }

      if (healthRes.status === 'fulfilled') {
        setChromaOnline(Boolean(healthRes.value?.ok));
      }
    } catch (err) {
      console.error('Failed to load live judge dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter matters requiring judicial attention
  const mattersRequiringAttention = cases.filter(
    (c) => c.status === 'Pending' || c.priority === 'High'
  ).length > 0
    ? cases.filter((c) => c.status === 'Pending' || c.priority === 'High')
    : cases.slice(0, 3);

  const todayIso = new Date().toISOString().split('T')[0];
  const todaysHearings = hearings.filter((h) => h.date === todayIso);

  const todayFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const hearingsCount = String(
    analytics?.judgeStats?.todaysHearings ?? todaysHearings.length
  ).padStart(2, '0');

  const pendingReviewsCount = String(
    analytics?.judgeStats?.pendingCases ?? cases.filter((c) => c.status === 'Pending').length
  ).padStart(2, '0');

  const activeMattersCount = String(
    analytics?.judgeStats?.totalCases ?? cases.length
  ).padStart(2, '0');

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="border-b border-[#D9DEE4] dark:border-[#2B3742] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--primary-accent)]">
            HIGH COURT OF JUDICATURE · BENCH II
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading tracking-tight mt-0.5">
            Judge's Workspace
          </h1>
          <p className="theme-subtext text-xs mt-1">
            Presiding Officer: <strong className="theme-heading">{user?.name || "Hon'ble Presiding Officer"}</strong> | <span className="font-mono opacity-80">{todayFormatted}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            title="Refresh Live Data"
            className="p-1.5 theme-elevated border border-subtle rounded-sm text-xs theme-subtext hover:theme-heading cursor-pointer flex items-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link to="/ai/research" className="px-3.5 py-1.5 theme-primary-btn text-xs rounded-sm font-semibold flex items-center gap-1.5 cursor-pointer">
            <Scale className="w-3.5 h-3.5" />
            <span>Open Legal Research Workstation</span>
          </Link>
        </div>
      </div>

      {/* Operational Summary Strip */}
      <div className="theme-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider block opacity-60">
            TODAY'S OPERATIONAL SUMMARY
          </span>
          <div className="flex items-baseline gap-4 mt-1">
            <span className="text-lg font-bold font-mono">{hearingsCount} <span className="text-xs font-sans font-normal theme-subtext">Hearings</span></span>
            <span className="opacity-40">·</span>
            <span className="text-lg font-bold text-[var(--primary-accent)] font-mono">{pendingReviewsCount} <span className="text-xs font-sans font-normal theme-subtext">Pending Reviews</span></span>
            <span className="opacity-40">·</span>
            <span className="text-lg font-bold font-mono">{activeMattersCount} <span className="text-xs font-sans font-normal theme-subtext">Active Matters</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono theme-subtext theme-elevated px-3 py-1.5 rounded-sm">
          <span className={`w-2 h-2 rounded-full ${chromaOnline ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-rose-500'}`}></span>
          <span>CHROMA VECTOR INDEX: {chromaOnline ? 'ONLINE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Matters Requiring Attention Table */}
      <div className="theme-card overflow-hidden space-y-0">
        <div className="px-4 py-3 border-b border-subtle theme-elevated flex justify-between items-center">
          <h2 className="text-sm font-serif font-bold theme-heading flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Matters Requiring Judicial Attention
          </h2>
          <span className="text-[10px] font-mono theme-subtext uppercase">
            {mattersRequiringAttention.length} {mattersRequiringAttention.length === 1 ? 'MATTER' : 'MATTERS'} PENDING DECISION
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr>
                <th className="px-4 py-3">Case Identifier</th>
                <th className="px-4 py-3">Parties / Matter</th>
                <th className="px-4 py-3">Next Required Action</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody>
              {mattersRequiringAttention.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center theme-subtext">
                    No urgent matters requiring judicial attention at this moment.
                  </td>
                </tr>
              ) : (
                mattersRequiringAttention.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:theme-elevated transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[var(--primary-accent)] whitespace-nowrap">
                      {m.caseNumber}
                    </td>
                    <td className="px-4 py-3 font-medium theme-heading">
                      {m.title || `${m.petitioner} v. ${m.respondent}`}
                    </td>
                    <td className="px-4 py-3 theme-subtext">
                      {m.hearings?.[0]
                        ? `${m.hearings[0].type || 'Hearing'} on ${m.hearings[0].date}`
                        : m.description
                        ? (m.description.slice(0, 70) + (m.description.length > 70 ? '...' : ''))
                        : 'Review pleadings & interim relief'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-sm badge-pending text-[10px] font-mono font-semibold">
                        {m.status?.toUpperCase() || 'REQUIRES REVIEW'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Link
                        to={`/judge/cases`}
                        className="px-2.5 py-1 theme-primary-btn text-[11px] font-semibold rounded-sm inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-white" />
                        <span>Review File</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Section: Upcoming Hearings & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Hearings */}
        <div className="lg:col-span-2 theme-card overflow-hidden">
          <div className="px-4 py-3 border-b border-subtle theme-elevated flex justify-between items-center">
            <h2 className="text-sm font-serif font-bold theme-heading flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Today's Cause List (Upcoming Hearings)
            </h2>
            <Link to="/judge/cases" className="text-xs font-medium text-[var(--primary-accent)] hover:underline flex items-center gap-0.5">
              Full Docket <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5">Case Number</th>
                  <th className="px-4 py-2.5">Parties</th>
                  <th className="px-4 py-2.5">Division</th>
                  <th className="px-4 py-2.5">Stage</th>
                </tr>
              </thead>
              <tbody>
                {todaysHearings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center theme-subtext">
                      No hearings scheduled on today's cause list ({todayFormatted}).
                    </td>
                  </tr>
                ) : (
                  todaysHearings.map((h, i) => (
                    <tr key={h.id || i} className="hover:theme-elevated transition-colors">
                      <td className="px-4 py-2.5 font-mono theme-subtext whitespace-nowrap">{h.time || '10:30 AM'}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-[var(--primary-accent)] whitespace-nowrap">
                        {h.case?.caseNumber || 'CASE-REF'}
                      </td>
                      <td className="px-4 py-2.5 font-medium theme-heading">
                        {h.case?.title || 'State vs. Accused'}
                      </td>
                      <td className="px-4 py-2.5 theme-subtext whitespace-nowrap">
                        {h.courtRoom || h.case?.court || 'Bench II'}
                      </td>
                      <td className="px-4 py-2.5 theme-subtext whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-sm bg-[#F5EBE6] dark:bg-[#2C241E] text-[10px] font-mono font-medium">
                          {h.type || h.status || 'Hearing'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Recent Activity Audit Stream */}
        <div className="lg:col-span-1 theme-card p-4 space-y-4">
          <div className="border-b border-subtle pb-2 flex items-center justify-between">
            <h3 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider">
              Recent Case Activity
            </h3>
            <Link to="/audit" className="text-[10px] font-mono text-[var(--primary-accent)] hover:underline">
              Audit Stream →
            </Link>
          </div>

          <div className="space-y-3 text-xs">
            {activity.length === 0 ? (
              <div className="p-4 text-center theme-subtext text-xs">
                No recent activity recorded in the judicial audit stream.
              </div>
            ) : (
              activity.slice(0, 4).map((act, i) => {
                let caseNum = 'SYSTEM';
                try {
                  const inputObj = typeof act.input === 'string' ? JSON.parse(act.input) : act.input;
                  caseNum = inputObj?.caseNumber || inputObj?.caseId || act.actorRole || 'AUDIT';
                } catch {
                  caseNum = act.actorRole || 'AUDIT';
                }

                const timeStr = act.createdAt
                  ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now';

                return (
                  <div key={act.id || i} className="p-2.5 theme-elevated rounded-sm space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono theme-subtext">
                      <span className="font-semibold text-[var(--primary-accent)]">{caseNum}</span>
                      <span>{timeStr}</span>
                    </div>
                    <p className="theme-heading leading-snug font-medium">
                      {act.action?.replace(/_/g, ' ') || 'Action logged'}
                    </p>
                    <p className="text-[10px] theme-subtext font-mono">
                      Actor: {act.actor?.name || act.actorRole || 'System Officer'}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;
