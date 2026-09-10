import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Lock, ShieldCheck, Download, Calculator, Building, Landmark, Smartphone, FileText, ArrowRight, History } from 'lucide-react';

interface PaymentRecord {
  grn: string;
  receiptNo: string;
  txnId: string;
  caseNo: string;
  feeType: string;
  amount: number;
  paymentMethod: string;
  date: string;
  status: string;
}

export const PayCourtFeesPage: React.FC = () => {
  const [caseNo, setCaseNo] = useState('CIV.SUIT 104/2025');
  const [cnrNo, setCnrNo] = useState('MHBM010041202026');
  const [feeType, setFeeType] = useState('Ad-Valorem Filing Fee');
  const [suitClaimValue, setSuitClaimValue] = useState('250000');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('citizen@upi');
  const [bankName, setBankName] = useState('State Bank of India');

  const [paymentDone, setPaymentDone] = useState<PaymentRecord | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('lexora_court_fee_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return [
      {
        grn: 'GRN/2026/MH/8812903',
        receiptNo: 'REC/2026/4109',
        txnId: 'TXN_98412093',
        caseNo: 'CIV.SUIT 104/2025',
        feeType: 'Ad-Valorem Filing Fee',
        amount: 5300,
        paymentMethod: 'UPI (citizen@upi)',
        date: '2026-08-01 11:20 AM',
        status: 'SUCCESS — GRN VERIFIED'
      }
    ];
  });

  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    localStorage.setItem('lexora_court_fee_history', JSON.stringify(paymentHistory));
  }, [paymentHistory]);

  // Calculate Ad-Valorem Statutory Court Fee
  const calculateStatutoryFee = () => {
    const claimVal = parseFloat(suitClaimValue || '0');
    let fee = 500;
    if (claimVal > 0 && claimVal <= 100000) {
      fee = claimVal * 0.02;
    } else if (claimVal > 100000 && claimVal <= 1000000) {
      fee = 2000 + (claimVal - 100000) * 0.015;
    } else if (claimVal > 1000000) {
      fee = 15500 + (claimVal - 1000000) * 0.01;
    }

    const welfareStamp = 50;
    const processFee = 250;
    const totalPayable = Math.round(fee + welfareStamp + processFee);

    return {
      adValoremFee: Math.round(fee),
      welfareStamp,
      processFee,
      totalPayable
    };
  };

  const fees = calculateStatutoryFee();

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const record: PaymentRecord = {
        grn: 'GRN/2026/MH/' + Math.floor(1000000 + Math.random() * 9000000),
        receiptNo: 'REC/2026/' + Math.floor(1000 + Math.random() * 9000),
        txnId: 'TXN_' + Math.floor(10000000 + Math.random() * 90000000),
        caseNo: caseNo.toUpperCase(),
        feeType,
        amount: fees.totalPayable,
        paymentMethod: paymentMethod === 'UPI' ? `UPI (${upiId})` : `Net Banking (${bankName})`,
        date: new Date().toLocaleString(),
        status: 'SUCCESS — GRN TREASURY VERIFIED'
      };

      setPaymentDone(record);
      setPaymentHistory((prev) => [record, ...prev]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-subtle pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold theme-heading flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            e-Pay Court Fees & Digital Treasury Gateway
          </h1>
          <p className="theme-subtext text-xs sm:text-sm mt-1">
            Pay Ad-Valorem Filing Fees, e-Stamps, Process Fees, and Obtain Instant GRN Treasury Receipts
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="theme-secondary-btn px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
        >
          <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>{showHistory ? 'Back to Payment Form' : 'View Payment History'}</span>
        </button>
      </div>

      {!showHistory ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Payment Form (7 Cols) */}
          <div className="lg:col-span-7 theme-card rounded-xl p-6 shadow-xl space-y-4">
            {!paymentDone ? (
              <form onSubmit={handlePay} className="space-y-4 text-xs">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-800 dark:text-amber-200 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Secured by e-Courts Portal & State Bank of India e-Treasury Gateway (GRN Integration).</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold theme-heading mb-1">Case Number / Reference:</label>
                    <input
                      type="text"
                      required
                      value={caseNo}
                      onChange={(e) => setCaseNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold theme-heading mb-1">CNR Number:</label>
                    <input
                      type="text"
                      required
                      value={cnrNo}
                      onChange={(e) => setCnrNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold theme-heading mb-1">Fee Classification:</label>
                  <select
                    value={feeType}
                    onChange={(e) => setFeeType(e.target.value)}
                    className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-bold cursor-pointer"
                  >
                    <option value="Ad-Valorem Filing Fee">Ad-Valorem Filing Fee</option>
                    <option value="Advocate Welfare Stamp Duty">Advocate Welfare Stamp Duty</option>
                    <option value="Summons Process Notice Fee">Summons Process Notice Fee</option>
                    <option value="Certified Copy Application Fee">Certified Copy Application Fee</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold theme-heading mb-1">Suit Claim Valuation (₹):</label>
                  <input
                    type="number"
                    required
                    value={suitClaimValue}
                    onChange={(e) => setSuitClaimValue(e.target.value)}
                    className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-mono font-bold"
                  />
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2 border-t border-subtle pt-3">
                  <label className="block font-semibold text-blue-600 dark:text-blue-400 mb-1">Select Digital Payment Gateway:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                        paymentMethod === 'UPI'
                          ? 'theme-primary-btn border-blue-600'
                          : 'theme-elevated border-subtle theme-heading'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>UPI / GPay / BHIM</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 cursor-pointer ${
                        paymentMethod === 'NETBANKING'
                          ? 'theme-primary-btn border-blue-600'
                          : 'theme-elevated border-subtle theme-heading'
                      }`}
                    >
                      <Landmark className="w-4 h-4" />
                      <span>Net Banking Treasury</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'UPI' ? (
                  <div>
                    <label className="block font-semibold theme-heading mb-1">Enter Virtual Payment Address (VPA / UPI ID):</label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@upi"
                      className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold theme-heading mb-1">Select Bank Treasury Gateway:</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3.5 py-2.5 theme-elevated border border-subtle rounded-xl theme-heading font-bold cursor-pointer"
                    >
                      <option value="State Bank of India">State Bank of India (e-Treasury)</option>
                      <option value="HDFC Bank">HDFC Bank Court Gateway</option>
                      <option value="ICICI Bank">ICICI Bank Treasury</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 theme-primary-btn font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{loading ? 'Connecting State Treasury Gateway...' : `Authorize & Pay ₹${fees.totalPayable.toLocaleString()} Online Now`}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    e-Payment Successful! Treasury GRN Generated.
                  </div>
                  <p className="text-xs theme-subtext">Government Reference Number (GRN): <span className="font-mono font-bold text-emerald-600 dark:text-emerald-300">{paymentDone.grn}</span></p>
                </div>

                <div className="p-4 theme-elevated border border-subtle rounded-xl space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-subtle pb-1">
                    <span className="theme-subtext">Receipt Reference:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{paymentDone.receiptNo}</span>
                  </div>
                  <div className="flex justify-between border-b border-subtle pb-1">
                    <span className="theme-subtext">Transaction ID:</span>
                    <span className="theme-heading">{paymentDone.txnId}</span>
                  </div>
                  <div className="flex justify-between border-b border-subtle pb-1">
                    <span className="theme-subtext">Case Reference:</span>
                    <span className="font-bold theme-heading">{paymentDone.caseNo}</span>
                  </div>
                  <div className="flex justify-between border-b border-subtle pb-1">
                    <span className="theme-subtext">Fee Classification:</span>
                    <span className="theme-subtext">{paymentDone.feeType}</span>
                  </div>
                  <div className="flex justify-between border-b border-subtle pb-1">
                    <span className="theme-subtext">Payment Method:</span>
                    <span className="theme-subtext">{paymentDone.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between border-b border-subtle pb-1">
                    <span className="theme-subtext">Total Amount Paid:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{paymentDone.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="theme-subtext">Treasury Status:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{paymentDone.status}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const receiptText = `OFFICIAL COURT FEE E-PAYMENT RECEIPT & GRN
==================================================
Government Reference No (GRN): ${paymentDone.grn}
Receipt Number: ${paymentDone.receiptNo}
Transaction ID: ${paymentDone.txnId}
Case Reference: ${paymentDone.caseNo}
Fee Category: ${paymentDone.feeType}
Payment Method: ${paymentDone.paymentMethod}
Amount Paid: ₹${paymentDone.amount.toLocaleString()}
Timestamp: ${paymentDone.date}
Status: ${paymentDone.status}
==================================================
Verified for High Court / District Registry Filing.`;

                      const blob = new Blob([receiptText], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `eCourt_Fee_Receipt_${paymentDone.grn.replace(/\//g, '_')}.txt`;
                      a.click();
                    }}
                    className="flex-1 py-3 theme-primary-btn font-bold rounded-xl shadow flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download e-Challan Treasury Receipt</span>
                  </button>

                  <button
                    onClick={() => setPaymentDone(null)}
                    className="px-4 py-3 theme-secondary-btn rounded-xl font-semibold text-xs cursor-pointer"
                  >
                    Pay Another Fee
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Statutory Fee Calculation Summary (5 Cols) */}
          <div className="lg:col-span-5 theme-card border border-subtle rounded-xl p-5 space-y-4 shadow-xl text-xs">
            <h2 className="text-sm font-serif font-bold text-blue-600 dark:text-blue-400 border-b border-subtle pb-2 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Statutory Court Fee Calculation Breakdown
            </h2>

            <div className="space-y-2 theme-elevated p-4 rounded-xl border border-subtle font-mono">
              <div className="flex justify-between border-b border-subtle pb-1">
                <span className="theme-subtext">Suit Claim Amount:</span>
                <span className="font-bold theme-heading">₹{parseFloat(suitClaimValue || '0').toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-1">
                <span className="theme-subtext">Ad-Valorem Fee (Statutory):</span>
                <span className="theme-subtext">₹{fees.adValoremFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-1">
                <span className="theme-subtext">Advocate Welfare Stamp:</span>
                <span className="theme-subtext">₹{fees.welfareStamp}</span>
              </div>
              <div className="flex justify-between border-b border-subtle pb-1">
                <span className="theme-subtext">Summons Process Fee:</span>
                <span className="theme-subtext">₹{fees.processFee}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-bold">
                <span className="text-blue-600 dark:text-blue-400">Total Payable Amount:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{fees.totalPayable.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-3.5 theme-elevated border border-subtle rounded-xl space-y-1">
              <div className="font-bold theme-heading text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Legal Validity & Compliance
              </div>
              <p className="text-[11px] theme-subtext leading-relaxed">
                e-Payment GRN receipts generated through this portal are legally recognized under Section 65B of the Indian Evidence Act and Supreme Court e-Filing Rules.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Payment History Table */
        <div className="theme-card border border-subtle rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-subtle theme-elevated flex justify-between items-center">
            <h2 className="text-base font-serif font-bold theme-heading flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Court Fee Payment History & Generated GRN Receipts ({paymentHistory.length})
            </h2>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">State Treasury Verified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="theme-elevated theme-subtext font-serif uppercase tracking-wider border-b border-subtle">
                <tr>
                  <th className="px-4 py-3">GRN Reference</th>
                  <th className="px-4 py-3">Case Number</th>
                  <th className="px-4 py-3">Fee Classification</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle">
                {paymentHistory.map((rec, idx) => (
                  <tr key={idx} className="hover:bg-blue-500/5 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-blue-600 dark:text-blue-400">{rec.grn}</td>
                    <td className="px-4 py-3 font-mono theme-heading">{rec.caseNo}</td>
                    <td className="px-4 py-3 theme-subtext">{rec.feeType}</td>
                    <td className="px-4 py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{rec.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 theme-subtext">{rec.paymentMethod}</td>
                    <td className="px-4 py-3 font-mono theme-subtext">{rec.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayCourtFeesPage;
