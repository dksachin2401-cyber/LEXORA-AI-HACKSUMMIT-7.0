import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Briefcase, Clock, Calendar, AlertTriangle, ChevronRight, FileText, Bot, FolderKanban, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/shared/StatusBadge';

export const JudgeDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Cases Judged', value: '412', icon: Briefcase, color: 'text-[#C9A24B]', bg: 'bg-[#C9A24B]/10' },
    { title: 'Pending Hearings', value: '28', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { title: 'Today\'s Docket', value: '6', icon: Calendar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { title: 'High Priority Matters', value: '4', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  ];

  const recentCases = [
    { id: '1', caseNumber: 'WP(C) 412/2024', title: 'State Bank of India vs. M/s Apex Enterprises', status: 'Active', priority: 'High', division: 'Commercial', nextHearing: '14-08-2026' },
    { id: '2', caseNumber: 'CRL.A. 9912/2023', title: 'State of Maharashtra vs. Vikramaditya Deshmukh', status: 'Pending', priority: 'High', division: 'Criminal', nextHearing: '18-08-2026' },
    { id: '3', caseNumber: 'CIV.SUIT 104/2025', title: 'Ramesh Patel vs. Municipal Corporation', status: 'Pending', priority: 'Medium', division: 'Civil', nextHearing: '22-08-2026' },
  ];

  return (
    <div className="space-y-6 text-white">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/15 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            Bench Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Presiding Officer: {user?.name || 'Hon\'ble Justice Rajesh Sharma'} | High Court Bench II
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/ai/analyzer" className="px-3.5 py-2 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
            <FileText className="w-4 h-4 text-[#1B2C4F]" />
            <span>Analyze Document</span>
          </Link>
          <Link to="/ai/evidence" className="px-3.5 py-2 border border-white/20 text-white hover:bg-white/10 rounded-lg text-xs font-semibold flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-[#C9A24B]" />
            <span>Add Bench Note / Evidence</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-[#132240] border border-white/15 rounded-xl p-5 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-[11px] text-slate-300 font-semibold uppercase tracking-wider">{s.title}</p>
              <h3 className="text-2xl font-serif font-bold text-white mt-1">{s.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Recommendation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="border-b border-white/10 pb-3">
              <h2 className="text-lg font-serif font-bold text-white">
                Prioritized Hearing Recommendation
              </h2>
              <p className="text-xs text-slate-300">Suggested by Lexora AI Workload Optimization Model</p>
            </div>

            <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/10">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="font-bold text-amber-300 text-sm">WP(C) 412/2024 — Commercial Debt Recovery</span>
                <StatusBadge status="High" />
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                <strong>AI Rationale:</strong> Commercial assets pledged under SARFAESI statutory notice require urgent interim stay consideration prior to financial quarter close. Precedent match indicates high risk of asset dissipation.
              </p>
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                <Link to="/ai/drafts" className="px-3.5 py-1.5 bg-[#C9A24B] text-[#1B2C4F] font-bold text-xs rounded hover:bg-[#D9B35C]">
                  Generate Draft Order
                </Link>
                <Link to="/ai/evidence" className="px-3.5 py-1.5 bg-white/15 text-white font-semibold text-xs rounded hover:bg-white/25 border border-white/20">
                  ➕ Add Bench Evidence Note
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Judicial Workbench Tools */}
        <div className="lg:col-span-1">
          <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-3 shadow-xl h-full flex flex-col justify-between">
            <div>
              <h3 className="text-base font-serif font-bold text-white mb-3">Judicial Workbench Tools</h3>
              <div className="space-y-2.5">
                <Link to="/ai/evidence" className="p-3 bg-[#C9A24B]/15 hover:bg-[#C9A24B]/25 rounded-lg border border-[#C9A24B]/40 flex items-center justify-between text-xs font-bold text-[#C9A24B] transition-colors">
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#C9A24B]" />
                    <span>Judicial Evidence & Notes Vault</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#C9A24B]" />
                </Link>
                <Link to="/ai/analyzer" className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 flex items-center justify-between text-xs font-semibold text-white transition-colors">
                  <span>AI Document & OCR Analyzer</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </Link>
                <Link to="/ai/similar-cases" className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 flex items-center justify-between text-xs font-semibold text-white transition-colors">
                  <span>Precedent Vector Search</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </Link>
                <Link to="/audit" className="p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 flex items-center justify-between text-xs font-semibold text-white transition-colors">
                  <span>System Audit Logs</span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Cause List Table */}
      <div className="bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/15 flex justify-between items-center bg-[#0F1B33]">
          <h2 className="text-base font-serif font-bold text-white">Active Cause List</h2>
          <Link to="/judge/cases" className="text-xs font-bold text-[#C9A24B] hover:underline flex items-center">
            View All Cases <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
              <tr>
                <th className="px-4 py-3">Case Number</th>
                <th className="px-4 py-3">Parties</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Division</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Next Hearing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {recentCases.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#C9A24B] whitespace-nowrap">{c.caseNumber}</td>
                  <td className="px-4 py-3 text-slate-200">{c.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{c.division}</td>
                  <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.priority} /></td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap font-mono">{c.nextHearing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JudgeDashboard;
