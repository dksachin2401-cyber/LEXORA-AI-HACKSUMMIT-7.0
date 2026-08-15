import React, { useState } from 'react';
import { Download, FileText, Search, ShieldCheck, CheckCircle, Lock } from 'lucide-react';

export const DownloadOrdersPage: React.FC = () => {
  const [searchNo, setSearchNo] = useState('');
  const [orders, setOrders] = useState([
    {
      id: 'ord_1',
      caseNo: 'WP(C) 412/2024',
      title: 'State Bank of India vs. M/s Apex Enterprises',
      date: '14th February 2026',
      judge: 'Hon\'ble Justice Rajesh Sharma',
      orderType: 'Interim Notice & Attachment Order',
      fileSize: '1.4 MB',
      content: `IN THE HIGH COURT OF JUDICATURE AT BOMBAY
WRIT PETITION (CIVIL) NO. 412 OF 2024

State Bank of India                          ... PETITIONER
VERSUS
M/s Apex Enterprises & Ors.                  ... RESPONDENTS

INTERIM ORDER DATED 14TH FEBRUARY 2026
======================================================
1. UPON HEARING the learned counsel for the petitioner, IT IS HEREBY ORDERED that Notice be issued to Respondent returnable within three weeks.
2. The Respondent is directed to maintain status quo regarding hypothecated commercial properties until the next date of hearing.
3. Matter listed for next hearing on 14th August 2026.

DATED THIS 14TH DAY OF FEBRUARY 2026.
[DIGITALLY SIGNED & VERIFIED BY REGISTRAR]`
    },
    {
      id: 'ord_2',
      caseNo: 'CIV.SUIT 104/2025',
      title: 'Ramesh Patel vs. Municipal Corporation of Greater Mumbai',
      date: '10th May 2026',
      judge: 'Hon\'ble Justice Sunita Rao',
      orderType: 'Summons Directions & Extension Order',
      fileSize: '890 KB',
      content: `IN THE COURT OF DISTRICT CIVIL JUDGE, BOMBAY
CIVIL SUIT NO. 104 OF 2025

Ramesh Patel                                 ... PLAINTIFF
VERSUS
Municipal Corporation of Greater Mumbai       ... DEFENDANT

DIRECTIONS ORDER DATED 10TH MAY 2026
======================================================
1. Time to file Written Statement by Defendant is extended by 30 days under Order VIII Rule 1 CPC.
2. Plaintiff permitted to place additional survey maps on record.

DATED THIS 10TH DAY OF MAY 2026.
[DIGITALLY SIGNED & VERIFIED BY REGISTRAR]`
    }
  ]);

  const handleDownload = (ord: any) => {
    const blob = new Blob([ord.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certified_Court_Order_${ord.caseNo.replace(/\s+/g, '_')}.txt`;
    a.click();
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="border-b border-white/15 pb-4">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-2">
          <Download className="w-6 h-6 text-[#C9A24B]" />
          Download Certified Orders & Judgments
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-1">
          Search, View, and Download Digitally Signed Certified Copies of High Court & District Court Decrees
        </p>
      </div>

      {/* Orders List */}
      <div className="bg-[#132240] border border-white/15 rounded-xl p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#C9A24B]" />
          Available Certified Orders for Verification & Download
        </h2>

        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="p-4 bg-white/5 border border-white/15 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{ord.orderType}</span>
                  <h3 className="text-base font-serif font-bold text-[#C9A24B]">{ord.caseNo} — {ord.title}</h3>
                  <p className="text-xs text-slate-300">Presiding Officer: {ord.judge} | Order Date: {ord.date}</p>
                </div>

                <button
                  onClick={() => handleDownload(ord)}
                  className="px-4 py-2 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4 text-[#1B2C4F]" />
                  <span>Download Certified Order ({ord.fileSize})</span>
                </button>
              </div>

              {/* Document Preview Box */}
              <div className="p-3 bg-[#0F1B33] border border-white/10 rounded-lg text-xs font-mono text-slate-200 leading-relaxed max-h-36 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-mono">{ord.content}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DownloadOrdersPage;
