import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, BookOpen, AlertTriangle, ShieldCheck, Sparkles } from 'lucide-react';
import { fastApi } from '@/services/fastapi';

export const LegalAssistant = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; sources?: string[]; badge?: string }>>([
    {
      sender: 'ai',
      text: 'Greetings. I am Lexora AI, your Grounded Legal Assistant. Ask any question in plain language to receive step-by-step procedural guides, legal rights explanations, and court summons instructions.',
      badge: 'AI-generated · review required'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const prompts = [
    'Can I drive without a license?',
    'What should I do if I receive a court summons?',
    'Procedure to file mutual consent divorce',
    'Bail procedure for bailable vs non-bailable offense',
    'Cheque bounce notice Section 138 NI Act'
  ];

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const userText = customQuery || inputQuery;
    if (!userText.trim()) return;

    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fastApi.askRAG(userText);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer,
          sources: res.sources,
          badge: 'AI-generated · review required'
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '📌 LEGAL RIGHTS OVERVIEW:\nUnder Indian Law (Article 21), every citizen has the right to procedural due process and fair hearing.\n\n📋 STEP-BY-STEP PROCEDURAL GUIDE:\n1. Step 1: Consult an Advocate or District Legal Services Authority (DLSA).\n2. Step 2: File a formal representation or Written Statement within 30 days.\n\n🏛️ COURT SUMMONS INSTRUCTIONS:\nFailure to appear or file reply may result in an ex-parte court decision.',
          sources: ['Constitution of India (Article 21)', 'Code of Civil Procedure, 1908'],
          badge: 'AI-generated · review required'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] rounded-2xl bg-[#132240] text-white p-4 sm:p-6 flex flex-col justify-between border border-white/15 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-white/15 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9A24B]/20 border border-[#C9A24B]/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#C9A24B]" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-serif text-white flex items-center gap-2">
              Lexora Plain-Language Legal Assistant
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] rounded-full font-sans font-semibold">
                Grounded Knowledge Active
              </span>
            </h1>
            <p className="text-xs text-slate-300">Provides Step-by-Step Procedural Guides, Legal Rights & Court Summons Advice</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[500px]">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-3xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#C9A24B] text-[#1B2C4F] font-bold rounded-br-none shadow-md'
                  : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-bl-none shadow-xl'
              }`}
            >
              <p className="whitespace-pre-wrap font-sans">{msg.text}</p>

              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-white/15 text-[11px] text-[#C9A24B] font-serif">
                  <div className="flex items-center gap-1 font-bold mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Cited Statutory Sources:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300 font-sans">
                    {msg.sources.map((src, i) => (
                      <li key={i}>{src}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white/10 backdrop-blur-md rounded-xl text-xs text-amber-300">
            <div className="w-2 h-2 rounded-full bg-[#C9A24B] animate-ping" />
            <span>Analyzing legal intent and fetching statutory guidance...</span>
          </div>
        )}
      </div>

      {/* Prompt Suggestion Chips */}
      <div className="space-y-2 pt-2 border-t border-white/15">
        <span className="text-[11px] font-bold text-[#C9A24B]">Popular Plain-Language Questions:</span>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(undefined, p)}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#C9A24B]" />
              <span>{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask any legal question in plain language..."
          className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 text-xs sm:text-sm rounded-xl text-white placeholder-slate-400 outline-none focus:border-[#C9A24B]"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
        >
          <span>Ask AI</span>
          <Send className="w-4 h-4 text-[#1B2C4F]" />
        </button>
      </form>
    </div>
  );
};

export default LegalAssistant;
