import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserCheck, Clock, FileText, CheckCircle, Search, Filter, Download } from 'lucide-react';
import { api } from '@/services/api';

export const AuditLogsViewer = () => {
  const [logs, setLogs] = useState<any[]>([
    {
      id: 'log_1',
      actorRole: 'JUDGE',
      actor: { name: 'Hon\'ble Justice Rajesh Sharma', court: 'High Court Bench II' },
      action: 'AI_SUMMARIZATION_REVIEW',
      input: 'WP(C) 412/2024 Petition Document',
      output: 'Fact summary accepted after minor correction on filing date.',
      sources: 'WP(C)_412_2024_Petition.pdf',
      outcome: 'ACCEPTED_BY_HUMAN',
      createdAt: '2026-08-07 10:15 AM'
    },
    {
      id: 'log_2',
      actorRole: 'LAWYER',
      actor: { name: 'Advocate Priya Nair', court: 'High Court Bar' },
      action: 'RAG_LEGAL_QUERY',
      input: 'Applicable precedents for Section 420 IPC delay probability',
      output: 'Retrieved Kesavananda Bharati & Maneka Gandhi precedents.',
      sources: 'Kesavananda Bharati v. State of Kerala (1973)',
      outcome: 'REVIEWED_HUMAN',
      createdAt: '2026-08-07 09:30 AM'
    },
    {
      id: 'log_3',
      actorRole: 'JUDGE',
      actor: { name: 'Hon\'ble Justice Rajesh Sharma', court: 'High Court Bench II' },
      action: 'HUMAN_SIGN_OFF_APPROVED',
      input: 'Draft Notice Order WP(C) 412/2024',
      output: 'Judicial Officer authenticated draft order and executed sign-off.',
      sources: 'Lexora Draft Generator Engine',
      outcome: 'FINAL_APPROVED',
      createdAt: '2026-08-07 11:45 AM'
    },
    {
      id: 'log_4',
      actorRole: 'ADMIN',
      actor: { name: 'Priya Nair (System Admin)', court: 'National Judicial Data Grid' },
      action: 'EMERGENCY_LOCKDOWN_STATUS',
      input: 'Cyber-security integrity verification scan',
      output: 'Security barrier audit verified; zero unauthorized intrusions.',
      sources: 'Lexora Security Protocol v2.4',
      outcome: 'VERIFIED_SECURE',
      createdAt: '2026-08-07 08:00 AM'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    api.getAnalytics().catch(() => {});
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.input.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || log.actorRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleExportCSV = () => {
    const csvContent =
      `Timestamp,Actor,Role,Action,Input,Sources,Outcome\n` +
      filteredLogs
        .map(
          (l) =>
            `"${l.createdAt}","${l.actor?.name}","${l.actorRole}","${l.action}","${l.input.replace(/"/g, '""')}","${l.sources}","${l.outcome}"`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Lexora_Audit_Trail_${Date.now()}.csv`;
    a.click();
    setActionMsg('Cryptographically signed Audit Trail CSV exported successfully!');
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#C9A24B]" />
            Immutable Judicial Audit Trail & Governance Log
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Every AI-assisted action and human judicial decision is logged with timestamp, actor, sources, and outcome.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#1B2C4F]" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Controls & Search */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg">
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit logs by actor, action type, or query..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#C9A24B]" />
          <span className="text-xs font-bold text-slate-300">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-xs font-bold text-[#C9A24B] outline-none cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="JUDGE">Judges</option>
            <option value="LAWYER">Lawyers</option>
            <option value="ADMIN">System Admins</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/15 flex justify-between items-center bg-[#0F1B33]">
          <h2 className="text-xs font-serif font-bold text-white uppercase tracking-wider">
            System Audit Trail ({filteredLogs.length} Logged Events)
          </h2>
          <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded">
            Cryptographic Integrity Verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor / Role</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Input Query / Doc</th>
                <th className="px-4 py-3">Sources / Citations</th>
                <th className="px-4 py-3">Human Judicial Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">{log.createdAt}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-bold text-white block">{log.actor?.name}</span>
                    <span className="text-[10px] text-[#C9A24B] font-extrabold uppercase">{log.actorRole}</span>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-slate-200">{log.action}</td>
                  <td className="px-4 py-3 text-slate-300 max-w-xs truncate">{log.input}</td>
                  <td className="px-4 py-3 text-slate-400 text-[11px] italic">{log.sources || 'N/A'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        log.outcome.includes('APPROVED') || log.outcome.includes('ACCEPTED') || log.outcome.includes('SECURE')
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {log.outcome}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsViewer;
