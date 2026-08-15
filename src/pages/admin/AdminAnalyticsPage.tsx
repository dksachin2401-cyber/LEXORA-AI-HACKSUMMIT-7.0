import React, { useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle, PieChart, Activity, Download, RefreshCw, Calendar } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState('2026-YTD');
  const [actionMsg, setActionMsg] = useState('');

  const monthlyData = [
    { month: 'Jan 2026', filed: 1200, disposed: 1450, rate: '120.8%' },
    { month: 'Feb 2026', filed: 1350, disposed: 1510, rate: '111.8%' },
    { month: 'Mar 2026', filed: 1100, disposed: 1320, rate: '120.0%' },
    { month: 'Apr 2026', filed: 1420, disposed: 1600, rate: '112.6%' },
    { month: 'May 2026', filed: 1280, disposed: 1490, rate: '116.4%' },
    { month: 'Jun 2026', filed: 1150, disposed: 1380, rate: '120.0%' },
    { month: 'Jul 2026', filed: 1390, disposed: 1550, rate: '111.5%' },
  ];

  const benchDisposalData = [
    { bench: 'Commercial & Banking Bench', judge: 'Justice Rajesh Sharma', disposalRate: '94.2%', avgDays: '42 Days', totalCases: 1420 },
    { bench: 'Criminal Appeals & Bail Bench', judge: 'Justice Meenakshi Sundaram', disposalRate: '91.8%', avgDays: '18 Days', totalCases: 2150 },
    { bench: 'Constitutional Writs Bench', judge: 'Justice Vikramaditya Deshmukh', disposalRate: '88.5%', avgDays: '65 Days', totalCases: 890 },
    { bench: 'Civil Land & Property Bench', judge: 'Justice Sunita Rao', disposalRate: '86.4%', avgDays: '90 Days', totalCases: 1780 },
  ];

  const handleExportAnalytics = () => {
    const csvContent = `Month,Cases Filed,Cases Disposed,Clearance Rate\n` +
      monthlyData.map(d => `${d.month},${d.filed},${d.disposed},${d.rate}`).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `National_Judicial_Analytics_${timeRange}.csv`;
    a.click();
    setActionMsg(`System Analytics CSV report (${timeRange}) exported successfully!`);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#C9A24B]" />
            National Judicial Analytics & Disposal Rate Dashboard
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Executive Performance Metrics, Backlog Forecasts & Bench Clearance Rates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-[#0F1B33] border border-white/20 rounded-xl text-xs font-bold text-[#C9A24B] outline-none cursor-pointer"
          >
            <option value="2026-YTD">Year to Date (2026)</option>
            <option value="Q2-2026">Q2 2026 (Apr-Jun)</option>
            <option value="Q1-2026">Q1 2026 (Jan-Mar)</option>
          </select>

          <button
            onClick={handleExportAnalytics}
            className="px-4 py-2 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#1B2C4F]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {actionMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">National Clearance Rate</p>
          <h2 className="text-2xl font-bold font-mono text-emerald-400">116.2%</h2>
          <p className="text-[11px] text-slate-300">Disposals exceed new case filings</p>
        </div>

        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Total Disposals (2026)</p>
          <h2 className="text-2xl font-bold font-mono text-[#C9A24B]">10,300 Cases</h2>
          <p className="text-[11px] text-emerald-400">↑ 14.8% vs Previous Period</p>
        </div>

        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Pending Backlog Reduction</p>
          <h2 className="text-2xl font-bold font-mono text-cyan-400">-1,340 Cases</h2>
          <p className="text-[11px] text-slate-300">Backlog decreased across High Courts</p>
        </div>

        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">AI Precedent Citation Speed</p>
          <h2 className="text-2xl font-bold font-mono text-purple-400">0.32 Sec</h2>
          <p className="text-[11px] text-slate-300">100% Citation Grounding Rate</p>
        </div>
      </div>

      {/* Monthly Disposal & Filings Trend Table */}
      <div className="bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#C9A24B]" />
            Monthly Case Filings vs. Disposals Breakdown (2026)
          </h2>
          <span className="text-xs text-slate-300 font-mono font-bold">Average Clearance: 116.2%</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
              <tr>
                <th className="px-4 py-3">Month</th>
                <th className="px-4 py-3">New Filings</th>
                <th className="px-4 py-3">Disposed Cases</th>
                <th className="px-4 py-3">Clearance Rate</th>
                <th className="px-4 py-3">Net Backlog Shift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {monthlyData.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#C9A24B]">{row.month}</td>
                  <td className="px-4 py-3 font-mono text-white">{row.filed}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{row.disposed}</td>
                  <td className="px-4 py-3 font-mono text-cyan-300 font-extrabold">{row.rate}</td>
                  <td className="px-4 py-3 font-mono text-emerald-400">-{row.disposed - row.filed} Cases</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bench Performance Matrix */}
      <div className="bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#C9A24B]" />
            Judicial Bench Clearance Rates & Hearing Efficiency
          </h2>
          <span className="text-xs text-slate-300">Target: &gt;85% Clearance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
              <tr>
                <th className="px-4 py-3">Bench Division</th>
                <th className="px-4 py-3">Presiding Officer</th>
                <th className="px-4 py-3">Disposal Rate</th>
                <th className="px-4 py-3">Avg Resolution Time</th>
                <th className="px-4 py-3">Total Cases Managed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {benchDisposalData.map((b, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-white">{b.bench}</td>
                  <td className="px-4 py-3 text-slate-300">{b.judge}</td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">{b.disposalRate}</td>
                  <td className="px-4 py-3 font-mono text-amber-300">{b.avgDays}</td>
                  <td className="px-4 py-3 font-mono text-white">{b.totalCases}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
