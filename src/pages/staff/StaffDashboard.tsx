import React, { useState, useEffect } from 'react';
import { Building2, CalendarPlus, FileCode, FolderKanban, CheckCircle, ShieldCheck, Building, Send, UserCheck, Plus, X, FolderOpen, Scale, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EfiledCase {
  id: string;
  fbn: string;
  tempCaseNo: string;
  petitioner: string;
  respondent: string;
  suitCategory: string;
  summary: string;
  date: string;
  status: string;
  courtroomAssigned?: string;
  judgeAssigned?: string;
}

export const StaffDashboard = () => {
  const [efiledCases, setEfiledCases] = useState<EfiledCase[]>(() => {
    const saved = localStorage.getItem('lexora_efiled_cases');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      {
        id: 'efile_seed_1',
        fbn: 'FBN/2026/894120',
        tempCaseNo: 'TEMP/MH/4109/2026',
        petitioner: 'Ramesh Patel',
        respondent: 'Municipal Corporation of Greater Mumbai',
        suitCategory: 'Civil Suit / Title Injunction',
        summary: 'Petition challenging road widening notice without statutory land acquisition compensation.',
        date: '2026-08-07 11:30 AM',
        status: 'FILED_PENDING_REGISTRY_REVIEW',
        courtroomAssigned: 'Pending Staff Allocation',
        judgeAssigned: 'Pending Bench Allocation'
      },
      {
        id: 'efile_seed_2',
        fbn: 'FBN/2026/741298',
        tempCaseNo: 'TEMP/MH/5102/2026',
        petitioner: 'M/s Apex Enterprises',
        respondent: 'State Bank of India & Ors.',
        suitCategory: 'Writ Petition (Article 226)',
        summary: 'Writ petition against Section 13(2) SARFAESI notice.',
        date: '2026-08-07 10:15 AM',
        status: 'FILED_PENDING_REGISTRY_REVIEW',
        courtroomAssigned: 'Pending Staff Allocation',
        judgeAssigned: 'Pending Bench Allocation'
      }
    ];
  });

  const [selectedCase, setSelectedCase] = useState<EfiledCase | null>(null);
  const [assignCourtroom, setAssignCourtroom] = useState('Courtroom #1');
  const [assignJudge, setAssignJudge] = useState('Hon\'ble Justice Rajesh Sharma (Commercial Debt Bench)');
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    localStorage.setItem('lexora_efiled_cases', JSON.stringify(efiledCases));
  }, [efiledCases]);

  const handleAssignAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;

    const updated = efiledCases.map((item) => {
      if (item.id === selectedCase.id) {
        return {
          ...item,
          status: 'REGISTRY_APPROVED_COURTROOM_ALLOCATED',
          courtroomAssigned: assignCourtroom,
          judgeAssigned: assignJudge
        };
      }
      return item;
    });

    setEfiledCases(updated);
    setActionMsg(`✓ Filing ${selectedCase.fbn} successfully verified and assigned to ${assignCourtroom} (${assignJudge})!`);
    setSelectedCase(null);

    setTimeout(() => setActionMsg(''), 5000);
  };

  const pendingCount = efiledCases.filter((c) => c.status === 'FILED_PENDING_REGISTRY_REVIEW').length;

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
          <Building className="w-6 h-6 text-[#C9A24B]" />
          Court Staff & Registry Officer Portal
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Bench Registrar: Amit Kumar | High Court Registry Bench II — Active Filing Verification & Summons Dispatch Desk
        </p>
      </div>

      {/* Action Status Notification */}
      {actionMsg && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1 shadow-lg">
          <p className="text-xs text-slate-300 font-semibold uppercase">Pending e-Filing Verification Queue</p>
          <h3 className="text-2xl font-bold font-serif text-[#C9A24B] mt-1">{pendingCount} Incoming Petitions</h3>
          <p className="text-[10px] text-amber-300 font-bold">Requires Registry Courtroom Allocation</p>
        </div>

        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1 shadow-lg">
          <p className="text-xs text-slate-300 font-semibold uppercase">Pending Summons Dispatches</p>
          <h3 className="text-2xl font-bold font-serif text-emerald-400 mt-1">4 Notices Ready</h3>
          <p className="text-[10px] text-slate-300">Order V CPC Summons Ready for Dispatch</p>
        </div>

        <div className="bg-[#132240] border border-white/15 p-5 rounded-xl space-y-1 shadow-lg">
          <p className="text-xs text-slate-300 font-semibold uppercase">Courtroom Bench Allocations</p>
          <h3 className="text-2xl font-bold font-serif text-white mt-1">4 Active Benches</h3>
          <p className="text-[10px] text-slate-300">Courtrooms #1 to #4 Operational</p>
        </div>
      </div>

      {/* Incoming e-Filing Verification Queue Table */}
      <div className="bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
          <div>
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-[#C9A24B]" />
              Incoming Electronic Case Filing Queue (Citizen & Advocate e-Filings)
            </h2>
            <p className="text-xs text-slate-300">Verify petitioner documents, assign courtroom, and allocate presiding judge</p>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">{efiledCases.length} Total Registered Petitions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
              <tr>
                <th className="px-4 py-3">FBN Reference</th>
                <th className="px-4 py-3">Petitioner vs Respondent</th>
                <th className="px-4 py-3">Suit Category</th>
                <th className="px-4 py-3">Courtroom & Judge Assigned</th>
                <th className="px-4 py-3">Filing Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {efiledCases.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-[#C9A24B] whitespace-nowrap">
                    <div>{c.fbn}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{c.tempCaseNo}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-white block">{c.petitioner}</span>
                    <span className="text-slate-300">vs. {c.respondent}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-300 font-medium">{c.suitCategory}</td>
                  <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                    {c.courtroomAssigned && c.courtroomAssigned.includes('Courtroom') ? (
                      <div>
                        <span className="font-bold text-emerald-300 block">{c.courtroomAssigned}</span>
                        <span className="text-[10px] text-slate-400">{c.judgeAssigned}</span>
                      </div>
                    ) : (
                      <span className="text-amber-400 font-bold italic">Awaiting Registry Allocation</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                      c.status.includes('APPROVED')
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {c.status.includes('APPROVED') ? '✓ COURTROOM ALLOCATED' : 'PENDING REVIEW'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedCase(c)}
                      className="px-3.5 py-1.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] text-xs font-bold rounded-lg shadow flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{c.status.includes('APPROVED') ? 'Re-assign Bench' : 'Assign Courtroom & Judge'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/15 pb-3">
            <CalendarPlus className="w-5 h-5 text-[#C9A24B]" />
            <h2 className="font-serif font-bold text-white text-base">Judicial Bench & Courtroom Allocations</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Allocate courtrooms, listing queues, and sync hearing dates with presiding bench schedules.
          </p>
          <Link
            to="/admin/allocations"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] rounded-xl text-xs font-extrabold shadow-lg cursor-pointer"
          >
            <Building className="w-4 h-4 text-[#1B2C4F]" />
            <span>Manage Courtroom Allocations</span>
          </Link>
        </div>

        <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/15 pb-3">
            <FileCode className="w-5 h-5 text-[#C9A24B]" />
            <h2 className="font-serif font-bold text-white text-base">Official Summons & Real Legal Notices</h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Generate authentic High Court & District Court Summons under Order V CPC, Section 41A CrPC, and Section 138 NI Act with Process Server coupons.
          </p>
          <Link
            to="/staff/notices"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] rounded-xl text-xs font-extrabold shadow-lg cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#1B2C4F]" />
            <span>Open Real Summons & Notice Generator</span>
          </Link>
        </div>
      </div>

      {/* Courtroom Assignment Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#132240] border border-white/20 rounded-2xl w-full max-w-lg text-white shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
              <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#C9A24B]" />
                Assign Courtroom & Presiding Officer to e-Filing
              </h2>
              <button onClick={() => setSelectedCase(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignAllocation} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1">
                <div className="font-bold text-[#C9A24B]">{selectedCase.fbn} ({selectedCase.tempCaseNo})</div>
                <div className="text-white font-semibold">{selectedCase.petitioner} vs. {selectedCase.respondent}</div>
                <div className="text-slate-300">Category: {selectedCase.suitCategory}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target Courtroom:</label>
                <select
                  value={assignCourtroom}
                  onChange={(e) => setAssignCourtroom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0F1B33] border border-white/20 rounded-xl text-white font-bold cursor-pointer"
                >
                  <option value="Courtroom #1">Courtroom #1 (Commercial Debt & SARFAESI Bench)</option>
                  <option value="Courtroom #2">Courtroom #2 (Criminal Appeals & Bail Bench)</option>
                  <option value="Courtroom #3">Courtroom #3 (Constitutional Writs Art 226 Bench)</option>
                  <option value="Courtroom #4">Courtroom #4 (Civil Land & Property Bench)</option>
                  <option value="Courtroom #5">Courtroom #5 (Arbitration & Contractual Disputes Bench)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Presiding Judicial Officer:</label>
                <select
                  value={assignJudge}
                  onChange={(e) => setAssignJudge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0F1B33] border border-white/20 rounded-xl text-white font-bold cursor-pointer"
                >
                  <option value="Hon'ble Justice Rajesh Sharma">Hon'ble Justice Rajesh Sharma (Senior High Court Judge)</option>
                  <option value="Hon'ble Justice Meenakshi Sundaram">Hon'ble Justice Meenakshi Sundaram (Criminal Division)</option>
                  <option value="Hon'ble Justice Vikramaditya Deshmukh">Hon'ble Justice Vikramaditya Deshmukh (Writ Bench)</option>
                  <option value="Hon'ble Justice Sunita Rao">Hon'ble Justice Sunita Rao (Civil Division)</option>
                  <option value="Hon'ble Justice Ananya Roy">Hon'ble Justice Ananya Roy (Commercial Bench)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-extrabold text-xs rounded-xl shadow-lg mt-2 cursor-pointer"
              >
                Confirm Allocation & Approve Case Filing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
