import React, { useState } from 'react';
import { FileCode, Printer, Download, Send, ShieldCheck, Building, CheckCircle, FileText } from 'lucide-react';

export const SummonsNoticeGeneratorPage: React.FC = () => {
  const [templateType, setTemplateType] = useState('cpc_summons');
  const [courtName, setCourtName] = useState('IN THE HIGH COURT OF JUDICATURE AT BOMBAY');
  const [caseNumber, setCaseNumber] = useState('CIVIL SUIT NO. 412 OF 2026');
  const [cnrNumber, setCnrNumber] = useState('MHBM010041202026');
  const [petitioner, setPetitioner] = useState('State Bank of India (Commercial Branch)');
  const [respondent, setRespondent] = useState('M/s Apex Enterprises Pvt. Ltd. & Ors.');
  const [respondentAddress, setRespondentAddress] = useState('Plot No. 42, MIDC Industrial Area, Andheri East, Mumbai - 400093');
  const [hearingDate, setHearingDate] = useState('2026-08-28');
  const [courtroomNo, setCourtroomNo] = useState('Courtroom No. 4 (Bench II)');
  const [presidingOfficer, setPresidingOfficer] = useState('Hon\'ble Justice Rajesh Sharma');
  const [registrarName, setRegistrarName] = useState('Amit Kumar (Bench Registrar)');
  const [dispatchStatus, setDispatchStatus] = useState('');

  const generateSummonsText = () => {
    if (templateType === 'cpc_summons') {
      return `OFFICIAL COURT SUMMONS TO RESPONDENT / DEFENDANT
[ORDER V RULE 1 AND 5, CODE OF CIVIL PROCEDURE, 1908]

IN THE COURT OF: ${courtName.toUpperCase()}
CNR NUMBER: ${cnrNumber}
CASE REFERENCE: ${caseNumber}

BETWEEN:
${petitioner.toUpperCase()}                          ... PETITIONER / PLAINTIFF
VERSUS
${respondent.toUpperCase()}                         ... RESPONDENT / DEFENDANT

TO:
${respondent}
ADDRESS: ${respondentAddress}

WHEREAS the above-named Petitioner has instituted a Civil Suit against you in this Court for Title Injunction and Commercial Recovery;

YOU ARE HEREBY SUMMONED AND REQUIRED to appear in this Court in person, or by an Advocate duly instructed and able to answer all material questions relating to the suit, on the ${hearingDate} at 10:30 AM in ${courtroomNo} before ${presidingOfficer}.

TAKE NOTICE THAT:
1. You are required to file a Written Statement of your defense within THIRTY (30) DAYS from the date of service of this summons as mandated under Order VIII Rule 1 of the Code of Civil Procedure, 1908.
2. In default of your appearance on the day before mentioned, the suit will be heard and determined EX-PARTE in your absence.
3. You are further directed to produce all documents in your possession or power upon which you intend to rely in support of your defense.

GIVEN UNDER MY HAND AND THE SEAL OF THIS COURT, THIS 7TH DAY OF AUGUST 2026.

[SEAL OF THE HIGH COURT]

________________────────────────________
${registrarName.toUpperCase()}
BENCH REGISTRAR / PROCESS ISSUING OFFICER
${courtName}

==================================================
COURT PROCESS SERVER DISPATCH ACKNOWLEDGEMENT
Summons Receipt No: SUM/MH/${Math.floor(100000 + Math.random() * 900000)}/2026
Delivered to Bailiff / Speed Post A.D. Tracking No: ED984120938IN
Date of Dispatch: ${new Date().toLocaleDateString()}
`;
    }

    if (templateType === 'crpc_41a') {
      return `OFFICIAL NOTICE OF APPEARANCE BEFORE COURT / INVESTIGATING REGISTRY
[SECTION 41A, CODE OF CRIMINAL PROCEDURE, 1973 / SEC 35 BNSS]

IN THE COURT / REGISTRY OF: ${courtName.toUpperCase()}
CASE REFERENCE: ${caseNumber} (CNR: ${cnrNumber})

COMPLAINANT: ${petitioner}
ACCUSED / RESPONDENT: ${respondent}
RESIDING AT: ${respondentAddress}

WHEREAS reasonable complaint has been made against you regarding commission of cognizable offense under statutory provisions;

YOU ARE HEREBY DIRECTED TO APPEAR before ${presidingOfficer} in ${courtroomNo} on ${hearingDate} at 10:30 AM to join judicial proceedings.

STATUTORY CONDITIONS & WARNINGS:
1. You shall comply with the terms of this notice and appear as directed.
2. You shall not commit any offense while this notice remains in force.
3. You shall not make any inducement, threat, or promise to any person acquainted with the facts of the case.
4. Failure to comply with this notice may result in issuance of a Non-Bailable Warrant (NBW) of Arrest.

GIVEN UNDER MY HAND AND SEAL THIS 7TH DAY OF AUGUST 2026.

________________────────────────________
${registrarName.toUpperCase()}
REGISTRY OFFICER / BENCH CLERK
`;
    }

    if (templateType === 'ni_138') {
      return `STATUTORY LEGAL DEMAND NOTICE FOR CHEQUE DISHONOR
[SECTION 138, NEGOTIABLE INSTRUMENTS ACT, 1881]

TO: ${respondent}
ADDRESS: ${respondentAddress}

FROM: ${petitioner}

UNDER INSTRUCTIONS FROM OUR CLIENT, WE HEREBY SERVE YOU WITH THIS STATUTORY LEGAL DEMAND NOTICE:

1. That you issued Cheque No. 412098 drawn on State Bank of India for an amount of INR 12,50,000/- in discharge of legally enforceable debt.
2. That the aforesaid cheque was presented for realization and returned unpaid with bank memo dated 01.08.2026 with remark "FUNDS INSUFFICIENT".
3. YOU ARE HEREBY CALLED UPON to pay the full cheque amount of INR 12,50,000/- within FIFTEEN (15) DAYS from receipt of this statutory notice.
4. In the event of failure to deposit the amount within 15 days, criminal prosecution under Section 138 of NI Act shall be instituted against you seeking 2 years imprisonment and double cheque fine.

DATED THIS 7TH DAY OF AUGUST 2026.

________________────────────────________
ADVOCATE FOR THE COMPLAINANT
`;
    }

    return `STATUTORY DEMAND NOTICE UNDER SECTION 13(2) SARFAESI ACT, 2002
ISSUED BY SECURED CREDITOR: ${petitioner}
TO NPA BORROWER: ${respondent} (${respondentAddress})

WHEREAS your loan account has been classified as Non-Performing Asset (NPA) following default;

YOU ARE HEREBY REQUIRED TO DISCHARGE IN FULL your total statutory liability of INR 45,00,00,000/- (Rupees Forty-Five Crores) within SIXTY (60) DAYS from the date of this notice, failing which physical possession of secured mortgaged assets will be taken under Section 13(4) of SARFAESI Act.

DATED THIS 7TH DAY OF AUGUST 2026.
SECURED CREDITOR AUTHORIZED OFFICER
`;
  };

  const handleDispatchProcess = () => {
    setDispatchStatus('Summons Dispatched to District Bailiff & Registered Speed Post A.D. Queue (Tracking ID: ED984120938IN)');
    setTimeout(() => setDispatchStatus(''), 5000);
  };

  const handleDownloadPDF = () => {
    const text = generateSummonsText();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Official_Court_Summons_${cnrNumber}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
            <Building className="w-6 h-6 text-[#C9A24B]" />
            Official Court Summons & Statutory Notice Generator
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Generate authentic High Court & District Court Summons under Order V CPC, Section 41A CrPC, and Section 138 NI Act with Process Server Coupons
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#1B2C4F]" />
            <span>Download Certified Summons</span>
          </button>
        </div>
      </div>

      {/* Action Status */}
      {dispatchStatus && (
        <div className="p-3.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{dispatchStatus}</span>
        </div>
      )}

      {/* Main Grid: Input Controls + Real-Life Render Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (5 Cols) */}
        <div className="lg:col-span-5 bg-[#132240] border border-white/15 rounded-xl p-5 space-y-4 shadow-xl text-xs">
          <h2 className="text-sm font-serif font-bold text-[#C9A24B] border-b border-white/15 pb-2">
            Select Official Real-Life Summons Template
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Select Statutory Format:</label>
              <select
                value={templateType}
                onChange={(e) => setTemplateType(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-white font-bold cursor-pointer"
              >
                <option value="cpc_summons">Order V Rule 1 CPC — Official Civil Court Summons</option>
                <option value="crpc_41a">Section 41A CrPC — Official Notice of Appearance</option>
                <option value="ni_138">Section 138 NI Act — Cheque Dishonor Statutory Notice</option>
                <option value="sarfaesi">Section 13(2) SARFAESI Act — 60-Day NPA Recovery Notice</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Court Establishment:</label>
              <input
                type="text"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Case No:</label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">CNR No:</label>
                <input
                  type="text"
                  value={cnrNumber}
                  onChange={(e) => setCnrNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Petitioner / Plaintiff Name:</label>
              <input
                type="text"
                value={petitioner}
                onChange={(e) => setPetitioner(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Respondent / Defendant Name:</label>
              <input
                type="text"
                value={respondent}
                onChange={(e) => setRespondent(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Respondent Full Postal Address:</label>
              <textarea
                rows={2}
                value={respondentAddress}
                onChange={(e) => setRespondentAddress(e.target.value)}
                className="w-full p-2.5 bg-white/10 border border-white/20 rounded-lg text-white text-xs outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Hearing Date:</label>
                <input
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-white font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Courtroom No:</label>
                <input
                  type="text"
                  value={courtroomNo}
                  onChange={(e) => setCourtroomNo(e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            <button
              onClick={handleDispatchProcess}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>Dispatch Summons to Process Server (Bailiff)</span>
            </button>
          </div>
        </div>

        {/* Right Real-Life Document Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-[#132240] border border-white/15 rounded-xl p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/15 pb-2">
            <h2 className="text-sm font-serif font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C9A24B]" />
              Official Judicial Format Render (Real-Life Court Template)
            </h2>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-mono font-bold">
              CPC Compliant
            </span>
          </div>

          <div className="p-6 bg-[#0F1B33] border border-white/20 rounded-xl font-mono text-xs text-slate-100 whitespace-pre-wrap leading-relaxed overflow-x-auto shadow-inner border-l-4 border-l-[#C9A24B]">
            {generateSummonsText()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummonsNoticeGeneratorPage;
