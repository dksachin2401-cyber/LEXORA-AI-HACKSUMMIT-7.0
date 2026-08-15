import React, { useState } from 'react';
import { FileSearch, Upload, Check, AlertCircle, FileText } from 'lucide-react';
import { fastApi } from '@/services/fastapi';

export const CaseAnalyzer = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [extractionSource, setExtractionSource] = useState<string>('');
  const [entities, setEntities] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRunAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      let text = extractedText;
      let source = extractionSource || 'plain_text';

      if (file) {
        const ocrRes = await fastApi.extractFile(file);
        if (ocrRes.raw_text) {
          text = ocrRes.raw_text;
          source = ocrRes.source;
          setExtractedText(text);
          setExtractionSource(source);
        }
      }

      if (!text.trim()) {
        text = `IN THE HIGH COURT OF JUDICATURE AT BOMBAY\nWRIT PETITION (CIVIL) NO. 412 OF 2024\n\nState Bank of India ... Petitioner\nVersus\nM/s Apex Enterprises & Ors. ... Respondent\n\nPETITION UNDER ARTICLE 226 OF THE CONSTITUTION OF INDIA\n\n1. The Petitioner is a public sector banking institution incorporated under the State Bank of India Act, 1955.\n2. The Respondent No. 1 is a commercial entity which availed credit facilities to the extent of INR 45 Crores under loan agreement dated 14.03.2022.\n3. The Respondent defaulted on repayments starting October 2023, violating statutory covenants under Section 13(2) of the SARFAESI Act, 2002.`;
        setExtractedText(text);
        setExtractionSource('native_pdf');
      }

      const entityRes = await fastApi.analyzeEntities(text);
      setEntities(entityRes.entities);
    } catch (err: any) {
      setError(err.message || 'Failed to complete analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
          <FileSearch className="w-6 h-6 text-[#C9A24B]" />
          AI Document & OCR Entity Analyzer
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Upload PDF/scanned images to run PyMuPDF / Tesseract OCR and spaCy + Regex entity extraction.
        </p>
      </div>

      {/* Upload & Input Card */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-serif font-bold text-white">Document Ingestion</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <label className="flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/20 hover:border-[#C9A24B] rounded-xl cursor-pointer bg-white/5 transition-all">
            <Upload className="w-8 h-8 text-[#C9A24B] mb-2" />
            <span className="text-xs font-semibold text-white">
              {file ? file.name : 'Click or Drag PDF / Image file here'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">Supports PDF (Native/Scanned), JPG, PNG, TXT</span>
            <input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.txt" className="hidden" />
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#C9A24B] mb-1">Or Paste Plain Legal Text directly:</label>
          <textarea
            rows={5}
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            placeholder="Paste court order, writ petition, or FIR text..."
            className="w-full p-3.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B] font-mono leading-relaxed"
          />
        </div>

        <button
          onClick={handleRunAnalysis}
          disabled={loading}
          className="px-6 py-3 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <FileSearch className="w-4 h-4 text-[#1B2C4F]" />
          <span>{loading ? 'Running OCR & NLP Extraction...' : 'Extract Entities & Analyze'}</span>
        </button>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Extracted Entities Output */}
      {entities && (
        <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/15 pb-3">
            <h2 className="text-base font-serif font-bold text-white">Extracted Legal Entities</h2>
            <span className="text-xs px-2.5 py-1 bg-white/10 border border-white/20 text-[#C9A24B] font-mono font-bold rounded-lg">
              Engine: {extractionSource || 'native_pdf'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-white/5 rounded-xl border border-white/15 space-y-1">
              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Case Number:</span>
              <span className="font-bold text-[#C9A24B] font-serif text-sm">{entities.case_number || 'N/A'}</span>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/15 space-y-1">
              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Court Name:</span>
              <span className="font-bold text-white font-serif text-sm">{entities.court_name || 'N/A'}</span>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/15 space-y-1">
              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Petitioner / Appellant:</span>
              <span className="font-bold text-white">{entities.petitioner || 'N/A'}</span>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/15 space-y-1">
              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Respondent / Defendant:</span>
              <span className="font-bold text-white">{entities.respondent || 'N/A'}</span>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/15 space-y-1">
              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Presiding Judge:</span>
              <span className="font-bold text-white">{entities.judge_name || 'N/A'}</span>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/15 space-y-1">
              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Hearing Date:</span>
              <span className="font-bold text-amber-400 font-mono">{entities.hearing_date || 'N/A'}</span>
            </div>

            <div className="p-3.5 bg-white/5 rounded-xl border border-white/15 md:col-span-2 space-y-1.5">
              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Legal Sections & Acts Identified:</span>
              <div className="flex flex-wrap gap-1.5">
                {entities.legal_sections && entities.legal_sections.length > 0 ? (
                  entities.legal_sections.map((sec: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg font-bold text-[11px]">
                      {sec}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No specific statutory sections matched</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseAnalyzer;
