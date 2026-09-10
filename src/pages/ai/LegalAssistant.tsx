import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Scale,
  Send,
  Plus,
  Copy,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sun,
  Moon,
  User,
  ArrowLeft,
  Paperclip,
  X,
  FileText,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { fastApi } from '@/services/fastapi';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { EvidenceCitationViewer, type EvidenceSource } from '@/components/common/EvidenceCitationViewer';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  grounded?: boolean;
  sources?: EvidenceSource[];
  mode?: string;
  evidenceStatus?: string;
  evidenceStrength?: string;
  researchDepth?: string;
  currentness?: string;
  simpleExplanation?: string;
  warnings?: string[];
  falsePremiseDetected?: boolean;
  falsePremiseReason?: string;
  whyThisAnswer?: any;
  disclaimer?: string;
}

export const LegalAssistant: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const caseId = searchParams.get('caseId') || undefined;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentText, setAttachmentText] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleSourceExpand = (index: number) => {
    setExpandedSources((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleFileAttach = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setAttachmentName(file.name);

    try {
      const res = await fastApi.extractFile(file);
      if (res && res.text) {
        setAttachmentText(res.text);
      } else {
        setAttachmentText(`[Attached file: ${file.name}]`);
      }
    } catch {
      setAttachmentText(`[Attached file reference: ${file.name}]`);
    } finally {
      setIsUploading(false);
    }
  };

  const clearAttachment = () => {
    setAttachmentName(null);
    setAttachmentText(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleNewConversation = () => {
    setMessages([]);
    setInputQuery('');
    clearAttachment();
    setExpandedSources({});
  };

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    let queryText = (customQuery || inputQuery).trim();
    if (attachmentText) {
      queryText = `[ATTACHED MATERIAL: ${attachmentName}]\n${attachmentText.substring(0, 1500)}\n\nUSER QUESTION: ${queryText}`.trim();
    }

    if (!queryText || loading) return;

    const userDisplayMessage = (customQuery || inputQuery).trim() || `Analyze attached document: ${attachmentName}`;

    setInputQuery('');
    clearAttachment();

    const updatedMessages: Message[] = [...messages, { sender: 'user', text: userDisplayMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const conversationHistory = updatedMessages.map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await fastApi.chatLegal(
        queryText,
        caseId,
        conversationHistory,
        user?.role?.toUpperCase() || 'CITIZEN',
        'STANDARD'
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.answer || res.text || 'No authoritative response generated.',
          grounded: Boolean(res.grounded),
          sources: res.sources || [],
          mode: res.mode || (caseId ? 'CASE_SCOPED' : 'GENERAL_LEGAL'),
          evidenceStatus: res.evidence_status || (res.grounded ? 'SUPPORTED' : 'INSUFFICIENT_EVIDENCE'),
          evidenceStrength: res.evidence_strength || 'HIGH',
          currentness: res.currentness || 'VERIFIED',
          simpleExplanation: res.simple_explanation,
          warnings: res.warnings || [],
          falsePremiseDetected: Boolean(res.false_premise_detected),
          falsePremiseReason: res.false_premise_reason,
          whyThisAnswer: res.why_this_answer,
          disclaimer: res.disclaimer,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Sorry, I could not process your request right now. Please verify server connectivity and try again.',
          grounded: false,
          sources: [],
          mode: 'GENERAL_LEGAL',
          evidenceStatus: 'SERVICE_UNAVAILABLE',
          currentness: 'CURRENTNESS_UNVERIFIED',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="theme-card p-6 shadow-sm space-y-6 flex flex-col min-h-[calc(100vh-140px)] font-sans">
      {/* ── Page Header Bar ────────────────────────────────────────────── */}
      <div className="border-b border-[#D9DEE4] dark:border-[#2B3742] pb-4 flex flex-wrap justify-between items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold theme-heading tracking-tight">
              Legal Research Assistant
            </h1>
          </div>
          <p className="text-xs theme-subtext mt-1">
            Conversational RAG assistant to search statutory provisions, case precedents, and evidence materials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {caseId ? (
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-sm badge-supported border flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              CASE-SCOPED: {caseId}
            </span>
          ) : (
            <span className="text-[10px] font-mono theme-subtext uppercase tracking-wider theme-elevated px-2.5 py-1 rounded-sm border border-subtle">
              GENERAL LEGAL RESEARCH
            </span>
          )}

          <button
            type="button"
            onClick={handleNewConversation}
            className="px-3 py-1.5 theme-secondary-btn rounded-sm text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
            <span>New Conversation</span>
          </button>
        </div>
      </div>

      {/* ── Conversation Scroll Container ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-1 max-h-[60vh] min-h-[350px]">
        {/* Initial Empty Welcome State */}
        {messages.length === 0 && (
          <div className="min-h-[280px] flex flex-col items-center justify-center text-center py-8 space-y-4 my-auto">
            <div className="w-12 h-12 rounded-full border border-subtle theme-card flex items-center justify-center shadow-md">
              <Scale className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="space-y-1.5 max-w-md">
              <h2 className="text-lg font-serif font-bold theme-heading tracking-tight">LEXORA Legal Research Assistant</h2>
              <p className="text-xs theme-subtext leading-relaxed">
                Ask a legal question in plain natural language. LEXORA searches indexed statutes, binding precedents, and authorized materials to provide evidence-grounded responses.
              </p>
            </div>

            <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 theme-elevated px-3 py-1 rounded-sm border border-subtle">
              Ask a legal question to begin.
            </div>
          </div>
        )}

        {/* Conversation Message List */}
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-2">
            {/* User Message */}
            {msg.sender === 'user' ? (
              <div className="flex flex-col items-end space-y-1">
                <div className="flex items-center gap-1 text-[10px] font-mono theme-subtext uppercase">
                  <User className="w-3 h-3 text-[var(--primary-accent)]" />
                  <span>{user?.name || 'USER'}</span>
                </div>
                <div className="bg-surface border border-subtle text-xs p-4 rounded-sm theme-heading max-w-[90%] sm:max-w-[80%] leading-relaxed font-sans shadow-sm whitespace-pre-line">
                  {msg.text}
                </div>
              </div>
            ) : (
              /* Assistant Response */
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-serif font-bold theme-heading">LEXORA</span>
                    {msg.mode && (
                      <span className="text-[9px] font-mono font-semibold uppercase px-2 py-0.5 rounded-sm border border-subtle theme-elevated theme-subtext">
                        {msg.mode.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(msg.text, idx)}
                    className="text-[10px] font-mono theme-subtext hover:theme-heading flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3 text-[var(--primary-accent)]" />
                    <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="theme-card p-5 space-y-4 shadow-sm border border-subtle rounded-sm">
                  {/* Legal Answer Text */}
                  <div className="text-xs leading-relaxed whitespace-pre-line theme-heading font-sans">
                    {msg.text}
                  </div>

                  {/* Plain Language Overview */}
                  {msg.simpleExplanation && (
                    <div className="pt-3 border-t border-subtle theme-elevated p-3 rounded-sm border border-subtle">
                      <span className="text-[10px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400 block mb-1">
                        Plain-Language Overview:
                      </span>
                      <p className="text-[11px] theme-subtext leading-relaxed">{msg.simpleExplanation}</p>
                    </div>
                  )}

                  {/* Expandable Sources & Evidence Section */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-3 border-t border-subtle space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleSourceExpand(idx)}
                        className="text-xs font-mono font-semibold text-[var(--primary-accent)] flex items-center justify-between w-full hover:underline cursor-pointer py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Sources &amp; Authoritative Evidence ({msg.sources.length})</span>
                        </span>
                        {expandedSources[idx] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {expandedSources[idx] && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                          {msg.sources.map((src, sIdx) => {
                            const title = src.citation || src.act || src.case_name || src.title || 'Legal Document';
                            const courtName = src.court || src.source || 'Statutory Code';
                            const relevance = src.relevance_score !== undefined
                              ? (src.relevance_score <= 1 ? (src.relevance_score * 100).toFixed(1) + '%' : `${src.relevance_score}%`)
                              : 'N/A';
                            return (
                              <div key={sIdx} className="theme-elevated p-3 rounded-sm border border-subtle space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between items-start border-b border-subtle pb-1">
                                  <div>
                                    <p className="font-bold text-[var(--primary-accent)] truncate max-w-[200px]">{title}</p>
                                    <p className="text-[10px] theme-subtext">{courtName}</p>
                                  </div>
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                    Level {src.authority_level || 1} | {relevance}
                                  </span>
                                </div>
                                <p className="text-[11px] theme-heading italic font-serif line-clamp-2">
                                  "{src.excerpt || 'Excerpt indexed in corpus.'}"
                                </p>
                                <div className="text-[9px] theme-subtext flex justify-between">
                                  <span>Status: {src.status || 'IN_FORCE'}</span>
                                  <span>Page {src.page_number || 1} {src.paragraph_number ? `Para ${src.paragraph_number}` : ''}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Human Review Disclaimer Footer */}
                  <div className="pt-2 border-t border-subtle flex flex-wrap justify-between items-center text-[10px] theme-subtext font-mono gap-2">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>HUMAN JUDICIAL REVIEW REQUIRED · AI assists, human decides</span>
                    </div>

                    {msg.evidenceStatus && (
                      <span className={`px-2 py-0.5 rounded-sm font-bold border uppercase text-[9px] ${
                        msg.evidenceStatus === 'SUPPORTED'
                          ? 'badge-supported'
                          : msg.evidenceStatus === 'PARTIALLY_SUPPORTED'
                          ? 'badge-pending'
                          : 'badge-rejected'
                      }`}>
                        {msg.evidenceStatus.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Researching Indicator */}
        {loading && (
          <div className="flex items-center gap-3 p-4 theme-elevated border border-subtle rounded-sm text-xs font-mono text-[var(--primary-accent)]">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--primary-accent)]" />
            <span>RESEARCHING LEGAL AUTHORITIES &amp; VERIFYING EVIDENCE SOURCES...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Bottom Input Bar Area ────────────────────────────────────────── */}
      <div className="pt-2 border-t border-subtle space-y-2">
        {/* File Attachment Pill */}
        {attachmentName && (
          <div className="flex items-center gap-2 text-xs font-mono theme-elevated border border-subtle px-3 py-1.5 rounded-sm w-fit">
            <FileText className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
            <span className="truncate max-w-xs">{attachmentName}</span>
            <button
              type="button"
              onClick={clearAttachment}
              className="p-0.5 hover:text-rose-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="relative flex items-end gap-2 theme-elevated p-2 border border-subtle rounded-md shadow-sm">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileAttach}
            className="hidden"
            accept=".pdf,.txt,.doc,.docx,.jpg,.png"
          />

          {/* Document Attachment Button */}
          <button
            type="button"
            disabled={isUploading || loading}
            onClick={() => fileInputRef.current?.click()}
            title="Attach Document or Brief for AI Analysis"
            className="p-2.5 theme-secondary-btn rounded-sm text-xs flex items-center justify-center cursor-pointer transition-colors"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[var(--primary-accent)]" />
            ) : (
              <Paperclip className="w-4 h-4 text-[var(--primary-accent)]" />
            )}
          </button>

          {/* Multiline Textarea */}
          <textarea
            ref={textareaRef}
            rows={2}
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask LEXORA a legal question... (Enter to send, Shift+Enter for new line)"
            disabled={loading}
            className="flex-1 bg-transparent border-0 p-2 text-xs theme-heading outline-none resize-none min-h-[44px] max-h-32"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={loading || (!inputQuery.trim() && !attachmentText)}
            className="p-2.5 theme-primary-btn text-xs rounded-sm flex items-center justify-center cursor-pointer font-semibold shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Send className="w-4 h-4 text-white" />
            )}
          </button>
        </form>

        <div className="flex justify-between items-center text-[10px] theme-subtext font-mono px-1">
          <span>LEXORA Grounded RAG Intelligence Engine</span>
          <span>Shift + Enter for multiline</span>
        </div>
      </div>
    </div>
  );
};

export default LegalAssistant;
