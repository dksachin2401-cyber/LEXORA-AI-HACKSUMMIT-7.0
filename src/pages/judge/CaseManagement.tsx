import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, FolderOpen, Search, CheckCircle, Edit3, Trash2, RefreshCw } from 'lucide-react';
import { NewCaseModal } from '@/components/cases/NewCaseModal';
import { api } from '@/services/api';

export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  division: string;
  priority: string;
  filingDate: string;
  nextHearing: string;
  status: string;
  petitioner?: string;
  respondent?: string;
  court?: string;
  type?: string;
}

export const CaseManagement = () => {
  const navigate = useNavigate();
  const [casesList, setCasesList] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Editing state
  const [editingCase, setEditingCase] = useState<CaseItem | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const data = await api.getCases();
      const list = Array.isArray(data) ? data : data?.data || [];
      setCasesList(list);
    } catch (err) {
      console.error('Failed to fetch cases from database:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filters = ['All', 'Pending', 'Active', 'Closed'];

  const filteredCases = useMemo(() => {
    return casesList.filter((c) => {
      const matchesStatus = statusFilter === 'All' || c.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesSearch =
        (c.caseNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.division || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [casesList, statusFilter, searchQuery]);

  const handleAddCase = async (newCaseData: any) => {
    try {
      const created = await api.createCase(newCaseData);
      setCasesList((prev) => [created, ...prev]);
      setActionMsg(`New case ${created.caseNumber || newCaseData.caseNumber} filed and registered successfully in database!`);
    } catch (err: any) {
      setActionMsg(`Case creation error: ${err.message}`);
    }
  };

  const handleDeleteCase = async (id: string, caseNo: string) => {
    if (window.confirm(`Are you sure you want to remove case ${caseNo} from registry?`)) {
      try {
        await api.deleteCase(id);
        setCasesList((prev) => prev.filter((c) => c.id !== id));
        setActionMsg(`Case ${caseNo} removed from database.`);
      } catch (err: any) {
        setActionMsg(`Delete error: ${err.message}`);
      }
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: 'Active' | 'Pending' | 'Closed') => {
    try {
      await api.updateCase(id, { status: newStatus });
      setCasesList((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
      setEditingCase(null);
      setActionMsg(`Case status updated to ${newStatus} in database.`);
    } catch (err: any) {
      setActionMsg(`Update error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Master Judicial Case Registry & Vault
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Manage, track, process, and file judicial case records across all court divisions
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="theme-primary-btn px-4 py-2.5 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>File New Case Entry</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="theme-card border border-subtle rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg">
        {/* Search */}
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="w-4 h-4 theme-subtext absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by case number, title, or division..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 theme-elevated border border-subtle rounded-lg text-xs theme-heading placeholder:theme-subtext outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 theme-elevated p-1 rounded-xl border border-subtle">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === f
                  ? 'theme-primary-btn font-bold shadow-sm'
                  : 'theme-subtext hover:theme-heading'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="theme-card border border-subtle rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-subtle theme-elevated flex justify-between items-center">
          <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Registered Cases ({filteredCases.length})
          </h2>
          <span className="text-xs theme-subtext">Live Case Tracking</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="theme-elevated theme-subtext font-serif uppercase tracking-wider border-b border-subtle">
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
            <tbody className="divide-y divide-subtle">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-blue-500/5 transition-colors">
                  <td
                    onClick={() => navigate(`/judge/cases/${c.id}`)}
                    className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer whitespace-nowrap"
                  >
                    {c.caseNumber}
                  </td>
                  <td
                    onClick={() => navigate(`/judge/cases/${c.id}`)}
                    className="px-4 py-3 font-semibold theme-heading hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                  >
                    {c.title}
                  </td>
                  <td className="px-4 py-3 theme-subtext">{c.division}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.priority === 'High'
                          ? 'badge-rejected'
                          : c.priority === 'Medium'
                          ? 'badge-pending'
                          : 'theme-secondary-btn'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 theme-subtext whitespace-nowrap">{c.filingDate}</td>
                  <td className="px-4 py-3 font-mono theme-heading whitespace-nowrap">{c.nextHearing || 'TBD'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        c.status === 'Active'
                          ? 'badge-supported'
                          : c.status === 'Pending'
                          ? 'badge-pending'
                          : 'theme-secondary-btn'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                    <button
                      onClick={() => setEditingCase(c)}
                      className="p-1.5 theme-secondary-btn rounded cursor-pointer"
                      title="Edit Case Status"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteCase(c.id, c.caseNumber)}
                      className="p-1.5 badge-rejected rounded cursor-pointer"
                      title="Remove Case"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
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
          <div className="theme-card border border-subtle rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="font-serif font-bold text-base text-blue-600 dark:text-blue-400">
              Update Status: {editingCase.caseNumber}
            </h3>
            <p className="text-xs theme-subtext">{editingCase.title}</p>
            <div className="space-y-2">
              <label className="block text-xs font-bold theme-heading">Select Status:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(editingCase.id, 'Active')}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Active
                </button>
                <button
                  onClick={() => handleUpdateStatus(editingCase.id, 'Pending')}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Pending
                </button>
                <button
                  onClick={() => handleUpdateStatus(editingCase.id, 'Closed')}
                  className="flex-1 py-2 theme-secondary-btn text-xs font-bold rounded-lg cursor-pointer"
                >
                  Closed
                </button>
              </div>
            </div>
            <button
              onClick={() => setEditingCase(null)}
              className="w-full py-2 theme-secondary-btn text-xs font-semibold rounded-lg cursor-pointer"
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
