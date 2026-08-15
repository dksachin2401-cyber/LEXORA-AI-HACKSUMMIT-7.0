import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useAnimations } from '@/hooks/useAnimations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { lawyerDashboardStats, lawyerCases, todaysHearings } from '@/data/mockData';
import { Briefcase, Clock, CheckCircle, Calendar, FileText, Search, FolderOpen, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const LawyerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { containerVariants, itemVariants } = useAnimations();

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#C9A24B]" />
            Advocate & Legal Counsel Portal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Welcome back, {user?.name || 'Adv. Vikramaditya Sen'} | High Court Bar Association
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/ai/drafts"
            className="px-4 py-2.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#1B2C4F]" />
            <span>Draft Pleading Motion</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1 shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Total Active Briefs</p>
          <h2 className="text-2xl font-bold font-mono text-[#C9A24B]">{lawyerDashboardStats.totalCases} Cases</h2>
          <p className="text-[11px] text-emerald-400">↑ 12 New Active Filings</p>
        </div>

        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1 shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Arguments</p>
          <h2 className="text-2xl font-bold font-mono text-amber-400">{lawyerDashboardStats.pendingCases} Matters</h2>
          <p className="text-[11px] text-slate-300">Awaiting Counter Affidavit</p>
        </div>

        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1 shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Disposed Decrees</p>
          <h2 className="text-2xl font-bold font-mono text-emerald-400">{lawyerDashboardStats.closedCases} Decrees</h2>
          <p className="text-[11px] text-emerald-400">✓ Successful Relief Granted</p>
        </div>

        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1 shadow-xl">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Active Cause List Hearings</p>
          <h2 className="text-2xl font-bold font-mono text-cyan-400">{lawyerDashboardStats.activeHearings} Hearings</h2>
          <p className="text-[11px] text-slate-300">Scheduled for this Week</p>
        </div>
      </div>

      {/* Quick Tools Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/ai/drafts')}
          className="p-5 bg-[#132240] hover:bg-[#132240]/90 border border-white/15 hover:border-[#C9A24B] rounded-xl flex items-center gap-3 transition-all cursor-pointer shadow-lg group"
        >
          <div className="p-3 bg-[#C9A24B]/15 text-[#C9A24B] rounded-xl group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-serif font-bold text-white text-xs">File Pleading Motion</h3>
            <p className="text-[10px] text-slate-300">AI Draft Generator & Petitions</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/ai/research')}
          className="p-5 bg-[#132240] hover:bg-[#132240]/90 border border-white/15 hover:border-[#C9A24B] rounded-xl flex items-center gap-3 transition-all cursor-pointer shadow-lg group"
        >
          <div className="p-3 bg-[#C9A24B]/15 text-[#C9A24B] rounded-xl group-hover:scale-110 transition-transform">
            <Search className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-serif font-bold text-white text-xs">Case Law Research</h3>
            <p className="text-[10px] text-slate-300">Precedent Vector Search Engine</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/lawyer/cases')}
          className="p-5 bg-[#132240] hover:bg-[#132240]/90 border border-white/15 hover:border-[#C9A24B] rounded-xl flex items-center gap-3 transition-all cursor-pointer shadow-lg group"
        >
          <div className="p-3 bg-[#C9A24B]/15 text-[#C9A24B] rounded-xl group-hover:scale-110 transition-transform">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="font-serif font-bold text-white text-xs">My Client Briefs</h3>
            <p className="text-[10px] text-slate-300">Vault & Case Documents</p>
          </div>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases Table */}
        <div className="lg:col-span-8 bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
            <h2 className="text-base font-serif font-bold text-white">My Active Client Cases</h2>
            <Link to="/lawyer/cases" className="text-xs font-bold text-[#C9A24B] hover:underline flex items-center gap-1">
              View All Briefs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
                <tr>
                  <th className="px-4 py-3">Case Number</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Next Hearing</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {lawyerCases.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[#C9A24B] whitespace-nowrap">{c.caseNumber}</td>
                    <td className="px-4 py-3 font-semibold text-white max-w-xs truncate">{c.title}</td>
                    <td className="px-4 py-3 text-slate-300">{c.client}</td>
                    <td className="px-4 py-3 font-mono text-amber-300 whitespace-nowrap">{c.nextHearing}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Hearings Sidebar Card */}
        <div className="lg:col-span-4 bg-[#132240] border border-white/15 rounded-xl p-5 shadow-xl space-y-4">
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2 border-b border-white/15 pb-3">
            <Clock className="w-4 h-4 text-[#C9A24B]" />
            Upcoming Cause List Hearings
          </h2>

          <div className="space-y-3">
            {todaysHearings.slice(0, 4).map((h) => (
              <div key={h.id} className="p-3.5 bg-white/5 border border-white/15 rounded-xl space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    {h.time}
                  </span>
                  <StatusBadge status={h.status} />
                </div>
                <div className="text-xs font-mono font-bold text-[#C9A24B]">
                  {h.caseNumber}
                </div>
                <div className="text-xs text-white truncate font-semibold">
                  {h.title}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {h.courtRoom}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
