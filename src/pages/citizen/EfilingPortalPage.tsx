import React, { useState } from 'react';
import { Upload, FilePlus, CheckCircle, ShieldCheck, Download, AlertCircle, Send, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

export const EfilingPortalPage: React.FC = () => {
  const [title, setTitle] = useState('Petition challenging road widening notice without compensation');
  const [petitionerName, setPetitionerName] = useState('Ramesh Patel');
  const [respondentName, setRespondentName] = useState('Municipal Corporation of Greater Mumbai');
  const [suitCategory, setSuitCategory] = useState('Civil Suit / Title Injunction');
  const [summary, setSummary] = useState('Petition challenging road widening notice issued without statutory compensation under Land Acquisition Act.');
  const [submittedFiling, setSubmittedFiling] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitEfiling = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.submitFiling({
        title,
        description: summary,
        petitioner: petitionerName,
        respondent: respondentName,
        filingType: suitCategory,
        court: 'High Court of Judicature at Bombay',
      });

      if (res.success && res.filing) {
        setSubmittedFiling(res.filing);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to transmit e-filing to court registry queue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
          <FilePlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          e-Filing Portal (File Cases Electronically)
        </h1>
        <p className="theme-subtext text-xs sm:text-sm mt-1">
          Submit New Civil &amp; Criminal Petitions, Upload Evidence Documents, and Transmit Directly to Court Staff Registry Queue
        </p>
      </div>

      {/* Form Card */}
      <div className="theme-card border border-subtle rounded-xl p-6 shadow-xl space-y-4 max-w-2xl">
        {!submittedFiling ? (
          <form onSubmit={handleSubmitEfiling} className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Compliant with Supreme Court e-Filing Rules 2024. Direct Submission to High Court / District Court Registry Queue.</span>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold theme-heading mb-1">Petition Title:</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold theme-heading mb-1">Petitioner Name:</label>
                <input
                  type="text"
                  required
                  value={petitionerName}
                  onChange={(e) => setPetitionerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold theme-heading mb-1">Opposing Respondent Name:</label>
                <input
                  type="text"
                  required
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold theme-heading mb-1">Suit Category:</label>
              <select
                value={suitCategory}
                onChange={(e) => setSuitCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-bold cursor-pointer"
              >
                <option value="Civil Suit / Title Injunction">Civil Suit / Title Injunction</option>
                <option value="Writ Petition (Article 226)">Writ Petition (Article 226)</option>
                <option value="Consumer Dispute Appeal">Consumer Dispute Appeal</option>
                <option value="Matrimonial Petition">Matrimonial / Maintenance Petition</option>
                <option value="Cheque Bounce Complaint (Sec 138 NI Act)">Cheque Bounce Complaint (Sec 138 NI Act)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold theme-heading mb-1">Brief Relief &amp; Case Grounds Summary:</label>
              <textarea
                rows={4}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full p-3.5 theme-elevated border border-subtle rounded-xl text-xs theme-heading outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 theme-primary-btn font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{loading ? 'Transmitting to Court Staff Registry Queue...' : 'Submit Electronic Case Filing to Court Registry'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                e-Filing Transmitted to Court Staff Registry Queue!
              </div>
              <p className="text-xs theme-subtext">
                Filing Reference Number (FBN): <span className="font-mono font-bold text-emerald-600 dark:text-emerald-300">{submittedFiling.filingNumber}</span>
              </p>
            </div>

            <div className="p-4 theme-elevated border border-subtle rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-subtle pb-1">
                <span className="theme-subtext">Title:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{submittedFiling.title}</span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-1">
                <span className="theme-subtext">Petitioner:</span>
                <span className="font-bold theme-heading">{submittedFiling.petitioner}</span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-1">
                <span className="theme-subtext">Respondent:</span>
                <span className="theme-subtext">{submittedFiling.respondent}</span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-1">
                <span className="theme-subtext">Suit Category:</span>
                <span className="theme-subtext">{submittedFiling.filingType}</span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-1">
                <span className="theme-subtext">Registry Status:</span>
                <span className="text-amber-600 dark:text-amber-300 font-bold">{submittedFiling.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="theme-subtext">Submitted At:</span>
                <span className="theme-subtext">{new Date(submittedFiling.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  const ack = `ELECTRONIC CASE FILING ACKNOWLEDGEMENT (FBN)
==================================================
Filing Reference Number: ${submittedFiling.filingNumber}
Title: ${submittedFiling.title}
Petitioner: ${submittedFiling.petitioner}
Respondent: ${submittedFiling.respondent}
Category: ${submittedFiling.filingType}
Submitted Date: ${new Date(submittedFiling.createdAt).toLocaleString('en-IN')}
Status: ${submittedFiling.status}
==================================================
Transmitted to Court Staff Registry Desk for Verification & Courtroom Allocation.`;

                  const blob = new Blob([ack], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `eFiling_Acknowledgement_${submittedFiling.filingNumber.replace(/\//g, '_')}.txt`;
                  a.click();
                }}
                className="flex-1 py-3 theme-primary-btn font-bold rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download e-Filing Acknowledgement</span>
              </button>

              <button
                onClick={() => setSubmittedFiling(null)}
                className="px-4 py-3 theme-secondary-btn rounded-xl font-semibold text-xs cursor-pointer"
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
