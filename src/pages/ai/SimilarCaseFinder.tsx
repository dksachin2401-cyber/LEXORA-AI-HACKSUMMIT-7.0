import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Scale, BookOpen, ShieldCheck, HelpCircle, FileText, AlertCircle } from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { EvidenceCitationViewer } from '@/components/common/EvidenceCitationViewer';

export const SimilarCaseFinder: React.FC = () => {
  const [queryText, setQueryText] = useState('Procedure established by law under Article 21 for recovery of credit facilities');
  const [matches, setMatches] = useState<any[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [isGrounded, setIsGrounded] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

  const sampleQueries = [
    { text: 'Driving without a valid license fine under Section 181 Motor Vehicles Act' },
    { text: 'Cheque bounce dishonor 15-day statutory notice under Section 138 NI Act' },
    { text: 'Anticipatory bail guidelines against police arrest under Section 438 CrPC' },
    { text: 'NPA bank 60-day demand notice under Section 13(2) SARFAESI Act' },
    { text: 'Personal liberty and principles of natural justice under Article 21' },
  ];

  const handleSearchPrecedents = async (customText?: string) => {
    setLoading(true);
    const searchString = customText || queryText || 'Natural justice procedural due process under Article 21';

    try {
      const res = await fastApi.findSimilarCases(searchString, 5);
      if (res && res.matches && res.matches.length > 0) {
        setMatches(res.matches);
        setExplanation(res.llm_relevance_explanation || '');
        setIsGrounded(true);
      } else {
        setMatches([]);
        setExplanation('');
        setIsGrounded(false);
      }
    } catch {
      setMatches([]);
      setExplanation('');
      setIsGrounded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearchPrecedents(queryText);
  }, []);

  const runSample = (item: typeof sampleQueries[0]) => {
    setQueryText(item.text);
    handleSearchPrecedents(item.text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Precedent Vector Search & Similar Case Finder
        </h1>
        <p className="theme-subtext text-xs sm:text-sm mt-1">
          Dense semantic vector search across indexed case documents using ChromaDB embeddings.
        </p>
      </div>

      {/* Quick Click Sample Chips */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono theme-subtext uppercase">Benchmark Vector Queries:</span>
        <div className="flex flex-wrap gap-1.5">
          {sampleQueries.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => runSample(item)}
              className="px-2.5 py-1 theme-secondary-btn rounded text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{item.text.slice(0, 45)}...</span>
            </button>
          ))}
        </div>
      </div>

      {/* Query Card */}
      <div className="theme-card border border-subtle rounded p-4 space-y-3">
        <label className="block text-xs font-mono font-semibold theme-heading uppercase">
          Search Query / Legal Fact Synopsis:
        </label>
        <textarea
          rows={3}
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Describe factual situation or statutory issue..."
          className="w-full p-3 theme-elevated border border-subtle rounded text-xs theme-heading placeholder:theme-subtext outline-none focus:ring-2 focus:ring-blue-500/20 leading-relaxed font-mono"
        />
        <button
          type="button"
          onClick={() => handleSearchPrecedents()}
          disabled={loading}
          className="theme-primary-btn px-4 py-2 font-semibold text-xs rounded flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" />
          <span>{loading ? 'Searching Vector Store...' : 'Execute Vector Search'}</span>
        </button>
      </div>

      {/* Results Section */}
      {isGrounded && matches.length > 0 ? (
        <div className="space-y-4">
          {explanation && (
            <div className="theme-card border border-subtle rounded p-3.5 space-y-1">
              <span className="text-[10px] font-mono font-semibold uppercase theme-subtext flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Vector Match Rationale
              </span>
              <p className="text-xs theme-heading leading-relaxed">{explanation}</p>
            </div>
          )}

          {/* Precedent Candidate Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-serif font-bold theme-heading uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Top-K Matched Precedents ({matches.length})
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {matches.map((m, idx) => {
                const relScore = typeof m.relevance_score === 'number'
                  ? (m.relevance_score <= 1 ? (m.relevance_score * 100).toFixed(1) + '%' : `${m.relevance_score}%`)
                  : 'N/A';

                return (
                  <div key={m.chunk_id || idx} className="theme-card border border-subtle hover:border-blue-500/60 rounded-xl p-5 space-y-3 shadow-xl transition-all">
                    <div className="flex flex-wrap justify-between items-start border-b border-subtle pb-3 gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-serif font-bold text-blue-600 dark:text-blue-400">{m.case_name || m.title || 'Precedent Case'}</h4>
                          <span className="text-[10px] font-bold badge-pending px-2 py-0.5 rounded">
                            {m.authority_level || 'Binding Precedent'}
                          </span>
                        </div>
                        <p className="text-xs theme-subtext font-mono mt-0.5">
                          {m.court || 'Supreme Court of India'} • Citation: {m.case_number || 'N/A'} • {m.year || 2024}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold badge-supported px-3 py-1 rounded-lg block">
                          Relevance: {relScore}
                        </span>
                        <span className="text-[10px] theme-subtext font-mono mt-0.5 block">Page {m.page_number || 1}</span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase theme-subtext">Indexed Document Excerpt:</span>
                      <p className="text-xs theme-subtext italic leading-relaxed theme-elevated p-3 rounded-lg border border-subtle font-serif">
                        "{m.excerpt}"
                      </p>
                    </div>

                    {/* Why It Is Relevant */}
                    {m.why_it_is_relevant && (
                      <div className="theme-elevated p-2.5 rounded-lg border border-subtle flex items-start gap-2 text-xs">
                        <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-blue-600 dark:text-blue-400">Why It Is Relevant: </span>
                          <span className="theme-subtext">{m.why_it_is_relevant}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <EvidenceCitationViewer grounded={isGrounded} sources={matches} />
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 text-xs text-amber-800 dark:text-amber-200 space-y-2">
          <p className="font-bold text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            No Relevant Precedents Found
          </p>
          <p className="text-xs theme-subtext leading-relaxed">
            The vector search engine found no indexed cases matching your query criteria with high confidence. No fake precedents have been generated.
          </p>
        </div>
      )}
    </div>
  );
};

export default SimilarCaseFinder;

