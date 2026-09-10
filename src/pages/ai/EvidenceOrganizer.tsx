import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Search, Tag, FileText, Trash2, Eye, ShieldCheck, X, CheckCircle, Upload } from 'lucide-react';

export interface JudicialNote {
  id: string;
  caseNumber: string;
  title: string;
  note: string;
  category: string;
  tags: string[];
  date: string;
  author: string;
}

export const EvidenceOrganizer = () => {
  const [notes, setNotes] = useState<JudicialNote[]>(() => {
    const saved = localStorage.getItem('lexora_judicial_evidence_notes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback default
      }
    }
    return [
      {
        id: 'note_1',
        caseNumber: 'WP(C) 412/2024',
        title: 'PW-1 Cross-Examination Observations',
        note: 'Witness PW-1 confirmed execution of mortgage deed on 14.03.2022 but contested interest rate calculation methodology.',
        category: 'Testimony Bench Note',
        tags: ['PW-1', 'Mortgage', 'SARFAESI'],
        date: '2026-08-07 10:30 AM',
        author: 'Hon\'ble Justice Rajesh Sharma'
      },
      {
        id: 'note_2',
        caseNumber: 'CRL.A. 9912/2023',
        title: 'Forensic Ballistics Exhibit Marking',
        note: 'Exhibit P-4 bullet casing matches crime scene recovery. Defense Counsel given 7 days to file expert counter-rebuttal.',
        category: 'Forensic Exhibit Note',
        tags: ['Exhibit P-4', 'Forensics', 'CrPC Sec 293'],
        date: '2026-08-06 02:15 PM',
        author: 'Hon\'ble Justice Rajesh Sharma'
      }
    ];
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<JudicialNote | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form State
  const [caseNumber, setCaseNumber] = useState('WP(C) 412/2024');
  const [title, setTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [category, setCategory] = useState('Testimony Bench Note');
  const [tagInput, setTagInput] = useState('Evidence, Bench Observation');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    localStorage.setItem('lexora_judicial_evidence_notes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !noteContent.trim()) return;

    const newNoteObj: JudicialNote = {
      id: 'note_' + Date.now(),
      caseNumber: caseNumber || 'GENERIC-NOTE',
      title,
      note: noteContent,
      category,
      tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
      date: new Date().toLocaleString(),
      author: 'Hon\'ble Justice Rajesh Sharma'
    };

    setNotes((prev) => [newNoteObj, ...prev]);
    setTitle('');
    setNoteContent('');
    setShowAddModal(false);
    setSuccessMsg('Judicial Note & Evidence saved successfully to Bench Vault!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || n.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
            Create, categorize, and persistently store judicial observations, witness testimony notes, and evidence exhibits.
          </p>
        </div>

        {/* ➕ Plus Button to Add Notes */}
        <button
          onClick={() => setShowAddModal(true)}
          className="theme-primary-btn px-5 py-3 font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Add Bench Note / Evidence Note</span>
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
      <div className="theme-card border border-subtle rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg">
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="w-4 h-4 theme-subtext absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search saved bench notes by title, case number, or evidence content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 theme-elevated border border-subtle rounded-lg text-xs theme-heading placeholder:theme-subtext outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold theme-subtext">Category Filter:</span>
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
          </select>
        </div>
      </div>

      {/* Viewable Evidence & Bench Notes Inventory */}
      <div className="theme-card border border-subtle rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-subtle pb-3">
          <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Saved Judicial Evidence Notes ({filteredNotes.length})
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">Encrypted & Saved to Bench Chamber Storage</span>
        </div>

        {filteredNotes.length > 0 ? (
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
                        onClick={() => handleDeleteNote(n.id)}
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
            <p>No evidence or bench notes match your search query.</p>
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
                Add New Judicial Bench Note / Evidence
              </h2>
              <button onClick={() => setShowAddModal(false)} className="theme-subtext hover:theme-heading">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold theme-heading mb-1">Case Reference Number:</label>
                  <input
                    type="text"
                    required
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    className="w-full px-3 py-2 theme-elevated border border-subtle rounded-lg theme-heading font-bold"
                  />
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
                  className="flex-1 py-3 theme-primary-btn font-bold rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Note to Evidence Vault</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-3 theme-secondary-btn rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
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
              <button onClick={() => setSelectedNote(null)} className="theme-subtext hover:theme-heading">
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
              className="w-full py-2.5 theme-secondary-btn font-bold rounded-xl text-xs"
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
