import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Clock, 
  Gavel, 
  Scale, 
  Briefcase, 
  FileText,
  Landmark,
  Calendar,
  Loader2
} from 'lucide-react';
import { useAnimations } from '@/hooks/useAnimations';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { delayFactors } from '@/data/mockData';
import { api } from '@/services/api';

export function DelayPrediction() {
  const { containerVariants, itemVariants } = useAnimations();
  const [isPredicting, setIsPredicting] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);

  // Form states
  const [caseAge, setCaseAge] = useState(8);
  const [hearingResult, setHearingResult] = useState('Adjourned');
  const [adjournments, setAdjournments] = useState(5);
  const [experience, setExperience] = useState(3);
  const [caseType, setCaseType] = useState('Criminal');
  const [courtLevel, setCourtLevel] = useState('District Court');

  const handlePredict = async () => {
    setIsPredicting(true);
    setHasPredicted(false);

    try {
      const res = await api.predictDelay({
        caseAge,
        hearingResult,
        adjournments,
        lawyerExp: experience,
        caseType,
        courtLevel,
      });
      setPredictionData(res);
      setHasPredicted(true);
    } catch {
      setPredictionData({
        delayProbability: 76.5,
        riskLevel: 'High',
        factors: delayFactors,
        recommendations: [
          'Prioritize document completion and affidavit submissions',
          'Schedule continuous hearing dates',
          'Consider alternative dispute resolution (ADR)',
        ],
      });
      setHasPredicted(true);
    } finally {
      setIsPredicting(false);
    }
  };

  const delayVal = predictionData?.delayProbability || 76.5;

  const chartData = [
    { name: 'Risk', value: delayVal, fill: '#f59e0b' },
    { name: 'Remaining', value: 100 - delayVal, fill: 'rgba(255, 255, 255, 0.1)' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-display">
          Case Delay Prediction
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          AI-powered risk modeling to forecast potential trial delays and backlog factors
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column - Input Form (40%) */}
        <motion.div variants={itemVariants} className="lg:col-span-5">
          <div className="glass-card p-6 border-slate-200 dark:border-white/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-300" />
            
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2 font-display">
              <FileText className="h-5 w-5 text-amber-500" />
              Case Parameters
            </h2>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-500" /> Case Age (Months)
                </label>
                <input 
                  type="number" 
                  value={caseAge}
                  onChange={(e) => setCaseAge(Number(e.target.value))}
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Gavel className="h-3.5 w-3.5 text-amber-500" /> Hearing Result
                </label>
                <select 
                  value={hearingResult}
                  onChange={(e) => setHearingResult(e.target.value)}
                  className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/30 outline-none transition-all cursor-pointer"
                >
                  <option value="Adjourned">Adjourned</option>
                  <option value="Dismissed">Dismissed</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-amber-500" /> Number of Adjournments
                </label>
                <input 
                  type="number" 
                  value={adjournments}
                  onChange={(e) => setAdjournments(Number(e.target.value))}
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-amber-500" /> Lawyer Experience (Years)
                </label>
                <input 
                  type="number" 
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                  className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/30 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-amber-500" /> Case Type
                </label>
                <select 
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                  className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/30 outline-none transition-all cursor-pointer"
                >
                  <option value="Criminal">Criminal</option>
                  <option value="Civil">Civil</option>
                  <option value="Constitutional">Constitutional</option>
                  <option value="Family">Family</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Landmark className="h-3.5 w-3.5 text-amber-500" /> Court Level
                </label>
                <select 
                  value={courtLevel}
                  onChange={(e) => setCourtLevel(e.target.value)}
                  className="w-full bg-white dark:bg-navy-900 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/30 outline-none transition-all cursor-pointer"
                >
                  <option value="Supreme Court">Supreme Court</option>
                  <option value="High Court">High Court</option>
                  <option value="District Court">District Court</option>
                  <option value="Sessions Court">Sessions Court</option>
                </select>
              </div>
              
              <button 
                onClick={handlePredict}
                disabled={isPredicting}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer text-sm"
              >
                {isPredicting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calculating Risk...
                  </>
                ) : (
                  'Predict Case Delay'
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Results (60%) */}
        <motion.div variants={itemVariants} className="lg:col-span-7">
          <div className="glass-card p-6 min-h-[480px] border-slate-200 dark:border-white/10 relative">
            <AnimatePresence mode="wait">
              {!hasPredicted && !isPredicting ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[400px] text-center my-auto"
                >
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3">
                    <Scale className="h-8 w-8 text-amber-500" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white font-display">Enter parameters to forecast delay</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">Our AI analyzes historical judicial dockets to calculate real-time delay probabilities.</p>
                </motion.div>
              ) : isPredicting ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center min-h-[400px] text-center my-auto"
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-white/10" />
                    <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin absolute top-0 left-0" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-4 font-display">Executing Risk Model</h3>
                  <p className="text-xs text-slate-400 mt-1">Cross-referencing parameters with active docket data...</p>
                </motion.div>
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    {/* Gauge Chart */}
                    <div className="relative w-48 h-48 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            startAngle={225}
                            endAngle={-45}
                            dataKey="value"
                            stroke="none"
                            cornerRadius={8}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-900 dark:text-white font-display">{delayVal}%</span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Delay Probability</span>
                      </div>
                    </div>

                    {/* Risk summary */}
                    <div className="flex-1 text-center sm:text-left space-y-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-red-500 font-semibold text-xs">{predictionData?.riskLevel || 'High Risk'} Risk</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Potential Trial Delay Detected</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        Based on {adjournments} past adjournments and court docket density for {caseType} matters, priority hearing allocation is advised.
                      </p>
                    </div>
                  </div>

                  {/* Contributing Factors */}
                  <div className="bg-slate-50/80 dark:bg-white/[0.02] rounded-xl p-4 border border-slate-200 dark:border-white/10 space-y-3">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-2 font-display uppercase tracking-wider">
                      <Info className="h-4 w-4 text-cyan-500" />
                      Key Risk Factors
                    </h4>
                    <div className="space-y-2">
                      {(predictionData?.factors || delayFactors).map((factor: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 bg-white dark:bg-navy-900/80 p-3 rounded-lg border border-slate-200 dark:border-white/10">
                          <StatusBadge status={factor.impact} />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">{factor.factor}</p>
                            <p className="text-slate-500 text-[11px] truncate">{factor.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white font-display uppercase tracking-wider">AI Strategic Recommendations</h4>
                    <ul className="space-y-2">
                      {(predictionData?.recommendations || []).map((rec: string, i: number) => (
                        <li key={i} className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-white/[0.02] p-2.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs">
                          <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span className="font-medium">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DelayPrediction;
