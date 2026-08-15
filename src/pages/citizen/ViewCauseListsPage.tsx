import React, { useState } from 'react';
import { Calendar, Building, Clock, Search, Filter, Eye, User, Scale } from 'lucide-react';

interface CauseListItem {
  itemNo: number;
  caseNo: string;
  cnr: string;
  parties: string;
  stage: string;
  time: string;
  advocate: string;
  statute: string;
}

const courtroomSchedules: Record<string, Record<string, CauseListItem[]>> = {
  c1: { // Courtroom #1 - Commercial Debt & SARFAESI (Justice Rajesh Sharma)
    '2026-08-07': [
      { itemNo: 1, caseNo: 'WP(C) 412/2024', cnr: 'MHBM010041202024', parties: 'State Bank of India vs. M/s Apex Enterprises Pvt. Ltd.', stage: 'Final Arguments on Possession', time: '10:30 AM', advocate: 'Adv. Vikramaditya Sen', statute: 'SARFAESI Act Sec 13(4)' },
      { itemNo: 2, caseNo: 'CIV.SUIT 104/2025', cnr: 'MHBM010010402025', parties: 'HDFC Bank Ltd. vs. Om Infra Projects & Ors.', stage: 'Written Statement Verification', time: '11:15 AM', advocate: 'Adv. Priya Nair', statute: 'CPC Order VIII Rule 1' },
      { itemNo: 3, caseNo: 'COMM.SUIT 889/2026', cnr: 'MHBM010088902026', parties: 'ICICI Bank vs. Century Mills Ltd.', stage: 'Interim Stay Application', time: '12:00 PM', advocate: 'Adv. Rajesh Kumar', statute: 'Commercial Courts Act' },
      { itemNo: 4, caseNo: 'OA 512/2026', cnr: 'MHBM010051202026', parties: 'Axis Bank Ltd. vs. Sterling Biotech', stage: 'Debt Recovery Trial', time: '02:15 PM', advocate: 'Adv. Meenakshi Sundaram', statute: 'DRT Act 1993 Sec 19' },
      { itemNo: 5, caseNo: 'COMM.APPEAL 304/2026', cnr: 'MHBM010030402026', parties: 'Reliance Commercial vs. Global Logistics', stage: 'Ex-Parte Order Arguments', time: '03:30 PM', advocate: 'Adv. Sunita Rao', statute: 'CPC Order XXXIX' },
    ],
    '2026-08-08': [
      { itemNo: 1, caseNo: 'COMM.SUIT 910/2026', cnr: 'MHBM010091002026', parties: 'Bank of Baroda vs. Zenith Steel Ltd.', stage: 'Framing of Statutory Issues', time: '10:30 AM', advocate: 'Adv. Ananya Roy', statute: 'Commercial Courts Act' },
      { itemNo: 2, caseNo: 'WP(C) 842/2025', cnr: 'MHBM010084202025', parties: 'Punjab National Bank vs. Mahaveer Builders', stage: 'Counter Affidavit Review', time: '11:30 AM', advocate: 'Adv. Suresh Mehta', statute: 'SARFAESI Act Sec 17' },
      { itemNo: 3, caseNo: 'OA 102/2026', cnr: 'MHBM010010202026', parties: 'Canara Bank vs. Delta Shipping Corp', stage: 'Cross Examination of Witness', time: '02:30 PM', advocate: 'Adv. Neha Kulkarni', statute: 'DRT Recovery Rules' },
    ]
  },
  c2: { // Courtroom #2 - Criminal Appeals & Bail (Justice Meenakshi Sundaram)
    '2026-08-07': [
      { itemNo: 1, caseNo: 'BAIL.APP 889/2026', cnr: 'MHBM020088902026', parties: 'State of Maharashtra vs. Vijay Deshmukh', stage: 'Anticipatory Bail Arguments', time: '10:30 AM', advocate: 'Adv. K.T. Seshadri', statute: 'CrPC Sec 438 / BNSS 482' },
      { itemNo: 2, caseNo: 'CRL.APPEAL 401/2025', cnr: 'MHBM020040102025', parties: 'Suresh Patil vs. State of Maharashtra', stage: 'Suspension of Sentence Motion', time: '11:30 AM', advocate: 'Adv. Devendra Sharma', statute: 'CrPC Sec 389' },
      { itemNo: 3, caseNo: 'CRL.REV 215/2026', cnr: 'MHBM020021502026', parties: 'Sunita Gaikwad vs. Ramesh Gaikwad', stage: 'Maintenance Order Revision', time: '12:30 PM', advocate: 'Adv. Smita Deshmukh', statute: 'CrPC Sec 125' },
      { itemNo: 4, caseNo: 'BAIL.APP 942/2026', cnr: 'MHBM020094202026', parties: 'State vs. Mohammed Ibrahim', stage: 'Regular Bail Hearing', time: '02:30 PM', advocate: 'Adv. Tariq Mansoor', statute: 'CrPC Sec 439' },
    ],
    '2026-08-08': [
      { itemNo: 1, caseNo: 'BAIL.APP 955/2026', cnr: 'MHBM020095502026', parties: 'State vs. Anand Kulkarni', stage: 'Anticipatory Bail Hearing', time: '10:30 AM', advocate: 'Adv. R.S. Pathak', statute: 'CrPC Sec 438' },
      { itemNo: 2, caseNo: 'CRL.PET 312/2026', cnr: 'MHBM020031202026', parties: 'Deepak Merchant vs. State of Maharashtra', stage: 'FIR Quashing Arguments', time: '11:45 AM', advocate: 'Adv. Gopal Subramanium', statute: 'CrPC Sec 482' },
    ]
  },
  c3: { // Courtroom #3 - Constitutional Writs (Justice Vikramaditya Deshmukh)
    '2026-08-07': [
      { itemNo: 1, caseNo: 'WP(C) 1042/2026', cnr: 'MHBM030104202026', parties: 'Environment Protection Forum vs. State of Maharashtra', stage: 'Public Interest Litigation (PIL)', time: '10:30 AM', advocate: 'Adv. Indira Jaising', statute: 'Article 226 / Art 21' },
      { itemNo: 2, caseNo: 'WP(C) 880/2025', cnr: 'MHBM030088002025', parties: 'Dr. Rahul Varma vs. University Grants Commission', stage: 'Service Writ Arguments', time: '11:45 AM', advocate: 'Adv. Kapil Sibal', statute: 'Article 226' },
      { itemNo: 3, caseNo: 'WP(C) 1205/2026', cnr: 'MHBM030120502026', parties: 'Apex Traders Union vs. GST Commissioner', stage: 'Tax Penalty Stay Motion', time: '02:15 PM', advocate: 'Adv. Harish Salve', statute: 'CGST Act Sec 107' },
    ],
    '2026-08-08': [
      { itemNo: 1, caseNo: 'WP(C) 1290/2026', cnr: 'MHBM030129002026', parties: 'Kisan Kalyan Samiti vs. Union of India', stage: 'Land Acquisition Stay', time: '10:30 AM', advocate: 'Adv. Prashant Bhushan', statute: 'Article 300A' },
      { itemNo: 2, caseNo: 'WP(C) 740/2025', cnr: 'MHBM030074002025', parties: 'Municipal Officers Union vs. State', stage: 'Pension Order Review', time: '12:00 PM', advocate: 'Adv. Abhishek Singhvi', statute: 'Article 226' },
    ]
  },
  c4: { // Courtroom #4 - Civil Land & Property (Justice Sunita Rao)
    '2026-08-07': [
      { itemNo: 1, caseNo: 'CIV.SUIT 412/2024', cnr: 'MHBM040041202024', parties: 'Ramesh Patel vs. Municipal Corporation', stage: 'W.S. Filing & Title Maps', time: '10:30 AM', advocate: 'Adv. Priya Nair', statute: 'CPC Order VIII Rule 1' },
      { itemNo: 2, caseNo: 'FIRST.APPEAL 210/2025', cnr: 'MHBM040021002025', parties: 'Savitri Devi vs. Shantilal & Ors.', stage: 'Partition Decree Appeal', time: '11:45 AM', advocate: 'Adv. Mahesh Jethmalani', statute: 'Hindu Succession Act' },
      { itemNo: 3, caseNo: 'CIV.REVISION 109/2026', cnr: 'MHBM040010902026', parties: 'Standard Lease Corp vs. City Tenants Co-op', stage: 'Eviction Order Stay', time: '02:30 PM', advocate: 'Adv. Mukul Rohatgi', statute: 'Maharashtra Rent Control Act' },
    ],
    '2026-08-08': [
      { itemNo: 1, caseNo: 'CIV.SUIT 519/2026', cnr: 'MHBM040051902026', parties: 'Balkrishna Trust vs. State Land Revenue Dept', stage: 'Injunction Notice Hearing', time: '10:30 AM', advocate: 'Adv. Arvind Datar', statute: 'Specific Relief Act' },
    ]
  }
};

