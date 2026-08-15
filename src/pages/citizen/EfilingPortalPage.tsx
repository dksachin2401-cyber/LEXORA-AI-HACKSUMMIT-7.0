import React, { useState } from 'react';
import { Upload, FilePlus, CheckCircle, ShieldCheck, Download, AlertCircle, Send } from 'lucide-react';

export const EfilingPortalPage: React.FC = () => {
  const [petitionerName, setPetitionerName] = useState('Ramesh Patel');
  const [respondentName, setRespondentName] = useState('Municipal Corporation of Greater Mumbai');
  const [suitCategory, setSuitCategory] = useState('Civil Suit / Title Injunction');
  const [summary, setSummary] = useState('Petition challenging road widening notice issued without statutory compensation under Land Acquisition Act.');
  const [submittedFiling, setSubmittedFiling] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitEfiling = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const fbn = 'FBN/2026/' + Math.floor(100000 + Math.random() * 900000);
      const tempCaseNo = 'TEMP/MH/' + Math.floor(1000 + Math.random() * 9000) + '/2026';
      const filingRecord = {
        id: 'efile_' + Date.now(),
        fbn,
        tempCaseNo,
        petitioner: petitionerName,
        respondent: respondentName,
        suitCategory,
        summary,
        date: new Date().toLocaleString(),
        status: 'FILED_PENDING_REGISTRY_REVIEW',
        courtroomAssigned: 'Awaiting Court Staff Allocation',
        judgeAssigned: 'Awaiting Registry Bench Allocation'
      };

      setSubmittedFiling(filingRecord);

      // Save into global e-filing registry queue so Court Staff can assign courtroom & judge!
      const existingQueue = JSON.parse(localStorage.getItem('lexora_efiled_cases') || '[]');
      localStorage.setItem('lexora_efiled_cases', JSON.stringify([filingRecord, ...existingQueue]));

      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
          <FilePlus className="w-6 h-6 text-[#C9A24B]" />
          e-Filing Portal (File Cases Electronically)
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Submit New Civil & Criminal Petitions, Upload Evidence Documents, and Transmit Directly to Court Staff Registry Queue
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-4 max-w-2xl">
        {!submittedFiling ? (
          <form onSubmit={handleSubmitEfiling} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Compliant with Supreme Court e-Filing Rules 2024. Direct Submission to High Court / District Court Registry Queue.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Petitioner Name:</label>
                <input
                  type="text"
                  required
                  value={petitionerName}
                  onChange={(e) => setPetitionerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Opposing Respondent Name:</label>
                <input
                  type="text"
                  required
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Suit Category:</label>
              <select
                value={suitCategory}
                onChange={(e) => setSuitCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0F1B33] border border-white/20 rounded-xl text-white font-bold cursor-pointer"
              >
                <option value="Civil Suit / Title Injunction">Civil Suit / Title Injunction</option>
                <option value="Writ Petition (Article 226)">Writ Petition (Article 226)</option>
                <option value="Consumer Dispute Appeal">Consumer Dispute Appeal</option>
                <option value="Matrimonial Petition">Matrimonial / Maintenance Petition</option>
                <option value="Cheque Bounce Complaint (Sec 138 NI Act)">Cheque Bounce Complaint (Sec 138 NI Act)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Brief Relief & Case Grounds Summary:</label>
              <textarea
                rows={4}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white outline-none leading-relaxed"
              />
            </div>

            <div className="p-4 bg-white/5 border border-dashed border-white/20 rounded-xl text-center space-y-2">
              <Upload className="w-6 h-6 text-[#C9A24B] mx-auto" />
              <p className="text-xs text-slate-300">Upload Supporting Affidavits, Title Deeds, or Legal Notice Copies (PDF)</p>
              <span className="inline-block px-3 py-1 bg-white/10 rounded text-[10px] text-slate-400">PDF Files Up to 25 MB Supported</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#1B2C4F]" />
              <span>{loading ? 'Transmitting to Court Staff Registry Queue...' : 'Submit Electronic Case Filing to Court Registry'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                e-Filing Transmitted to Court Staff Registry Queue!
              </div>
              <p className="text-xs text-slate-200">Filing Reference Number (FBN): <span className="font-mono font-bold text-emerald-300">{submittedFiling.fbn}</span></p>
            </div>

            <div className="p-4 bg-[#0F1B33] border border-white/20 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span>Temporary Registration No:</span>
                <span className="font-bold text-[#C9A24B]">{submittedFiling.tempCaseNo}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span>Petitioner:</span>
                <span className="font-bold text-white">{submittedFiling.petitioner}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span>Respondent:</span>
                <span className="text-slate-300">{submittedFiling.respondent}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span>Suit Category:</span>
                <span className="text-slate-300">{submittedFiling.suitCategory}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-1">
                <span>Registry Desk Status:</span>
                <span className="text-amber-300 font-bold">{submittedFiling.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Courtroom Allocation:</span>
                <span className="text-slate-400">{submittedFiling.courtroomAssigned}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const ack = `ELECTRONIC CASE FILING ACKNOWLEDGEMENT (FBN)
==================================================
Filing Reference Number: ${submittedFiling.fbn}
Temporary Registration: ${submittedFiling.tempCaseNo}
Petitioner: ${submittedFiling.petitioner}
Respondent: ${submittedFiling.respondent}
Category: ${submittedFiling.suitCategory}
Submitted Date: ${submittedFiling.date}
Status: ${submittedFiling.status}
==================================================
Transmitted to Court Staff Registry Desk for Verification & Courtroom Allocation.`;

                  const blob = new Blob([ack], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `eFiling_Acknowledgement_${submittedFiling.fbn.replace(/\//g, '_')}.txt`;
                  a.click();
                }}
                className="flex-1 py-3 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download e-Filing Acknowledgement</span>
              </button>

              <button
                onClick={() => setSubmittedFiling(null)}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold text-xs cursor-pointer"
              >
                File Another Case
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EfilingPortalPage;
