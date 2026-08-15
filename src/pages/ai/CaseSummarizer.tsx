import React, { useState } from 'react';
import { FileText, Clock, AlertCircle } from 'lucide-react';
import { fastApi } from '@/services/fastapi';

export const CaseSummarizer = () => {
  const [inputText, setInputText] = useState('');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const text = inputText || 'IN THE HIGH COURT OF JUDICATURE AT BOMBAY\nWRIT PETITION (CIVIL) NO. 412 OF 2024\nState Bank of India vs. M/s Apex Enterprises';
      const res = await fastApi.summarize(text);
      setSummaryData(res.summary);
    } catch {
      // Handled in client fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#C9A24B]" />
          AI Judicial Case Summarizer
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Synthesize long legal briefs into Key Facts, Legal Issues, Arguments, Observations, and Timeline.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
        <label className="block text-xs font-bold text-[#C9A24B]">Case Text / Brief to Summarize:</label>
        <textarea
          rows={5}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste judgment, writ petition, or appeal text..."
          className="w-full p-3.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B] leading-relaxed"
        />
        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className="px-6 py-3 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-[#1B2C4F]" />
          <span>{loading ? 'Synthesizing Summary...' : 'Generate Case Summary'}</span>
        </button>
      </div>

      {summaryData && (
        <div className="space-y-4">
          {/* Key Facts */}
          <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-3">
            <h2 className="text-sm font-serif font-bold text-[#C9A24B] uppercase border-b border-white/15 pb-2">
              1. Key Facts
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-200 leading-relaxed">
              {summaryData.key_facts?.map((fact: string, idx: number) => (
                <li key={idx}>{fact}</li>
              ))}
            </ul>
          </div>

          {/* Legal Issues */}
          <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-3">
            <h2 className="text-sm font-serif font-bold text-[#C9A24B] uppercase border-b border-white/15 pb-2">
              2. Primary Legal Issues
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-200 leading-relaxed">
              {summaryData.legal_issues?.map((issue: string, idx: number) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>

          {/* Arguments */}
          <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-3">
            <h2 className="text-sm font-serif font-bold text-[#C9A24B] uppercase border-b border-white/15 pb-2">
              3. Summary of Arguments
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-white/5 border border-white/15 rounded-xl space-y-1">
                <span className="font-bold text-[#C9A24B] block mb-1">Petitioner Arguments:</span>
                <p className="text-slate-200 leading-relaxed">{summaryData.arguments?.petitioner}</p>
              </div>
              <div className="p-3.5 bg-white/5 border border-white/15 rounded-xl space-y-1">
                <span className="font-bold text-[#C9A24B] block mb-1">Respondent Submissions:</span>
                <p className="text-slate-200 leading-relaxed">{summaryData.arguments?.respondent}</p>
              </div>
            </div>
          </div>

          {/* Final Observations */}
          <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-3">
            <h2 className="text-sm font-serif font-bold text-[#C9A24B] uppercase border-b border-white/15 pb-2">
              4. Judicial Findings / Ratio Decidendi
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed">{summaryData.final_observations}</p>
          </div>

          {/* Procedural Timeline */}
          <div className="bg-[#132240] border border-white/15 rounded-xl p-6 shadow-xl space-y-3">
            <h2 className="text-sm font-serif font-bold text-[#C9A24B] uppercase border-b border-white/15 pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C9A24B]" />
              5. Procedural Timeline
            </h2>
            <div className="space-y-2">
              {summaryData.timeline?.map((t: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg border border-white/15 text-xs">
                  <span className="font-mono font-bold text-[#C9A24B] w-24 shrink-0">{t.date}</span>
                  <span className="text-white">{t.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseSummarizer;