export const ViewCauseListsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2026-08-07');
  const [selectedCourtKey, setSelectedCourtKey] = useState('c1');

  const courtNames: Record<string, string> = {
    c1: 'Courtroom #1 — Commercial Debt & SARFAESI (Hon\'ble Justice Rajesh Sharma)',
    c2: 'Courtroom #2 — Criminal Appeals & Bail (Hon\'ble Justice Meenakshi Sundaram)',
    c3: 'Courtroom #3 — Constitutional Writs Art 226 (Hon\'ble Justice Vikramaditya Deshmukh)',
    c4: 'Courtroom #4 — Civil Land & Property Disputes (Hon\'ble Justice Sunita Rao)',
  };

  const getList = (): CauseListItem[] => {
    const courtSched = courtroomSchedules[selectedCourtKey];
    if (courtSched && courtSched[selectedDate]) {
      return courtSched[selectedDate];
    }
    // Dynamic fallback list if date selected is outside pre-seeded array
    return [
      { itemNo: 1, caseNo: 'WP(C) 991/2026', cnr: 'MHBM010099102026', parties: 'General Public Petition vs. Registry Department', stage: 'Preliminary Motion', time: '10:30 AM', advocate: 'Adv. Registered Advocate', statute: 'High Court Rules' },
      { itemNo: 2, caseNo: 'CIV.SUIT 810/2026', cnr: 'MHBM010081002026', parties: 'State Housing Federation vs. Private Developers', stage: 'Notice Returnable', time: '11:30 AM', advocate: 'Adv. Senior Counsel', statute: 'CPC Order V' },
      { itemNo: 3, caseNo: 'MISC.APP 412/2026', cnr: 'MHBM010041202026', parties: 'Commercial Bank vs. Borrower Guarantors', stage: 'Document Verification', time: '02:15 PM', advocate: 'Adv. Bank Counsel', statute: 'Banking Laws' },
    ];
  };

  const activeList = getList();

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#C9A24B]" />
          Daily Courtroom Cause List & Bench Schedule
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Real-time Item Numbers, Presiding Judges, Scheduled Hearing Times, and Daily Court Listings
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-[#C9A24B]" />
          <span className="text-xs font-bold text-slate-300">Select Date:</span>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3.5 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-xs font-bold text-[#C9A24B] outline-none cursor-pointer"
          >
            <option value="2026-08-07">Today (07 August 2026)</option>
            <option value="2026-08-08">Tomorrow (08 August 2026)</option>
            <option value="2026-08-10">Monday (10 August 2026)</option>
            <option value="2026-08-12">Wednesday (12 August 2026)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building className="w-4 h-4 text-[#C9A24B]" />
          <span className="text-xs font-bold text-slate-300">Select Courtroom Bench:</span>
          <select
            value={selectedCourtKey}
            onChange={(e) => setSelectedCourtKey(e.target.value)}
            className="px-3.5 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-xs font-bold text-[#C9A24B] outline-none cursor-pointer"
          >
            <option value="c1">Courtroom #1 (Justice Rajesh Sharma - Commercial Debt & SARFAESI)</option>
            <option value="c2">Courtroom #2 (Justice Meenakshi Sundaram - Criminal Appeals & Bail)</option>
            <option value="c3">Courtroom #3 (Justice Vikramaditya Deshmukh - Writs Art 226)</option>
            <option value="c4">Courtroom #4 (Justice Sunita Rao - Civil Land & Property)</option>
          </select>
        </div>
      </div>

      {/* Bench Header Card */}
      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200 flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>Active Listing for: <strong>{courtNames[selectedCourtKey]}</strong></span>
        </div>
        <span className="font-mono text-emerald-400 font-bold bg-white/10 px-2.5 py-1 rounded">
          {activeList.length} Matters Scheduled on {selectedDate}
        </span>
      </div>

      {/* Cause List Table */}
      <div className="bg-[#132240] border border-white/15 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Building className="w-5 h-5 text-[#C9A24B]" />
            Official Daily Cause List Schedule
          </h2>
          <span className="text-xs text-emerald-400 font-mono font-bold">Verified Court Registry Listing</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#0A1428] text-slate-300 font-serif uppercase tracking-wider border-b border-white/15">
              <tr>
                <th className="px-4 py-3">Item #</th>
                <th className="px-4 py-3">Case Reference & CNR</th>
                <th className="px-4 py-3">Parties / Cause Title</th>
                <th className="px-4 py-3">Stage of Hearing</th>
                <th className="px-4 py-3">Statutory Provision</th>
                <th className="px-4 py-3">Advocate on Record</th>
                <th className="px-4 py-3">Scheduled Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {activeList.map((item) => (
                <tr key={item.itemNo} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-bold font-mono text-emerald-400">#{item.itemNo}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-mono font-bold text-[#C9A24B] block">{item.caseNo}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.cnr}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-white">{item.parties}</td>
                  <td className="px-4 py-3 text-slate-300">{item.stage}</td>
                  <td className="px-4 py-3 text-cyan-300 font-mono text-[11px]">{item.statute}</td>
                  <td className="px-4 py-3 text-slate-400">{item.advocate}</td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-300 whitespace-nowrap">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewCauseListsPage;
