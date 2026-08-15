import React, { useState } from 'react';
import { Building, Plus, CheckCircle, X, Edit, Users, Calendar, AlertCircle } from 'lucide-react';

interface BenchAllocation {
  id: string;
  courtroom: string;
  judgeName: string;
  benchType: string;
  division: string;
  listedCases: number;
  status: 'Active Hearing' | 'In Chamber' | 'Adjourned';
  timeSlot: string;
}

export const BenchAllocationPage: React.FC = () => {
  const [allocations, setAllocations] = useState<BenchAllocation[]>([
    {
      id: 'alloc_1',
      courtroom: 'Courtroom #1 (Main Hall)',
      judgeName: 'Hon\'ble Justice Rajesh Sharma',
      benchType: 'Division Bench (Bench I)',
      division: 'Commercial Recovery & SARFAESI Act',
      listedCases: 14,
      status: 'Active Hearing',
      timeSlot: '10:30 AM - 04:30 PM'
    },
    {
      id: 'alloc_2',
      courtroom: 'Courtroom #2 (Annexure Block B)',
      judgeName: 'Hon\'ble Justice Meenakshi Sundaram',
      benchType: 'Single Bench',
      division: 'Criminal Appeals & Bail Applications',
      listedCases: 22,
      status: 'Active Hearing',
      timeSlot: '10:30 AM - 04:30 PM'
    },
    {
      id: 'alloc_3',
      courtroom: 'Courtroom #3 (Chamber Bench)',
      judgeName: 'Hon\'ble Justice Vikramaditya Deshmukh',
      benchType: 'Full Constitution Bench',
      division: 'Article 226 Writ Petitions',
      listedCases: 8,
      status: 'In Chamber',
      timeSlot: '02:00 PM - 05:00 PM'
    },
    {
      id: 'alloc_4',
      courtroom: 'Courtroom #4 (Civil Wing)',
      judgeName: 'Hon\'ble Justice Sunita Rao',
      benchType: 'Single Bench',
      division: 'Civil Property Title & Land Suits',
      listedCases: 18,
      status: 'Active Hearing',
      timeSlot: '10:30 AM - 04:30 PM'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Form inputs
  const [room, setRoom] = useState('Courtroom #5 (Commercial Wing)');
  const [judge, setJudge] = useState('Hon\'ble Justice Ananya Roy');
  const [benchType, setBenchType] = useState('Single Bench');
  const [division, setDivision] = useState('Arbitration & Intellectual Property');
  const [timeSlot, setTimeSlot] = useState('10:30 AM - 04:30 PM');

  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlloc: BenchAllocation = {
      id: `alloc_${Date.now()}`,
      courtroom: room,
      judgeName: judge,
      benchType,
      division,
      listedCases: 10,
      status: 'Active Hearing',
      timeSlot
    };
    setAllocations([...allocations, newAlloc]);
    setShowAddModal(false);
    setActionMsg(`New Judicial Bench Allocation created for ${room} (${judge})`);
  };

  const handleToggleStatus = (id: string) => {
    setAllocations(prev => prev.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'Active Hearing' ? 'In Chamber' : 'Active Hearing';
        setActionMsg(`Updated status for ${a.courtroom} to ${nextStatus}`);
        return { ...a, status: nextStatus };
      }
      return a;
    }));
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-[#C9A24B]" />
            Judicial Bench & Courtroom Allocation Manager
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Assign Presiding Officers, Manage Courtroom Halls, Special Bench Divisions & Daily Hearing Rosters
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bench Allocation</span>
        </button>
      </div>

      {/* Action Notification */}
      {actionMsg && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#132240] border border-white/15 p-4 rounded-xl space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Active Benches Today</p>
          <h2 className="text-2xl font-bold font-mono text-[#C9A24B]">{allocations.length} Courtrooms</h2>
        </div>
        <div className="bg-[#132240] border border-white/15 p-4 rounded-xl space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Total Listed Hearings</p>
          <h2 className="text-2xl font-bold font-mono text-emerald-400">
            {allocations.reduce((sum, a) => sum + a.listedCases, 0)} Cases Listed
          </h2>
        </div>
        <div className="bg-[#132240] border border-white/15 p-4 rounded-xl space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Judges Assigned</p>
          <h2 className="text-2xl font-bold font-mono text-cyan-400">{allocations.length} Officers</h2>
        </div>
        <div className="bg-[#132240] border border-white/15 p-4 rounded-xl space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase">Court Clearance Status</p>
          <h2 className="text-2xl font-bold font-mono text-purple-400">100% Operational</h2>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-[#C9A24B]" />
            Official Bench Roster & Courtroom Allocation List ({allocations.length})
          </h2>
          <span className="text-xs text-slate-300 font-mono">Live Cause List Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
              <tr>
                <th className="px-4 py-3">Courtroom & Hall</th>
                <th className="px-4 py-3">Presiding Judicial Officer</th>
                <th className="px-4 py-3">Bench Type & Division</th>
                <th className="px-4 py-3">Time Slot</th>
                <th className="px-4 py-3">Listed Cases</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {allocations.map((a) => (
                <tr key={a.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold text-[#C9A24B] whitespace-nowrap">{a.courtroom}</td>
                  <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{a.judgeName}</td>
                  <td className="px-4 py-3 text-slate-300">
                    <div className="font-bold text-slate-200">{a.benchType}</div>
                    <div className="text-[10px] text-slate-400">{a.division}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300 whitespace-nowrap">{a.timeSlot}</td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400 whitespace-nowrap">{a.listedCases} Cases</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      a.status === 'Active Hearing' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(a.id)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded text-xs font-bold transition-colors cursor-pointer"
                    >
                      Toggle Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Allocation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#132240] border border-white/20 rounded-2xl w-full max-w-md text-white shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
              <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-[#C9A24B]" />
                Create New Judicial Bench Allocation
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAllocation} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Courtroom & Hall Location:</label>
                <input
                  type="text"
                  required
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Presiding Judicial Officer:</label>
                <input
                  type="text"
                  required
                  value={judge}
                  onChange={(e) => setJudge(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bench Type:</label>
                  <select
                    value={benchType}
                    onChange={(e) => setBenchType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-white"
                  >
                    <option value="Single Bench">Single Bench</option>
                    <option value="Division Bench (Bench I)">Division Bench</option>
                    <option value="Full Constitution Bench">Full Bench</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time Slot:</label>
                  <input
                    type="text"
                    required
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Special Bench Division:</label>
                <input
                  type="text"
                  required
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold rounded-xl shadow-lg mt-2 cursor-pointer"
              >
                Publish Bench Roster Allocation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchAllocationPage;
