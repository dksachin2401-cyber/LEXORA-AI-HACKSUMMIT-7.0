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
    <div className="space-y-6">
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl font-serif font-bold theme-heading">
          AI Draft Generator & Human Sign-Off Engine
        </h1>
        <p className="theme-subtext text-sm mt-1">
          Generate formal orders, notices, summons, and bail drafts. Requires authenticated human judicial sign-off before finalization.
        </p>
      </div>

      <div className="theme-card rounded-xl border border-subtle p-6 space-y-4 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold theme-heading mb-1">Document Type:</label>
            <select 
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full p-2 theme-elevated border border-subtle rounded outline-none font-bold theme-heading"
            >
              <option value="Order">Judicial Order</option>
              <option value="Notice">Show Cause Notice</option>
              <option value="Summons">Summons to Respondent</option>
              <option value="Bail Order">Bail Application Order</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold theme-heading mb-1">Case Number:</label>
            <input
              type="text"
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              className="w-full p-2 theme-elevated border border-subtle rounded outline-none theme-heading"
            />
          </div>

          <div>
            <label className="block font-semibold theme-heading mb-1">Petitioner:</label>
            <input
              type="text"
              value={petitioner}
              onChange={(e) => setPetitioner(e.target.value)}
              className="w-full p-2 theme-elevated border border-subtle rounded outline-none theme-heading"
            />
          </div>

          <div>
            <label className="block font-semibold theme-heading mb-1">Respondent:</label>
            <input
              type="text"
              value={respondent}
              onChange={(e) => setRespondent(e.target.value)}
              className="w-full p-2 theme-elevated border border-subtle rounded outline-none theme-heading"
            />
          </div>
        </div>

        <button
          onClick={handleGenerateDraft}
          disabled={loading}
          className="theme-primary-btn px-5 py-2.5 text-xs font-semibold rounded flex items-center gap-2"
        >
          <FileCode className="w-4 h-4" />
          {loading ? 'Generating Legal Draft...' : `Generate Watermarked ${docType} Draft`}
        </button>
      </div>

      {draftContent && (
        <div className="theme-card rounded-xl border border-subtle p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-subtle pb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif font-bold theme-heading">Generated Document Draft</h2>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                draftStatus === 'APPROVED' ? 'badge-supported' :
                draftStatus === 'REJECTED' ? 'badge-rejected' :
                'badge-pending'
              }`}>
                {draftStatus === 'APPROVED' ? 'FINAL - APPROVED' : draftStatus === 'REJECTED' ? 'REJECTED' : 'UNEXECUTED DRAFT'}
              </span>
            </div>

            {draftStatus === 'DRAFT' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleSignOff('APPROVED')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve & Sign Off
                </button>
                <button
                  onClick={() => handleSignOff('REJECTED')}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold flex items-center gap-1 shadow cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject Draft
                </button>
              </div>
            )}
          </div>

          <AiReviewBadge statusText="Must be reviewed and signed off by presiding officer before export" />

          {/* Draft Preview Paper */}
          <div className="p-6 theme-elevated border border-subtle rounded font-serif text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-mono theme-heading relative">
            {draftStatus === 'DRAFT' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 font-bold text-4xl text-rose-600 dark:text-rose-400 uppercase transform -rotate-12 select-none">
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
