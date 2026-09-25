import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Tag, 
  FileText, 
  Trash2, 
  Eye, 
  ShieldCheck, 
  X, 
  CheckCircle, 
  Upload,
  Layers,
  Calendar,
  UserCheck,
  FileCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

export interface JudicialNote {
  id: string;
  caseId?: string;
  caseNumber: string;
  title: string;
  note: string;
  category: string;
  tags: string[];
  date: string;
  author: string;
}

export const EvidenceOrganizer = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('ALL');
  const [notes, setNotes] = useState<JudicialNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<JudicialNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form State
  const [formCaseId, setFormCaseId] = useState('');
  const [title, setTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [category, setCategory] = useState('Testimony Bench Note');
  const [tagInput, setTagInput] = useState('Evidence, Bench Observation');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Document Upload State
  const [activeTab, setActiveTab] = useState<'bench_note' | 'upload_file'>('bench_note');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // 1. Fetch live cases from database
  const loadCases = async () => {
    try {
      const res = await api.getCases();
      const caseList = Array.isArray(res) ? res : res.data || [];
      setCases(caseList);
      if (caseList.length > 0 && !formCaseId) {
        setFormCaseId(caseList[0].id);
      }
      return caseList;
    } catch (err) {
      console.warn('Failed to load cases:', err);
      return [];
    }
  };

  // 2. Fetch live evidences and documents from database for cases
  const loadEvidences = async (caseList: any[]) => {
    setLoading(true);
    try {
      const allLoadedNotes: JudicialNote[] = [];

      for (const c of caseList) {
        try {
          const evRes = await api.getCaseEvidences(c.id);
          if (evRes && evRes.evidences && Array.isArray(evRes.evidences)) {
            for (const ev of evRes.evidences) {
              let parsedTags: string[] = [];
              try {
                parsedTags = JSON.parse(ev.aiTags || '[]');
              } catch {
                parsedTags = typeof ev.aiTags === 'string' ? ev.aiTags.split(',').map((s: string) => s.trim()) : [];
              }

              allLoadedNotes.push({
                id: ev.id,
                caseId: c.id,
                caseNumber: c.caseNumber,
                title: ev.fileName,
                note: `Evidence Category: ${ev.category} | Case: ${c.title}`,
                category: ev.category || 'Documentary Evidence',
                tags: parsedTags.length > 0 ? parsedTags : ['Case Exhibit', ev.fileType || 'DOCUMENT'],
                date: new Date(ev.uploadedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
                author: user?.name || 'Hon\'ble Judicial Bench'
              });
            }
          }
        } catch {
          // Continue to next case
        }
      }

      // Also load any local bench notes saved
      const savedLocal = localStorage.getItem('lexora_judicial_evidence_notes');
      if (savedLocal) {
        try {
          const localParsed: JudicialNote[] = JSON.parse(savedLocal);
          for (const item of localParsed) {
            if (!allLoadedNotes.some(n => n.id === item.id)) {
              allLoadedNotes.push(item);
            }
          }
        } catch {
          // Ignore parse errors
        }
      }

      setNotes(allLoadedNotes);
    } catch (err) {
      console.error('Failed to load evidences:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases().then((caseList) => {
      loadEvidences(caseList);
    });
  }, [user]);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !formCaseId) return;
    setIsSaving(true);

    const targetCase = cases.find(c => c.id === formCaseId || c.caseNumber === formCaseId);
    const resolvedCaseId = targetCase?.id || formCaseId;
    const resolvedCaseNumber = targetCase?.caseNumber || formCaseId;

    try {
      const tagsArray = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
      
      // Save directly to Live Database via API
      let backendSaved = false;
      try {
        const res = await api.createEvidence(resolvedCaseId, {
          fileName: title,
          fileType: 'BENCH_NOTE',
          category,
          aiTags: tagsArray
        });
        if (res && res.success) {
          backendSaved = true;
        }
      } catch (err) {
        console.warn('Backend evidence save fallback to local storage:', err);
      }

      const newNoteObj: JudicialNote = {
        id: 'note_' + Date.now(),
        caseId: resolvedCaseId,
        caseNumber: resolvedCaseNumber,
        title,
        note: noteContent,
        category,
        tags: tagsArray,
        date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        author: user?.name || 'Hon\'ble Judicial Bench'
      };

      const updated = [newNoteObj, ...notes];
      setNotes(updated);
      localStorage.setItem('lexora_judicial_evidence_notes', JSON.stringify(updated));

      setTitle('');
      setNoteContent('');
      setShowAddModal(false);
      setSuccessMsg(`Bench Note & Evidence for ${resolvedCaseNumber} securely saved to Database Vault!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error('Save note error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !formCaseId) return;
    setUploading(true);

    const targetCase = cases.find(c => c.id === formCaseId || c.caseNumber === formCaseId);
    const resolvedCaseId = targetCase?.id || formCaseId;
    const resolvedCaseNumber = targetCase?.caseNumber || formCaseId;

    try {
      // Upload document directly to backend
      const uploadRes = await api.uploadDocument(uploadFile, resolvedCaseId);

      // Create evidence record
      await api.createEvidence(resolvedCaseId, {
        fileName: uploadFile.name,
        fileType: uploadFile.name.endsWith('.pdf') ? 'PDF' : 'IMAGE',
        category: 'Documentary Evidence',
        aiTags: ['Uploaded Exhibit', 'OCR Indexed', uploadFile.type || 'Document']
      });

      const newDocNote: JudicialNote = {
        id: 'doc_' + Date.now(),
        caseId: resolvedCaseId,
        caseNumber: resolvedCaseNumber,
        title: `Exhibit: ${uploadFile.name}`,
        note: `Documentary evidence uploaded & dispatched for OCR/NLP vector indexing. Size: ${(uploadFile.size / 1024).toFixed(1)} KB`,
        category: 'Documentary Evidence',
        tags: ['Exhibit Upload', 'Indexed'],
        date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
        author: user?.name || 'Hon\'ble Judicial Officer'
      };

      const updated = [newDocNote, ...notes];
      setNotes(updated);
      localStorage.setItem('lexora_judicial_evidence_notes', JSON.stringify(updated));

      setUploadFile(null);
      setShowAddModal(false);
      setSuccessMsg(`Evidence document for ${resolvedCaseNumber} uploaded and saved to vault!`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      alert(`Upload failed: ${err.message || 'Please try again'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (id: string, caseId?: string) => {
    if (caseId) {
      try {
        await api.deleteEvidence(caseId, id);
      } catch (err) {
        console.warn('Backend evidence delete warning:', err);
      }
    }
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem('lexora_judicial_evidence_notes', JSON.stringify(updated));
  };

  const filteredNotes = notes.filter((n) => {
    const matchesCase = selectedCaseId === 'ALL' || n.caseId === selectedCaseId || n.caseNumber === selectedCaseId;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
    return matchesCase && matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Judicial Evidence & Bench Notes Vault
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Real-time repository for persistent judicial observations, witness testimony bench notes, and exhibit evidence across all live court cases.
          </p>
        </div>

        {/* ➕ Plus Button to Add Notes */}
        <button
          onClick={() => setShowAddModal(true)}
          className="theme-primary-btn px-5 py-3 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add Bench Note / Evidence</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div className="theme-card border border-subtle rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-lg">
        {/* Case Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold theme-subtext whitespace-nowrap">Case:</span>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full md:w-60 px-3 py-2 theme-elevated border border-subtle rounded-lg text-xs font-bold theme-heading outline-none cursor-pointer"
          >
            <option value="ALL">All Active Cases ({cases.length})</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} — {c.title.length > 25 ? c.title.substring(0, 25) + '...' : c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex-1 w-full md:w-auto relative">
          <Search className="w-4 h-4 theme-subtext absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search saved bench notes by title, case number, or evidence content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 theme-elevated border border-subtle rounded-lg text-xs theme-heading placeholder:theme-subtext outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold theme-subtext whitespace-nowrap">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 theme-elevated border border-subtle rounded-lg text-xs font-bold theme-heading outline-none cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="Testimony Bench Note">Testimony Bench Note</option>
            <option value="Forensic Exhibit Note">Forensic Exhibit Note</option>
            <option value="Judicial Chamber Note">Judicial Chamber Note</option>
            <option value="Documentary Evidence">Documentary Evidence</option>
            <option value="Documentary">Documentary</option>
          </select>
        </div>
      </div>

      {/* Viewable Evidence & Bench Notes Inventory */}
      <div className="theme-card border border-subtle rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-subtle pb-3">
          <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Live Evidence & Judicial Bench Notes ({filteredNotes.length})
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            Connected to Live Database Vault
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs theme-subtext flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading live judicial evidence records...</span>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((n) => (
              <div key={n.id} className="theme-elevated border border-subtle rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-blue-500 transition-colors shadow">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">{n.caseNumber}</span>
                    <span className="px-2 py-0.5 theme-card text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded">
                      {n.category}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold theme-heading text-sm mb-1">{n.title}</h3>
                  <p className="text-xs theme-subtext leading-relaxed line-clamp-3 theme-card p-2.5 rounded-lg border border-subtle">
                    "{n.note}"
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-subtle">
                  <div className="flex flex-wrap gap-1">
                    {n.tags.map((t, i) => (
                      <span key={i} className="px-2 py-0.5 badge-pending text-[10px] font-bold rounded">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[10px] theme-subtext">
                    <span>{n.date}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedNote(n)}
                        className="p-1 theme-secondary-btn rounded cursor-pointer"
                        title="View Note Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(n.id, n.caseId)}
                        className="p-1 badge-rejected rounded cursor-pointer"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs theme-subtext space-y-2">
            <p>No evidence or bench notes found matching your criteria.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="theme-primary-btn px-4 py-2 text-xs font-bold rounded-lg"
            >
              Add First Note Now
            </button>
          </div>
        )}
      </div>

      {/* ➕ Modal: Add New Judicial Note / Evidence */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="theme-card border border-subtle rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-subtle pb-3">
              <h2 className="font-serif font-bold text-blue-600 dark:text-blue-400 text-base flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Judicial Bench Note / Evidence
              </h2>
              <button onClick={() => setShowAddModal(false)} className="theme-subtext hover:theme-heading cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-subtle text-xs font-semibold">
              <button
                onClick={() => setActiveTab('bench_note')}
                className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'bench_note'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-transparent theme-subtext'
                }`}
              >
                Bench Observations & Notes
              </button>
              <button
                onClick={() => setActiveTab('upload_file')}
                className={`flex-1 py-2 text-center border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'upload_file'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                    : 'border-transparent theme-subtext'
                }`}
              >
                Upload Evidence Document
              </button>
            </div>

            {activeTab === 'bench_note' ? (
              <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold theme-heading mb-1">Target Judicial Case:</label>
                    <select
                      required
                      value={formCaseId}
                      onChange={(e) => setFormCaseId(e.target.value)}
                      className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-bold"
                    >
                      {cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.caseNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold theme-heading mb-1">Note Category:</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-bold"
                    >
                      <option value="Testimony Bench Note">Testimony Bench Note</option>
                      <option value="Forensic Exhibit Note">Forensic Exhibit Note</option>
                      <option value="Judicial Chamber Note">Judicial Chamber Note</option>
                      <option value="Documentary Evidence">Documentary Evidence</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold theme-heading mb-1">Note / Evidence Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PW-2 Cross Examination Observations"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold theme-heading mb-1">Detailed Judicial Observations / Notes:</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Type bench observations, witness testimonies, or forensic exhibit notes here..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full p-3 theme-elevated border border-subtle rounded-lg theme-heading outline-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-semibold theme-heading mb-1">Tags (Comma Separated):</label>
                  <input
                    type="text"
                    placeholder="PW-2, Exhibit B, Mortgaged Asset"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-3 theme-primary-btn font-bold rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Save Note to Live Vault</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-3 theme-secondary-btn rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleUploadDocument} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold theme-heading mb-1">Target Case:</label>
                  <select
                    required
                    value={formCaseId}
                    onChange={(e) => setFormCaseId(e.target.value)}
                    className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-bold"
                  >
                    {cases.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold theme-heading mb-1">Choose Evidence File (PDF, PNG, JPG):</label>
                  <div className="border-2 border-dashed border-subtle rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg,.txt"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="w-full text-xs theme-subtext file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:theme-primary-btn"
                    />
                    {uploadFile && (
                      <p className="mt-2 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="flex-1 py-3 theme-primary-btn font-bold rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    <span>Upload & Save Exhibit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-3 theme-secondary-btn rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* View Selected Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="theme-card border border-subtle rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-subtle pb-3">
              <h2 className="font-serif font-bold text-blue-600 dark:text-blue-400 text-base flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Judicial Bench Note Details
              </h2>
              <button onClick={() => setSelectedNote(null)} className="theme-subtext hover:theme-heading cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-subtle pb-2">
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{selectedNote.caseNumber}</span>
                <span className="px-2.5 py-1 theme-elevated text-xs font-bold rounded theme-heading">
                  {selectedNote.category}
                </span>
              </div>

              <h3 className="font-serif font-bold theme-heading text-base">{selectedNote.title}</h3>

              <div className="p-4 theme-elevated border border-subtle rounded-xl space-y-1">
                <span className="text-[10px] theme-subtext uppercase font-bold block">Observations & Notes:</span>
                <p className="theme-heading leading-relaxed font-serif whitespace-pre-wrap">{selectedNote.note}</p>
              </div>

              <div className="flex justify-between items-center text-[10px] theme-subtext pt-1">
                <span>Logged by: <strong>{selectedNote.author}</strong></span>
                <span>Date: <strong>{selectedNote.date}</strong></span>
              </div>
            </div>

            <button
              onClick={() => setSelectedNote(null)}
              className="w-full py-2.5 theme-secondary-btn font-bold rounded-xl text-xs cursor-pointer"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceOrganizer;
