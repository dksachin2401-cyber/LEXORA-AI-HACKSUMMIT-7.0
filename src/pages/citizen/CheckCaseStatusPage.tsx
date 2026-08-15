import React, { useState } from 'react';
import { Search, FileText, Calendar, CheckCircle, Clock, ShieldCheck, Download } from 'lucide-react';

export const CheckCaseStatusPage: React.FC = () => {
  const [cnrNumber, setCnrNumber] = useState('CIV.SUIT 104/2025');
  const [caseDetails, setCaseDetails] = useState<any>({
    cnr: 'MHBM010041202025',
    caseNumber: 'CIV.SUIT 104/2025',
    title: 'Ramesh Patel vs. Municipal Corporation of Greater Mumbai',
    petitioner: 'Ramesh Patel (Citizen)',
    respondent: 'Municipal Corporation & Ors.',
    court: 'Courtroom #4 — District Civil Court, Bombay',
    judge: 'Hon\'ble Justice Sunita Rao',
    filingDate: '15th January 2025',
    nextHearing: '22nd August 2026',
    stage: 'Filing of Written Statements (Order VIII Rule 1 CPC)',
    status: 'Pending Next Hearing',
    plainSummary: 'This case involves a civil land title dispute regarding a municipal road widening notice. The next step is for municipal authorities to file their written reply.',
    history: [
      { date: '15 Jan 2025', business: 'Case Registered & CNR Assigned', status: 'Completed' },
      { date: '10 Feb 2025', business: 'Summons Issued to Respondent', status: 'Completed' },
      { date: '14 May 2025', business: 'Respondent Appearance & Notice Served', status: 'Completed' },
      { date: '22 Aug 2026', business: 'Filing of Written Statement & Arguments', status: 'Scheduled' }
    ]
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnrNumber.trim()) return;
    setCaseDetails({
      cnr: 'MHBM01' + Math.floor(100000000 + Math.random() * 900000000),
      caseNumber: cnrNumber.toUpperCase(),
      title: 'State Bank of India vs. Apex Commercial Ltd.',
      petitioner: 'State Bank of India',
      respondent: 'Apex Commercial Ltd. & Ors.',
      court: 'Courtroom #1 — High Court of Judicature',
      judge: 'Hon\'ble Justice Rajesh Sharma',
      filingDate: '10th March 2024',
      nextHearing: '14th August 2026',
      stage: 'Final Arguments & Judgment Reservation',
      status: 'Active Hearing',
      plainSummary: 'Commercial debt recovery writ petition under SARFAESI Act. Final oral arguments scheduled for next hearing date.',
      history: [
        { date: '10 Mar 2024', business: 'Writ Petition Registered', status: 'Completed' },
        { date: '01 Oct 2024', business: 'Interim Injunction Order Granted', status: 'Completed' },
        { date: '14 Aug 2026', business: 'Final Arguments & Judgment Reservation', status: 'Scheduled' }
      ]
    });
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
          <Search className="w-6 h-6 text-[#C9A24B]" />
          e-Courts Case Status & Hearing Progress Tracker
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Track Live Hearing Dates, Case Progress, Stage of Suit, and Order History without visiting a courthouse
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Enter CNR Number or Case Number (e.g. CIV.SUIT 104/2025 or MHBM010041202025)..."
            value={cnrNumber}
            onChange={(e) => setCnrNumber(e.target.value)}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B]"
          />
          <button type="submit" className="px-6 py-3 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2">
            <Search className="w-4 h-4 text-[#1B2C4F]" />
            <span>Search Case Progress</span>
          </button>
        </form>
      </div>

      {/* Case Details Summary */}
      {caseDetails && (
        <div className="space-y-5">
          {/* Top Banner Card */}
          <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/15 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">CNR Number: {caseDetails.cnr}</span>
                <h2 className="text-xl font-serif font-bold text-[#C9A24B]">{caseDetails.caseNumber}</h2>
                <p className="text-xs text-slate-200 mt-0.5">{caseDetails.title}</p>
              </div>

              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-lg">
                {caseDetails.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Courtroom Bench</span>
                <p className="font-semibold text-white mt-1">{caseDetails.court}</p>
                <p className="text-[10px] text-slate-400">{caseDetails.judge}</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Next Hearing Date</span>
                <p className="font-bold text-amber-400 font-mono mt-1 text-sm">{caseDetails.nextHearing}</p>
                <p className="text-[10px] text-slate-400">Scheduled Cause List</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Stage of Case</span>
                <p className="font-semibold text-emerald-400 mt-1">{caseDetails.stage}</p>
              </div>

              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-slate-400 text-[10px] font-bold uppercase">Filing Date</span>
                <p className="font-semibold text-white mt-1">{caseDetails.filingDate}</p>
              </div>
            </div>

            {/* Plain Language Summary */}
            <div className="p-4 bg-[#0F1B33] border border-white/15 rounded-xl space-y-1 text-xs">
              <strong className="text-[#C9A24B] font-serif">💡 Plain Language Citizen Summary:</strong>
              <p className="text-slate-200 leading-relaxed">{caseDetails.plainSummary}</p>
            </div>
          </div>

          {/* Case Business History Timeline */}
          <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9A24B]" />
              Case Hearing Business & Proceedings History
            </h3>

            <div className="space-y-3">
              {caseDetails.history.map((h: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[#C9A24B] font-bold">{h.date}</span>
                    <p className="text-white font-semibold">{h.business}</p>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                    h.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {h.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckCaseStatusPage;
