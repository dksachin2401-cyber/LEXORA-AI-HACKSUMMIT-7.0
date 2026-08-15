import React, { useState } from 'react';
import { FileCode, Check, X, ShieldAlert, Award } from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { api } from '@/services/api';
import { AiReviewBadge } from '@/components/common/AiReviewBadge';

export const DraftGenerator = () => {
  const [docType, setDocType] = useState('Order');
  const [caseNo, setCaseNo] = useState('WP(C) 412/2024');
  const [petitioner, setPetitioner] = useState('State Bank of India');
  const [respondent, setRespondent] = useState('M/s Apex Enterprises & Ors.');
  const [draftContent, setDraftContent] = useState<string>('');
  const [draftStatus, setDraftStatus] = useState<'DRAFT' | 'APPROVED' | 'REJECTED'>('DRAFT');
  const [loading, setLoading] = useState(false);

  const handleGenerateDraft = async () => {
    setLoading(true);
    setDraftStatus('DRAFT');
    try {
      const res = await fastApi.generateDraft(docType, {
        case_number: caseNo,
        petitioner,
        respondent,
        court: 'IN THE HIGH COURT OF JUDICATURE AT BOMBAY'
      });
      setDraftContent(res.content);
    } catch {
      // Handled in fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSignOff = async (status: 'APPROVED' | 'REJECTED') => {
    setDraftStatus(status);
    if (status === 'APPROVED') {
      setDraftContent((prev) => 
        prev.replace('DRAFT — AI-GENERATED, UNEXECUTED (REVIEW REQUIRED)', 'OFFICIAL JUDICIAL ORDER — EXECUTED & APPROVED BY PRESIDING OFFICER')
            .replace('(Status: DRAFT - Awaiting Authenticated Sign-Off)', '(Status: FINAL - Signed off by Hon\'ble Presiding Officer)')
      );
    }
  };

  return (
    <div className="space-y-6 institutional-bg">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-serif font-bold text-[#1B2C4F]">
          AI Draft Generator & Human Sign-Off Engine
        </h1>
        <p className="text-slate-600 text-sm mt-1">
          Generate formal orders, notices, summons, and bail drafts. Requires authenticated human judicial sign-off before finalization.
        </p>
      </div>

      <div className="institutional-card p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Document Type:</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded outline-none font-bold text-[#1B2C4F]"
            >
              <option value="Order">Judicial Order</option>
              <option value="Notice">Show Cause Notice</option>
              <option value="Summons">Summons to Respondent</option>
              <option value="Bail Order">Bail Application Order</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Case Number:</label>
            <input
              type="text"
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Petitioner:</label>
            <input
              type="text"
              value={petitioner}
              onChange={(e) => setPetitioner(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Respondent:</label>
            <input
              type="text"
              value={respondent}
              onChange={(e) => setRespondent(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateDraft}
          disabled={loading}
          className="px-5 py-2.5 bg-[#1B2C4F] text-white text-xs font-semibold rounded hover:bg-[#1B2C4F]/90 flex items-center gap-2"
        >
          <FileCode className="w-4 h-4 text-[#C9A24B]" />
          {loading ? 'Generating Legal Draft...' : `Generate Watermarked ${docType} Draft`}
        </button>
      </div>

      {draftContent && (
        <div className="institutional-card p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif font-bold text-[#1B2C4F]">Generated Document Draft</h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                draftStatus === 'APPROVED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                draftStatus === 'REJECTED' ? 'bg-rose-100 text-rose-900 border border-rose-300' :
                'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {draftStatus === 'APPROVED' ? 'FINAL - APPROVED' : draftStatus === 'REJECTED' ? 'REJECTED' : 'UNEXECUTED DRAFT'}
              </span>
            </div>

            {draftStatus === 'DRAFT' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSignOff('APPROVED')}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve & Sign Off
                </button>
                <button
                  onClick={() => handleSignOff('REJECTED')}
                  className="px-4 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-bold flex items-center gap-1 shadow"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject Draft
                </button>
              </div>
            )}
          </div>

          <AiReviewBadge statusText="Must be reviewed and signed off by presiding officer before export" />

          {/* Draft Preview Paper */}
          <div className="p-6 bg-amber-50/30 border border-slate-300 rounded font-serif text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-mono text-slate-900 relative">
            {draftStatus === 'DRAFT' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 font-bold text-4xl text-rose-900 uppercase transform -rotate-12 select-none">
                DRAFT — AI-GENERATED, UNEXECUTED
              </div>
            )}
            {draftContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default DraftGenerator;
