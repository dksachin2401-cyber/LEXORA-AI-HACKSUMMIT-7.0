import React, { useState } from 'react';
import { ShieldCheck, Download, X, CheckCircle, FileText } from 'lucide-react';

interface FreeLegalAidModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FreeLegalAidModal: React.FC<FreeLegalAidModalProps> = ({ isOpen, onClose }) => {
  const [applicantName, setApplicantName] = useState('Ramesh Patel');
  const [income, setIncome] = useState('150000');
  const [category, setCategory] = useState('Low Income (< ₹3 Lakhs/Year)');
  const [district, setDistrict] = useState('District Legal Services Authority, Bench II');
  const [caseType, setCaseType] = useState('Civil Property & Land Dispute');
  const [generatedDoc, setGeneratedDoc] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = `APPLICATION FOR FREE LEGAL AID COUNSEL
[Under Section 12 of the Legal Services Authorities Act, 1987]
================================================================

TO:
The Member Secretary / Chairman,
District Legal Services Authority (DLSA),
${district}

APPLICANT DETAILS:
Name of Applicant: ${applicantName}
Annual Family Income: ₹${parseInt(income || '0').toLocaleString()} Per Annum
Eligibility Category: ${category}
Type of Legal Dispute: ${caseType}

SUBJECT: Request for Assignment of Free Panel Legal Aid Advocate

RESPECTED SIR / MADAM,
1. I, the undersigned applicant, am a citizen residing within the territorial jurisdiction of this Hon'ble Authority.
2. I am in urgent need of legal assistance regarding my pending matter (${caseType}).
3. My annual family income is within the statutory ceiling of ₹3,000,000/- and I belong to the eligible entitlement category (${category}) under Section 12 of the Legal Services Authorities Act, 1987.
4. I am financially unable to engage a private legal practitioner to represent my case.

PRAYER:
It is humbly prayed that this Hon'ble Authority may be pleased to assign an empanelled Legal Aid Advocate to represent me and provide free legal counsel & litigation assistance.

DATE: 7th August 2026
PLACE: District Court Registry

________________________________________
SIGNATURE / THUMB IMPRESSION OF APPLICANT
(${applicantName})`;

    setGeneratedDoc(doc);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="theme-card border border-subtle rounded-xl w-full max-w-2xl theme-heading shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 theme-header border-b border-subtle flex justify-between items-center">
          <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--primary-accent)]" />
            Free Legal Aid Application Generator (Section 12 DLSA)
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-500/10 theme-subtext hover:theme-heading">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {!generatedDoc ? (
            <form onSubmit={handleGenerateApplication} className="space-y-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-900 dark:text-amber-200">
                <strong>Statutory Right:</strong> Under Section 12 of the Legal Services Authorities Act 1987, low-income citizens, women, SC/ST, custody victims, and disabled persons are entitled to 100% Free Legal Counsel & court fee waivers.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Applicant Name:</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Annual Family Income (₹):</label>
                  <input
                    type="number"
                    required
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Entitlement Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
                  >
                    <option value="Low Income (< ₹3 Lakhs/Year)">Low Income (&lt; ₹3 Lakhs/Year)</option>
                    <option value="Woman or Child Entitlement">Woman or Child Entitlement</option>
                    <option value="Member of Scheduled Caste / Scheduled Tribe">Member of SC / ST</option>
                    <option value="Person with Disability">Person with Disability</option>
                    <option value="Victim of Industrial Disaster / Custody">Victim of Disaster / Custody</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">District Legal Authority (DLSA):</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-subtext mb-1">Type of Legal Dispute:</label>
                <input
                  type="text"
                  required
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md theme-heading outline-none focus:border-[var(--primary-accent)]"
                />
              </div>

              <button type="submit" className="w-full py-2.5 theme-primary-btn font-semibold rounded-md shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Generate Official Legal Aid Application</span>
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-md text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Free Legal Aid Application Form generated successfully! Submit this to your District Court Registry.</span>
              </div>

              <textarea
                rows={12}
                readOnly
                value={generatedDoc}
                className="w-full p-4 bg-slate-50 dark:bg-[#151E27] border border-subtle rounded-md text-xs font-mono theme-heading leading-relaxed outline-none"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const blob = new Blob([generatedDoc], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `DLSA_Legal_Aid_Application_${applicantName.replace(/\s+/g, '_')}.txt`;
                    a.click();
                  }}
                  className="flex-1 py-2.5 theme-primary-btn font-semibold rounded-md shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Official Application Form</span>
                </button>
                <button
                  onClick={() => setGeneratedDoc(null)}
                  className="px-4 py-2.5 theme-secondary-btn border border-subtle rounded-md font-semibold text-xs cursor-pointer"
                >
                  Edit Details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
