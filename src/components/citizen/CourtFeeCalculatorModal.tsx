import React, { useState } from 'react';
import { Calculator, X, DollarSign, CheckCircle } from 'lucide-react';

interface CourtFeeCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CourtFeeCalculatorModal: React.FC<CourtFeeCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [suitType, setSuitType] = useState('Civil Money Suit');
  const [valuation, setValuation] = useState('500000');
  const [courtType, setCourtType] = useState('District Civil Court');
  const [feeDetails, setFeeDetails] = useState<any>(null);

  if (!isOpen) return null;

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valuation || '0');

    let baseFee = 500;
    if (suitType === 'Civil Money Suit') {
      baseFee = Math.max(1000, val * 0.025);
    } else if (suitType === 'Property Suit') {
      baseFee = Math.max(1500, val * 0.03);
    } else if (suitType === 'Writ Petition') {
      baseFee = 500;
    } else {
      baseFee = 250;
    }

    const stampDuty = 50; // Advocate Welfare Stamp
    const processFee = 100; // Summons Process Fee
    const totalFee = baseFee + stampDuty + processFee;

    setFeeDetails({
      baseFee,
      stampDuty,
      processFee,
      totalFee
    });
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#132240] border border-white/20 rounded-2xl w-full max-w-xl text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
          <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#C9A24B]" />
            Court Fee & Advocate Welfare Stamp Calculator
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <form onSubmit={handleCalculate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Court Forum:</label>
                <select
                  value={courtType}
                  onChange={(e) => setCourtType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-white"
                >
                  <option value="District Civil Court">District Civil Court</option>
                  <option value="High Court Bench">High Court Bench</option>
                  <option value="Family Court">Family Court</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Suit Category:</label>
                <select
                  value={suitType}
                  onChange={(e) => setSuitType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F1B33] border border-white/20 rounded-lg text-white"
                >
                  <option value="Civil Money Suit">Civil Money Suit</option>
                  <option value="Property Suit">Property Suit</option>
                  <option value="Writ Petition">Writ Petition (Art 226)</option>
                  <option value="Matrimonial Petition">Matrimonial / Divorce</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Suit Valuation / Claim Amount (₹):</label>
              <input
                type="number"
                required
                value={valuation}
                onChange={(e) => setValuation(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            <button type="submit" className="w-full py-2.5 bg-[#C9A24B] hover:bg-[#D9B35C] text-[#1B2C4F] font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer">
              <Calculator className="w-4 h-4" />
              <span>Calculate Ad-Valorem Court Fees</span>
            </button>
          </form>

          {feeDetails && (
            <div className="p-4 bg-white/5 border border-white/15 rounded-xl space-y-3 pt-3">
              <h3 className="font-serif font-bold text-[#C9A24B] text-sm flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Fee Breakdown Summary:
              </h3>

              <div className="space-y-1.5 text-slate-200">
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>Ad-Valorem Court Fee:</span>
                  <span className="font-mono font-bold text-white">₹{feeDetails.baseFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>Advocate Welfare Stamp:</span>
                  <span className="font-mono font-bold text-white">₹{feeDetails.stampDuty}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/10">
                  <span>Process Summons Fee:</span>
                  <span className="font-mono font-bold text-white">₹{feeDetails.processFee}</span>
                </div>
                <div className="flex justify-between py-1.5 text-sm font-bold text-[#C9A24B]">
                  <span>Total Payable Filing Fee:</span>
                  <span className="font-mono">₹{feeDetails.totalFee.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
