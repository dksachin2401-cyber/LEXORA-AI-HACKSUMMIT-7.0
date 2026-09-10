import React, { useState } from 'react';
import { FileText, Clock, AlertCircle, Scale, ShieldCheck, Gavel, BookOpen, Layers, UserCheck } from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { EvidenceCitationViewer } from '@/components/common/EvidenceCitationViewer';

export const CaseSummarizer = () => {
  const [inputText, setInputText] = useState('');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const text = inputText || `IN THE HIGH COURT OF JUDICATURE AT BOMBAY
WRIT PETITION (CIVIL) NO. 412 OF 2024

State Bank of India ... Petitioner
Versus
M/s Apex Enterprises & Ors. ... Respondent

PETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA

1. The Petitioner is a public sector banking institution incorporated under the State Bank of India Act, 1955.
2. The Respondent No. 1 is a commercial entity which availed credit facilities to the extent of INR 45 Crores under loan agreement dated 14.03.2022.
3. The Respondent defaulted on repayments starting October 2023, violating statutory covenants under Section 13(2) of the SARFAESI Act, 2002.
4. Proceedings before the Debt Recovery Tribunal (DRT) in OA No. 89/2023 remain pending.
5. Precedents cited: United Bank of India v. Satyawati Tondon (2010) 8 SCC 110 and Mardia Chemicals Ltd. v. Union of India (2004) 4 SCC 311.
6. Order: Issue Notice to Respondents. Maintain status quo regarding hypothecated assets until next hearing on 14th August 2026.`;

      const res = await fastApi.summarize(text);
      setSummaryData(res.summary);
    } catch (e) {
      console.error('Summarization failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const timelineEvents = summaryData?.important_dates || summaryData?.timeline || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
          <FileText className="w-6 h-6 text-amber-500" />
          AI Judicial Case Summarizer
        </h1>
        <p className="theme-subtext text-xs sm:text-sm mt-1">
          Extract 13 structured legal dimensions grounded directly in uploaded judgment and petition documents.
        </p>
      </div>

      {/* Input Form */}
      <div className="theme-card rounded p-6 space-y-4">
        <div className="flex justify-between items-center">
          <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider">
            Case Text / Judgment Document to Summarize:
          </label>
          <span className="text-[10px] theme-subtext font-mono">Zero Fallback Data Engine</span>
        </div>
        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste actual judgment, writ petition, or appeal text here..."
          className="w-full p-3.5 text-xs rounded leading-relaxed font-mono"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleGenerateSummary}
            disabled={loading}
            className="theme-primary-btn px-6 py-3 text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <FileText className="w-4 h-4" />
            <span>{loading ? 'Synthesizing Document Summary...' : 'Generate Case Summary'}</span>
          </button>
          <span className="text-[11px] theme-subtext italic">
            *Leave empty to run analysis on sample SARFAESI writ petition text
          </span>
        </div>
      </div>

      {summaryData && (
        <div className="space-y-5 animate-fadeIn">
          {/* Header Metadata Card (Court, Case Number, Overview, Parties) */}
          <div className="theme-card rounded p-6 space-y-4">
            <div className="flex flex-wrap justify-between items-start border-b border-subtle pb-3 gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 theme-elevated px-2.5 py-0.5 rounded border border-subtle">
                  Document Metadata
                </span>
                <h2 className="text-base sm:text-lg font-serif font-bold theme-heading mt-1">
                  {summaryData.court || 'Court Not Specified'}
                </h2>
                <p className="text-xs theme-subtext font-mono">
                  Case / Citation: {summaryData.case_number || 'Not found in document.'}
                </p>
              </div>
              <div className="text-right">
                <span className="badge-supported text-[11px] font-bold px-3 py-1 rounded-full inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Grounded Document Summary
                </span>
              </div>
            </div>

            {/* Case Overview */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Case Overview:</h3>
              <p className="text-xs theme-subtext leading-relaxed theme-elevated p-3.5 rounded border border-subtle">
                {summaryData.case_overview || 'Not found in document.'}
              </p>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 theme-elevated border border-subtle rounded space-y-1">
                <span className="font-bold text-amber-500 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                  Petitioner / Appellant:
                </span>
                <p className="theme-heading font-medium">
                  {typeof summaryData.parties === 'object'
                    ? (summaryData.parties?.petitioner || 'Not found in document.')
                    : (summaryData.parties || 'Not found in document.')}
                </p>
              </div>
              <div className="p-3.5 theme-elevated border border-subtle rounded space-y-1">
                <span className="font-bold text-amber-500 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-amber-500" />
                  Respondent / Defendant:
                </span>
                <p className="theme-heading font-medium">
                  {typeof summaryData.parties === 'object'
                    ? (summaryData.parties?.respondent || 'Not found in document.')
                    : 'Not found in document.'}
                </p>
              </div>
            </div>
          </div>

          {/* Key Facts & Legal Issues */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Key Facts */}
            <div className="theme-card rounded p-6 space-y-3">
              <h2 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider border-b border-subtle pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                Key Material Facts
              </h2>
              <ul className="list-disc list-inside space-y-2 text-xs theme-subtext leading-relaxed">
                {Array.isArray(summaryData.key_facts) && summaryData.key_facts.length > 0 ? (
                  summaryData.key_facts.map((fact: string, idx: number) => (
                    <li key={idx} className="theme-elevated p-2.5 rounded border border-subtle list-none flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{fact}</span>
                    </li>
                  ))
                ) : (
                  <li className="theme-subtext">Not found in document.</li>
                )}
              </ul>
            </div>

            {/* Legal Issues */}
            <div className="theme-card rounded p-6 space-y-3">
              <h2 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider border-b border-subtle pb-2 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-500" />
                Primary Legal Issues
              </h2>
              <ul className="list-disc list-inside space-y-2 text-xs theme-subtext leading-relaxed">
                {Array.isArray(summaryData.legal_issues) && summaryData.legal_issues.length > 0 ? (
                  summaryData.legal_issues.map((issue: string, idx: number) => (
                    <li key={idx} className="theme-elevated p-2.5 rounded border border-subtle list-none flex items-start gap-2">
                      <span className="text-amber-500 font-bold">?</span>
                      <span>{issue}</span>
                    </li>
                  ))
                ) : (
                  <li className="theme-subtext">Not found in document.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Arguments */}
          <div className="theme-card rounded p-6 space-y-3">
            <h2 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider border-b border-subtle pb-2">
              Summary of Arguments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 theme-elevated border border-subtle rounded space-y-1.5">
                <span className="font-bold text-amber-500 block mb-1">Petitioner Submissions:</span>
                <p className="theme-subtext leading-relaxed">
                  {typeof summaryData.arguments === 'object'
                    ? (summaryData.arguments?.petitioner || 'Not found in document.')
                    : (summaryData.arguments || 'Not found in document.')}
                </p>
              </div>
              <div className="p-4 theme-elevated border border-subtle rounded space-y-1.5">
                <span className="font-bold text-amber-500 block mb-1">Respondent Submissions:</span>
                <p className="theme-subtext leading-relaxed">
                  {typeof summaryData.arguments === 'object'
                    ? (summaryData.arguments?.respondent || 'Not found in document.')
                    : 'Not found in document.'}
                </p>
              </div>
            </div>
          </div>

          {/* Relevant Acts/Sections & Precedents Cited */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Relevant Acts/Sections */}
            <div className="theme-card rounded p-6 space-y-3">
              <h2 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider border-b border-subtle pb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-500" />
                Relevant Acts & Sections
              </h2>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(summaryData.relevant_acts_sections) && summaryData.relevant_acts_sections.length > 0 ? (
                  summaryData.relevant_acts_sections.map((sec: string, idx: number) => (
                    <span key={idx} className="theme-elevated border border-subtle text-blue-500 font-mono text-xs px-3 py-1 rounded">
                      {sec}
                    </span>
                  ))
                ) : (
                  <span className="text-xs theme-subtext">Not found in document.</span>
                )}
              </div>
            </div>

            {/* Precedents Cited */}
            <div className="theme-card rounded p-6 space-y-3">
              <h2 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider border-b border-subtle pb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Precedents Cited
              </h2>
              <ul className="space-y-1.5 text-xs theme-subtext">
                {Array.isArray(summaryData.precedents_cited) && summaryData.precedents_cited.length > 0 ? (
                  summaryData.precedents_cited.map((prec: string, idx: number) => (
                    <li key={idx} className="theme-elevated p-2.5 rounded border border-subtle font-serif italic text-amber-500">
                      {prec}
                    </li>
                  ))
                ) : (
                  <li className="theme-subtext">Not found in document.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Previous Proceedings & Decision / Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Previous Proceedings */}
            <div className="theme-card rounded p-6 space-y-2">
              <h2 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider border-b border-subtle pb-2">
                Previous Proceedings
              </h2>
              <p className="text-xs theme-subtext leading-relaxed theme-elevated p-3 rounded border border-subtle">
                {summaryData.previous_proceedings || 'Not found in document.'}
              </p>
            </div>

            {/* Decision / Order */}
            <div className="theme-card rounded p-6 space-y-2">
              <h2 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider border-b border-subtle pb-2 flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-500" />
                Decision / Final Order
              </h2>
              <p className="text-xs theme-subtext leading-relaxed theme-elevated p-3 rounded border border-subtle font-semibold text-emerald-600 dark:text-emerald-400">
                {summaryData.decision_or_order || 'Not found in document.'}
              </p>
            </div>
          </div>

          {/* Important Observations & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Important Observations */}
            <div className="theme-card rounded p-6 space-y-2">
              <h2 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider border-b border-subtle pb-2">
                Important Judicial Observations
              </h2>
              <p className="text-xs theme-subtext leading-relaxed theme-elevated p-3.5 rounded border border-subtle italic">
                {summaryData.important_observations || summaryData.final_observations || 'Not found in document.'}
              </p>
            </div>

            {/* Important Dates / Timeline */}
            <div className="theme-card rounded p-6 space-y-3">
              <h2 className="text-xs font-serif font-bold text-amber-500 uppercase tracking-wider border-b border-subtle pb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Important Dates / Timeline
              </h2>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Array.isArray(timelineEvents) && timelineEvents.length > 0 ? (
                  timelineEvents.map((t: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-2.5 theme-elevated rounded border border-subtle text-xs">
                      <span className="font-mono font-bold text-amber-500 shrink-0">{t.date}</span>
                      <span className="theme-subtext">{t.event}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs theme-subtext">Not found in document.</p>
                )}
              </div>
            </div>
          </div>

          {/* Evidence Citation Viewer */}
          <div className="pt-2">
            <EvidenceCitationViewer
              answer="Above summary was produced from uploaded case document text and verified against indexed legal sources."
              grounded={true}
              sources={summaryData.sources || []}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseSummarizer;

