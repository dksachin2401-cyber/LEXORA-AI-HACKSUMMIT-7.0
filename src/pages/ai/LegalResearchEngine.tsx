import React, { useState } from 'react';
import { BookOpen, Search, Scale } from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { EvidenceCitationViewer } from '@/components/common/EvidenceCitationViewer';

export const LegalResearchEngine: React.FC = () => {
  const [actQuery, setActQuery] = useState('Constitution of India');
  const [sectionQuery, setSectionQuery] = useState('Article 21');
  const [keyword, setKeyword] = useState('Personal Liberty & Natural Justice');
  const [results, setResults] = useState<any[]>([]);
  const [answer, setAnswer] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [isGrounded, setIsGrounded] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);

  const presets = [
    { act: 'Constitution of India', section: 'Article 21', term: 'Personal Liberty & Natural Justice' },
    { act: 'Motor Vehicles Act, 1988', section: 'Section 181', term: 'Driving Without Valid License Penalty' },
    { act: 'Negotiable Instruments Act, 1881', section: 'Section 138', term: 'Cheque Dishonor & Statutory Notice' },
    { act: 'Code of Criminal Procedure, 1973', section: 'Section 438', term: 'Anticipatory Bail & Police Arrest' },
    { act: 'SARFAESI Act, 2002', section: 'Section 13(2)', term: 'Asset Attachment & Security Enforcement' },
  ];

  const executeSearch = async (searchAct: string, searchSection: string, searchTerm: string) => {
    setLoading(true);
    setServiceError(null);
    const query = `${searchAct} ${searchSection} ${searchTerm}`.trim();

    try {
      const res = await fastApi.findSimilarCases(query, 5);
      if (res && res.matches && res.matches.length > 0) {
        setResults(res.matches);
        setIsGrounded(true);
        const topMatch = res.matches[0];
        const actName = topMatch.act || searchAct || topMatch.title || 'Statutory Code';
        const secNum = topMatch.section || searchSection || 'Section Provision';
        const summaryText = res.llm_relevance_explanation
          ? `STATUTORY RESEARCH RESULT\n\nPrimary Provision: ${actName} — ${secNum}\n\nEvidence Summary:\n${res.llm_relevance_explanation}`
          : `STATUTORY RESEARCH RESULT\n\nPrimary Provision: ${actName} — ${secNum}\n\nIndexed Evidence Excerpt:\n"${topMatch.excerpt}"`;
        setAnswer(summaryText);
        setExplanation(`Vector retrieval found ${res.matches.length} authoritative statutory source(s) matching ${actName} ${secNum}.`);
      } else {
        setResults([]);
        setIsGrounded(false);
        setAnswer('');
        setExplanation('');
      }
    } catch (err: any) {
      setResults([]);
      setIsGrounded(false);
      setAnswer('');
      setExplanation('');
      setServiceError(err?.message || 'Failed to communicate with Legal Research Service.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(actQuery, sectionQuery, keyword);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setActQuery(preset.act);
    setSectionQuery(preset.section);
    setKeyword(preset.term);
    executeSearch(preset.act, preset.section, preset.term);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[#D9DEE4] dark:border-[#2B3742] pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          Statutory Legal Research Engine
        </h1>
        <p className="theme-subtext text-xs sm:text-sm mt-1">
          Search statutory provisions, IPC / BNS acts, sections, constitutional articles, and landmark Supreme Court ratios using semantic vector similarity.
        </p>
      </div>

      {/* Quick Search Presets */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">Quick Legal Research Presets:</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(p)}
              className="px-3 py-1.5 theme-secondary-btn rounded-sm text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
              <span>{p.act} ({p.section})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Form Card */}
      <div className="theme-card p-6 shadow-sm space-y-4">
        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold theme-subtext mb-1">Act / Statutory Code:</label>
            <input
              type="text"
              placeholder="e.g. Indian Penal Code / BNS / Constitution"
              value={actQuery}
              onChange={(e) => setActQuery(e.target.value)}
              className="w-full p-2.5 bg-surface border border-subtle rounded-sm text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold theme-subtext mb-1">Section / Article Number:</label>
            <input
              type="text"
              placeholder="e.g. Section 302, Article 21, Sec 181"
              value={sectionQuery}
              onChange={(e) => setSectionQuery(e.target.value)}
              className="w-full p-2.5 bg-surface border border-subtle rounded-sm text-xs outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold theme-subtext mb-1">Keywords / Legal Terms:</label>
            <input
              type="text"
              placeholder="e.g. Natural Justice, Driving License Fine"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full p-2.5 bg-surface border border-subtle rounded-sm text-xs outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 theme-primary-btn text-xs rounded-sm flex items-center gap-2 cursor-pointer font-semibold"
            >
              <Search className="w-4 h-4 text-white" />
              <span>{loading ? 'Searching Vector Database...' : 'Execute Vector Research Query'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Service Error Alert Banner */}
      {serviceError && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-sm p-4 text-xs text-rose-900 dark:text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
            <Scale className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Service Communication Error: {serviceError}</span>
          </div>
        </div>
      )}

      {/* Verified Evidence & Citation Results */}
      {!serviceError && (
        <EvidenceCitationViewer
          answer={answer}
          simpleExplanation={explanation}
          grounded={isGrounded}
          sources={results}
          mode="STATUTORY_RESEARCH"
          evidenceStatus={isGrounded ? 'SUPPORTED' : 'INSUFFICIENT_EVIDENCE'}
        />
      )}
    </div>
  );
};

export default LegalResearchEngine;
