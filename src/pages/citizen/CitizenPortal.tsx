import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Search,
  Volume2,
  Mic,
  MicOff,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Sparkles,
  BookOpen,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '@/services/api';
import { fastApi } from '@/services/fastapi';
import { EvidenceCitationViewer } from '@/components/common/EvidenceCitationViewer';

export const CitizenPortal: React.FC = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [question, setQuestion] = useState<string>('');
  const [loadingAnswer, setLoadingAnswer] = useState<boolean>(false);
  const [qaResponse, setQaResponse] = useState<any>(null);

  // Speech Recognition & Speech Synthesis State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [ttsActive, setTtsActive] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-IN');

  useEffect(() => {
    async function loadCitizenCases() {
      try {
        const fetchedCases = await api.getCases().catch(() => []);
        if (fetchedCases && fetchedCases.length > 0) {
          setCases(fetchedCases);
          setSelectedCase(fetchedCases[0]);
        } else {
          // Default citizen authorized case view
          const defaultCitizenCase = {
            id: 'cit-c1',
            caseNumber: 'WP(C) 412/2024',
            title: 'State Bank of India vs. M/s Apex Enterprises & Ors.',
            court: 'High Court of Judicature at Bombay',
            status: 'Active',
            nextHearing: '2026-08-14',
            filingDate: '2024-02-10',
            description: 'Writ Petition regarding credit facility default under Article 226 of the Constitution.',
            authorizedDocuments: [
              { name: 'Public_Notice_Copy.pdf', date: '2024-02-10', size: '1.2 MB' },
              { name: 'Hearing_Schedule_Notice.pdf', date: '2024-03-01', size: '450 KB' }
            ]
          };
          setCases([defaultCitizenCase]);
          setSelectedCase(defaultCitizenCase);
        }
      } catch {
        // Handled
      }
    }

    loadCitizenCases();

    // Check Web Speech API Support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const handleAskLegalQuestion = async (customQuery?: string) => {
    const q = customQuery || question || 'What is the status of my case and what happens at the next hearing?';
    setLoadingAnswer(true);
    setQaResponse(null);

    try {
      let res: any;
      if (selectedCase?.id) {
        // CASE-SCOPED: pass the actual case ID for isolated retrieval
        res = await fastApi.askRAG(q, selectedCase.id);
      } else {
        // GLOBAL: no specific case selected — search global precedent collection
        res = await fastApi.findSimilarCases(q, 4);
        // Normalise similar-cases response to match /ask response shape
        const topExcerpts = (res.matches || []).slice(0, 3).map((m: any) => m.excerpt || '').filter(Boolean);
        res = {
          success: true,
          answer: topExcerpts.length > 0 ? topExcerpts.join('\n\n') : 'No relevant legal information found.',
          simple_explanation: '',
          grounded: topExcerpts.length > 0,
          sources: (res.matches || []).slice(0, 3),
        };
      }
      setQaResponse(res);
    } catch {
      setQaResponse({
        success: false,
        answer: "Failed to connect to RAG AI service.",
        simple_explanation: "Service temporarily offline. Please try again shortly.",
        grounded: false,
        sources: []
      });
    } finally {
      setLoadingAnswer(false);
    }
  };

  // Web Speech API: Speech to Text (Microphone)
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Web Speech recognition is not supported by your browser. Please type your query in the text box.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setIsListening(false);
        handleAskLegalQuestion(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Text to Speech Output
  const handleTextToSpeech = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported by your browser.");
      return;
    }

    if (ttsActive) {
      window.speechSynthesis.cancel();
      setTtsActive(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = selectedLanguage;
    utterance.onend = () => setTtsActive(false);
    utterance.onerror = () => setTtsActive(false);

    setTtsActive(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-amber-500" />
          Citizen Judicial Portal & Legal Guidance
        </h1>
        <p className="theme-subtext text-xs sm:text-sm mt-1">
          Access your authorized case information, hearing schedules, and plain-language AI legal explanations.
        </p>
      </div>

      {/* Case Overview & Status Cards */}
      {selectedCase && (
        <div className="theme-card rounded p-6 space-y-4">
          <div className="flex flex-wrap justify-between items-start border-b border-subtle pb-4 gap-2">
            <div>
              <span className="text-[10px] font-bold font-mono text-blue-500 theme-elevated px-2.5 py-0.5 rounded border border-subtle uppercase">
                Citizen Authorized Case View
              </span>
              <h2 className="text-lg font-serif font-bold theme-heading mt-1">{selectedCase.title}</h2>
              <p className="text-xs theme-subtext font-mono">
                Case No: <span className="text-blue-500 font-bold">{selectedCase.caseNumber}</span> • {selectedCase.court}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] theme-subtext font-mono block">Status:</span>
                <span className="badge-supported text-xs font-bold px-3 py-1 rounded block">
                  {selectedCase.status}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] theme-subtext font-mono block">Next Hearing:</span>
                <span className="text-xs font-bold text-amber-500 theme-elevated px-3 py-1 rounded border border-subtle block font-mono">
                  {selectedCase.nextHearing || '2026-08-14'}
                </span>
              </div>
            </div>
          </div>

          {/* Authorized Documents Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              Authorized Public Filings & Orders:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(selectedCase.authorizedDocuments || [
                { name: 'Public_Notice_Copy.pdf', date: '2024-02-10', size: '1.2 MB' },
                { name: 'Hearing_Schedule_Notice.pdf', date: '2024-03-01', size: '450 KB' }
              ]).map((doc: any, idx: number) => (
                <div key={idx} className="theme-elevated border border-subtle p-3 rounded flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-bold theme-heading">{doc.name}</p>
                      <p className="text-[10px] theme-subtext font-mono">{doc.date} • {doc.size}</p>
                    </div>
                  </div>
                  <span className="badge-supported text-[10px] font-bold px-2 py-0.5 rounded">Authorized</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Multilingual Voice & Plain Language RAG Assistance */}
      <div className="theme-card rounded p-6 space-y-4">
        <div className="flex flex-wrap justify-between items-center border-b border-subtle pb-3 gap-2">
          <div>
            <h2 className="text-sm font-serif font-bold theme-heading uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Ask Legal Assistant (Voice & Plain Language)
            </h2>
            <p className="text-xs theme-subtext">
              Receive both a Technical Legal Explanation and a Plain-Language Simple Explanation grounded in case records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] theme-subtext font-mono">Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="text-xs rounded px-2.5 py-1"
            >
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">Hindi (हिंदी)</option>
              <option value="mr-IN">Marathi (मराठी)</option>
              <option value="ta-IN">Tamil (தமிழ்)</option>
            </select>
          </div>
        </div>

        {/* Voice Input Controls & Text Area */}
        <div className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your case status, legal procedures, or hearing dates..."
              className="w-full p-4 text-xs rounded leading-relaxed"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                    : 'theme-secondary-btn'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-amber-500" />}
                <span>{isListening ? 'Listening...' : 'Voice Input (Microphone)'}</span>
              </button>

              {!speechSupported && (
                <span className="text-[10px] text-amber-500 italic">*Microphone STT fallback: text input active</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleAskLegalQuestion()}
              disabled={loadingAnswer}
              className="theme-primary-btn px-6 py-2.5 text-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              <span>{loadingAnswer ? 'Processing Answer...' : 'Get Grounded Answer'}</span>
            </button>
          </div>
        </div>

        {/* RAG Answer Display (Dual TECHNICAL & SIMPLE EXPLANATION) */}
        {qaResponse && (
          <div className="space-y-4 pt-2 animate-fadeIn">
            {/* SIMPLE EXPLANATION (Plain Language for Citizen) */}
            {qaResponse.simple_explanation && (
              <div className="theme-elevated border border-subtle rounded p-5 space-y-2">
                <div className="flex items-center justify-between border-b border-subtle pb-2">
                  <h3 className="text-xs font-serif font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Plain Language Explanation (Easy to Understand)
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleTextToSpeech(qaResponse.simple_explanation)}
                    className="theme-secondary-btn px-3 py-1 text-[10px] flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{ttsActive ? 'Stop Audio' : 'Listen Read Aloud'}</span>
                  </button>
                </div>
                <p className="text-xs theme-heading leading-relaxed font-sans whitespace-pre-line">
                  {qaResponse.simple_explanation}
                </p>
              </div>
            )}

            {/* TECHNICAL EXPLANATION (Grounded RAG Response) */}
            <div className="theme-elevated border border-subtle rounded p-5 space-y-2">
              <h3 className="text-xs font-serif font-bold text-amber-500 flex items-center gap-2 uppercase tracking-wider border-b border-subtle pb-2">
                <BookOpen className="w-4 h-4 text-amber-500" />
                Technical Legal Explanation (Grounded in Document Evidence)
              </h3>
              <p className="text-xs theme-heading leading-relaxed font-mono whitespace-pre-line">
                {qaResponse.answer}
              </p>
            </div>

            {/* Citations & Verified Evidence */}
            <EvidenceCitationViewer grounded={qaResponse.grounded} sources={qaResponse.sources || []} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenPortal;
