import React, { useState } from 'react';
import { FileSearch, X, AlertTriangle, Clock, CheckSquare, Sparkles } from 'lucide-react';

interface NoticeDeciphererModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NoticeDeciphererModal: React.FC<NoticeDeciphererModalProps> = ({ isOpen, onClose }) => {
  const [noticeText, setNoticeText] = useState('');
  const [deciphered, setDeciphered] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDecipher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeText.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setDeciphered({
        noticeType: 'Court Summons / Statutory Legal Notice',
        urgency: 'HIGH URGENCY — Returnable in 30 Days',
        deadline: '30 Days from Date of Service',
        plainMeaning: 'This notice instructs you to appear before the court or submit a written statement through an advocate. Failing to respond within the deadline allows the court to issue a judgment against you without hearing your side.',
        consequences: [
          'Ex-Parte Proceedings: The judge can grant court orders to the opposing party without hearing your defense.',
          'Warrant Issuance: In criminal/cheque bounce notices, ignoring notice leads to a Non-Bailable Arrest Warrant.'
        ],
        actionSteps: [
          'Step 1: Do NOT ignore the notice. Check the court name and return date printed at the top.',
          'Step 2: Take the notice copy to your advocate or District Legal Services Authority (DLSA) for free legal aid.',
          'Step 3: Prepare and file a Written Statement / Reply within 30 days under Order VIII Rule 1 CPC.'
        ]
      });
      setLoading(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="theme-card border border-subtle rounded-xl w-full max-w-2xl theme-heading shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 theme-header border-b border-subtle flex justify-between items-center">
          <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--primary-accent)]" />
            Plain-Language Court Summons & Notice Decipherer
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-500/10 theme-subtext hover:theme-heading">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <form onSubmit={handleDecipher} className="space-y-3">
            <label className="block text-xs font-semibold theme-subtext">
              Paste Legal Notice / Summons Text or Police Notice:
            </label>
            <textarea
              rows={4}
              value={noticeText}
              onChange={(e) => setNoticeText(e.target.value)}
              placeholder="Paste notice text, e.g.: WHEREAS the Petitioner has filed a suit against you, IT IS HEREBY ORDERED that Notice be issued to Respondent returnable within 3 weeks..."
              className="w-full p-3 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md text-xs theme-heading placeholder:theme-subtext outline-none focus:border-[var(--primary-accent)]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 theme-primary-btn font-semibold rounded-md shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileSearch className="w-4 h-4" />
              <span>{loading ? 'Deciphering Legal Notice...' : 'Decipher Legal Notice into Plain Language'}</span>
            </button>
          </form>

          {deciphered && (
            <div className="space-y-4 pt-2 border-t border-subtle">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md flex justify-between items-center text-amber-900 dark:text-amber-200">
                <span className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  {deciphered.urgency}
                </span>
                <span className="px-2.5 py-0.5 bg-rose-600 text-white font-extrabold rounded text-[10px]">
                  DEADLINE: {deciphered.deadline}
                </span>
              </div>

              <div className="p-4 theme-elevated border border-subtle rounded-md space-y-2 leading-relaxed">
                <h3 className="font-serif font-bold text-[var(--primary-accent)] text-sm">💡 Plain Language Meaning:</h3>
                <p className="theme-subtext">{deciphered.plainMeaning}</p>
              </div>

              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-md space-y-2">
                <h3 className="font-serif font-bold text-rose-800 dark:text-rose-300 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Consequences if Ignored:
                </h3>
                <ul className="list-disc list-inside space-y-1 theme-subtext">
                  {deciphered.consequences.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-md space-y-2">
                <h3 className="font-serif font-bold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Recommended Action Steps:
                </h3>
                <ul className="space-y-1 theme-subtext">
                  {deciphered.actionSteps.map((s: string, i: number) => (
                    <li key={i} className="font-semibold">{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
