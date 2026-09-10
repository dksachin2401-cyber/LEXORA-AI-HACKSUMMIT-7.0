import React, { useState } from 'react';
import { Search, FileText, Calendar, CheckCircle, Clock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

/** Format a Prisma date string (ISO or YYYY-MM-DD) to human-readable Indian date. */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Not available';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/** Return the next upcoming hearing from the hearings array, or the nextHearing fallback field. */
function resolveNextHearing(hearings: any[], nextHearingFallback: string | null): string {
  if (hearings && hearings.length > 0) {
    const now = new Date();
    const upcoming = hearings
      .map((h: any) => ({ ...h, _d: new Date(h.date) }))
      .filter((h: any) => h._d >= now)
      .sort((a: any, b: any) => a._d.getTime() - b._d.getTime());
    if (upcoming.length > 0) {
      return formatDate(upcoming[0].date);
    }
  }
  if (nextHearingFallback) return formatDate(nextHearingFallback);
  return 'No upcoming hearing scheduled.';
}

/** Build a structured proceedings history from the Hearing relation records. */
function buildHistory(hearings: any[]): { date: string; business: string; status: string }[] {
  if (!hearings || hearings.length === 0) return [];
  return hearings
    .slice()
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((h: any) => ({
      date: formatDate(h.date),
      business: h.type
        ? `${h.type}${h.courtRoom ? ` — ${h.courtRoom}` : ''}`
        : (h.courtRoom || 'Court Hearing'),
      status: h.status || 'Scheduled',
    }));
}

export const CheckCaseStatusPage: React.FC = () => {
  const [cnrNumber, setCnrNumber] = useState('');
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = cnrNumber.trim();
    if (!query) return;

    setSearching(true);
    setNotFound(false);
    setApiError(null);
    setCaseDetails(null);

    try {
      const results = await api.searchPublicCases(query);

      if (!Array.isArray(results) || results.length === 0) {
        setNotFound(true);
        return;
      }

      const c = results[0];
      const nextHearing = resolveNextHearing(c.hearings || [], c.nextHearing);
      const history = buildHistory(c.hearings || []);

      // Fetch public orders for this case
      let ordersData: any[] = [];
      try {
        const ordersRes = await api.getPublicCaseOrders(c.id);
        ordersData = ordersRes?.orders || [];
      } catch {
        ordersData = [];
      }

      setCaseDetails({
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        petitioner: c.petitioner,
        respondent: c.respondent,
        court: c.court || c.division || '—',
        division: c.division || '—',
        filingDate: formatDate(c.filingDate),
        nextHearing,
        status: c.status,
        type: c.type || '—',
        judge: c.judge ? `${c.judge.name}${c.judge.designation ? `, ${c.judge.designation}` : ''}` : null,
        description: c.description || null,
        history,
        orders: ordersData,
      });
    } catch (err: any) {
      if (err?.message?.includes('Case not found') || err?.message?.includes('404')) {
        setNotFound(true);
      } else {
        setApiError('LIVE API ERROR — Unable to retrieve case information. Please try again.');
      }
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setCnrNumber('');
    setCaseDetails(null);
    setNotFound(false);
    setApiError(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
          <Search className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          e-Courts Case Status &amp; Hearing Progress Tracker
        </h1>
        <p className="theme-subtext text-xs sm:text-sm mt-1">
          Track Live Hearing Dates, Case Progress, Stage of Suit, and Order History without visiting a courthouse
        </p>
      </div>

      {/* Search Form */}
      <div className="theme-card rounded-xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Enter Case Number or Party Name (e.g. CIV.SUIT 104/2025, WP(C) 412/2024, or party name)..."
            value={cnrNumber}
            onChange={(e) => setCnrNumber(e.target.value)}
            className="flex-1 px-4 py-3 theme-elevated border border-subtle rounded-xl text-xs theme-heading placeholder:theme-subtext outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            disabled={searching || !cnrNumber.trim()}
            className="theme-primary-btn px-6 py-3 text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>{searching ? 'Searching...' : 'Search Case Progress'}</span>
          </button>
          {(caseDetails || notFound || apiError) && (
            <button
              type="button"
              onClick={handleClear}
              className="theme-secondary-btn px-4 py-3 text-xs rounded-xl cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>

        {/* Loading indicator */}
        {searching && (
          <div className="flex items-center gap-3 text-xs theme-subtext">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
            Querying live e-Courts database...
          </div>
        )}

        {/* Not Found */}
        {notFound && !searching && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Case not found.</p>
              <p className="opacity-90 mt-1">
                No case records match your query. Please verify the case number or party name and try again.
                Ensure you use the exact case number format (e.g. CIV.SUIT 104/2025 or WP(C) 412/2024).
              </p>
            </div>
          </div>
        )}

        {/* API Error */}
        {apiError && !searching && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="font-semibold">{apiError}</p>
          </div>
        )}
      </div>

      {/* Case Details — only shown when a live case is found */}
      {caseDetails && !searching && (
        <div className="space-y-5">
          {/* Top Banner Card */}
          <div className="theme-card rounded-xl p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-subtle pb-4">
              <div>
                <span className="text-[10px] theme-subtext font-bold uppercase">Case Record</span>
                <h2 className="text-xl font-serif font-bold text-blue-600 dark:text-blue-400">{caseDetails.caseNumber}</h2>
                <p className="text-xs theme-heading font-medium mt-0.5">{caseDetails.title}</p>
              </div>
              <span className="px-3 py-1 badge-pending text-xs font-bold rounded-lg">
                {caseDetails.status}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 theme-elevated border border-subtle rounded-lg">
                <span className="theme-subtext text-[10px] font-bold uppercase">Court / Division</span>
                <p className="font-semibold theme-heading mt-1">{caseDetails.court}</p>
                {caseDetails.judge && (
                  <p className="text-[10px] theme-subtext mt-0.5">{caseDetails.judge}</p>
                )}
              </div>

              <div className="p-3 theme-elevated border border-subtle rounded-lg">
                <span className="theme-subtext text-[10px] font-bold uppercase">Next Hearing Date</span>
                <p className="font-bold text-blue-600 dark:text-blue-400 font-mono mt-1 text-sm">{caseDetails.nextHearing}</p>
                <p className="text-[10px] theme-subtext">Scheduled Cause List</p>
              </div>

              <div className="p-3 theme-elevated border border-subtle rounded-lg">
                <span className="theme-subtext text-[10px] font-bold uppercase">Case Type</span>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-1">{caseDetails.type}</p>
              </div>

              <div className="p-3 theme-elevated border border-subtle rounded-lg">
                <span className="theme-subtext text-[10px] font-bold uppercase">Filing Date</span>
                <p className="font-semibold theme-heading mt-1">{caseDetails.filingDate}</p>
              </div>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 theme-elevated border border-subtle rounded-lg">
                <span className="theme-subtext text-[10px] font-bold uppercase">Petitioner / Appellant</span>
                <p className="font-semibold theme-heading mt-1">{caseDetails.petitioner}</p>
              </div>
              <div className="p-3 theme-elevated border border-subtle rounded-lg">
                <span className="theme-subtext text-[10px] font-bold uppercase">Respondent / Opposite Party</span>
                <p className="font-semibold theme-heading mt-1">{caseDetails.respondent}</p>
              </div>
            </div>

            {/* Description if available */}
            {caseDetails.description && (
              <div className="p-4 theme-elevated border border-subtle rounded-xl space-y-1 text-xs">
                <strong className="text-blue-600 dark:text-blue-400 font-serif">📄 Case Description:</strong>
                <p className="theme-subtext leading-relaxed mt-1">{caseDetails.description}</p>
              </div>
            )}
          </div>

          {/* Case Hearing History Timeline — from actual Hearing records */}
          <div className="theme-card rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold theme-heading text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Case Hearing Business &amp; Proceedings History
            </h3>

            {caseDetails.history.length === 0 ? (
              <p className="text-xs theme-subtext italic">No hearing records available for this case.</p>
            ) : (
              <div className="space-y-3">
                {caseDetails.history.map((h: any, idx: number) => (
                  <div key={idx} className="p-3.5 theme-elevated border border-subtle rounded-xl flex justify-between items-center text-xs">
                    <div className="space-y-0.5">
                      <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{h.date}</span>
                      <p className="theme-heading font-semibold">{h.business}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                      h.status === 'Completed'
                        ? 'badge-supported'
                        : h.status === 'Postponed'
                        ? 'badge-rejected'
                        : 'badge-pending'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Official Public Orders Section */}
          <div className="theme-card rounded-xl p-6 space-y-4 shadow-xl">
            <h3 className="font-serif font-bold theme-heading text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Certified Public Court Orders & Judgments
            </h3>

            {(!caseDetails.orders || caseDetails.orders.length === 0) ? (
              <div className="p-4 theme-elevated border border-subtle rounded-xl text-xs theme-subtext italic">
                No public orders available.
              </div>
            ) : (
              <div className="space-y-3">
                {caseDetails.orders.map((ord: any) => (
                  <div key={ord.id} className="p-4 theme-elevated border border-subtle rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="font-bold text-blue-600 dark:text-blue-400">{ord.title}</span>
                        <span className="text-[10px] theme-subtext block font-mono">
                          Type: {ord.docType} · Certified: {formatDate(ord.signedAt || ord.createdAt)}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 badge-supported text-[10px] font-bold rounded">
                        APPROVED ORDER
                      </span>
                    </div>
                    <p className="theme-subtext theme-card p-3 rounded border border-subtle font-mono text-[11px] whitespace-pre-wrap">
                      {ord.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckCaseStatusPage;
