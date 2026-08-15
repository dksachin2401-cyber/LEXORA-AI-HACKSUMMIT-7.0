import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderOpen, Search, CheckCircle, Edit3, Trash2 } from 'lucide-react';
import { mockCases, type CaseItem } from '@/data/mockData';
import { NewCaseModal } from '@/components/cases/NewCaseModal';

export const CaseManagement = () => {
  const navigate = useNavigate();
  const [casesList, setCasesList] = useState<CaseItem[]>(mockCases);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Editing state
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);

  const filters = ['All', 'Pending', 'Active', 'Closed'];

  const filteredCases = useMemo(() => {
    return casesList.filter((c) => {
      const matchesStatus = statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch =
        c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.division.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [casesList, statusFilter, searchQuery]);

  const handleAddCase = (newCase: CaseItem) => {
    setCasesList([newCase, ...casesList]);
    setActionMsg(`New case ${newCase.caseNumber} filed and registered successfully!`);
  };

  const handleDeleteCase = (id: string, caseNo: string) => {
    if (window.confirm(`Are you sure you want to remove case ${caseNo} from registry?`)) {
      setCasesList((prev) => prev.filter((c) => c.id !== id));
      setActionMsg(`Case ${caseNo} removed from registry.`);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: 'Active' | 'Pending' | 'Closed') => {
    setCasesList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    setEditingCase(null);
    setActionMsg(`Case status updated to ${newStatus}.`);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Page Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-[#C9A24B]" />
            Master Judicial Case Registry & Vault
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Manage, track, process, and file judicial case records across all court divisions
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[#1B2C4F]" />
          <span>File New Case Entry</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg">
        {/* Search */}
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by case number, title, or division..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#0F1B33] p-1 rounded-xl border border-white/20">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === f
                  ? 'bg-[#C9A24B] text-[#1B2C4F] font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-[#C9A24B]" />
            Registered Cases ({filteredCases.length})
          </h2>
          <span className="text-xs text-slate-300">Live Case Tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
              <tr>
                <th className="px-4 py-3">Case Number</th>
                <th className="px-4 py-3">Title / Parties</th>
                <th className="px-4 py-3">Division</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Filing Date</th>
                <th className="px-4 py-3">Next Hearing</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td
                    onClick={() => navigate(`/judge/cases/${c.id}`)}
                    className="px-4 py-3 font-mono font-bold text-[#C9A24B] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    {c.caseNumber}
                  </td>
                  <td
                    onClick={() => navigate(`/judge/cases/${c.id}`)}
                    className="px-4 py-3 font-semibold text-white hover:text-[#C9A24B] cursor-pointer"
                  >
                    {c.title}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{c.division}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.priority === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : c.priority === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{c.filingDate}</td>
                  <td className="px-4 py-3 font-mono text-slate-200 whitespace-nowrap">{c.nextHearing || 'TBD'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        c.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : c.status === 'Pending'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => setEditingCase(c)}
                      className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded cursor-pointer"
                      title="Edit Case Status"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-[#C9A24B]" />
                    </button>
                    <button
                      onClick={() => handleDeleteCase(c.id, c.caseNumber)}
                      className="p-1.5 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 rounded cursor-pointer"
                      title="Remove Case"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* File New Case Modal */}
      <NewCaseModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onAddCase={handleAddCase}
      />

      {/* Quick Edit Case Status Modal */}
      {editingCase && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#132240] border border-white/20 rounded-2xl w-full max-w-sm text-white p-5 space-y-4">
            <h3 className="font-serif font-bold text-base text-[#C9A24B]">
              Update Status: {editingCase.caseNumber}
            </h3>
            <p className="text-xs text-slate-300">{editingCase.title}</p>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-200">Select Status:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(editingCase.id, 'Active')}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
                >
                  Active
                </button>
                <button
                  onClick={() => handleUpdateStatus(editingCase.id, 'Pending')}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg"
                >
                  Pending
                </button>
                <button
                  onClick={() => handleUpdateStatus(editingCase.id, 'Closed')}
                  className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold rounded-lg"
                >
                  Closed
                </button>
              </div>
            </div>
            <button
              onClick={() => setEditingCase(null)}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;
