import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Gavel, Briefcase, Shield, Mail, Lock, Building2, HelpCircle, ArrowRight, Sun, Moon, AlertCircle, CheckCircle2, FileBadge } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { CaptchaChallenge } from '@/components/common/CaptchaChallenge';
import { PasswordStrengthMeter } from '@/components/common/PasswordStrengthMeter';
import { isPasswordStrong } from '@/lib/validation';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRoleParam = (searchParams.get('role') || 'judge') as 'judge' | 'lawyer' | 'staff' | 'citizen' | 'admin';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState<'judge' | 'lawyer' | 'staff' | 'citizen' | 'admin'>(initialRoleParam);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'judge' | 'lawyer' | 'staff' | 'citizen'>('judge');
  const [regDesignation, setRegDesignation] = useState('');
  const [regCourt, setRegCourt] = useState('');
  const [regOfficialId, setRegOfficialId] = useState('');
  const [regCaptchaVerified, setRegCaptchaVerified] = useState(false);
  const [regStatusMsg, setRegStatusMsg] = useState<{ type: 'success' | 'pending' | 'error'; msg: string } | null>(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Populate seed credentials into form when role card is picked
  const handleRoleQuickSelect = (role: 'judge' | 'lawyer' | 'staff' | 'citizen' | 'admin') => {
    setLoginRole(role);
    if (role === 'judge') {
      setLoginEmail('judge@lexora.gov.in');
      setLoginPassword('lexora123');
    } else if (role === 'lawyer') {
      setLoginEmail('lawyer@lexora.gov.in');
      setLoginPassword('lexora123');
    } else if (role === 'staff') {
      setLoginEmail('staff@lexora.gov.in');
      setLoginPassword('lexora123');
    } else if (role === 'citizen') {
      setLoginEmail('citizen@lexora.gov.in');
      setLoginPassword('lexora123');
    } else {
      setLoginEmail('admin@lexora.gov.in');
      setLoginPassword('lexora123');
    }
  };

  useEffect(() => {
    handleRoleQuickSelect(initialRoleParam);
  }, [initialRoleParam]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!captchaVerified) {
      setLoginError('Please complete the security CAPTCHA verification math challenge.');
      return;
    }

    setLoading(true);
    try {
      await login(loginRole === 'staff' ? 'court_staff' : loginRole, loginEmail, loginPassword);
      navigate(`/${loginRole}/dashboard`);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Account pending verification by National Judicial Administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegStatusMsg(null);

    if (!regCaptchaVerified) {
      setRegStatusMsg({ type: 'error', msg: 'Please complete the security CAPTCHA math challenge.' });
      return;
    }

    if (!regEmail.includes('@')) {
      setRegStatusMsg({ type: 'error', msg: 'Please enter a valid official email address.' });
      return;
    }

    if (!isPasswordStrong(regPassword)) {
      setRegStatusMsg({
        type: 'error',
        msg: 'Password does not meet required strength criteria (8+ characters, uppercase letter, number, and special symbol).'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          role: regRole,
          designation: regDesignation || `${regRole.toUpperCase()} Officer`,
          court: regCourt || 'High Court of Judicature',
          officialId: regOfficialId || 'N/A'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');

      if (data.pending) {
        setRegStatusMsg({
          type: 'pending',
          msg: `Registration submitted! Account credentials (ID: ${regOfficialId || 'N/A'}) are pending verification by the National Judicial Administrator. Access is blocked until approval.`
        });
      } else {
        setRegStatusMsg({
          type: 'success',
          msg: 'Account created and verified! You may now sign in.'
        });
      }
    } catch (err: any) {
      setRegStatusMsg({ type: 'error', msg: err.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center theme-page-bg p-4 grid-bg transition-colors duration-200 relative">
      {/* Top Right Theme Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-white/20 theme-card hover:border-[#C9A24B] transition-all cursor-pointer text-xs font-bold text-slate-800 dark:text-white shadow-sm"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#1B2C4F]" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-xl my-8"
      >
        <div className="theme-card p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center gap-3">
              <div className="p-2.5 bg-[#C9A24B] rounded-xl shadow-md">
                <Scale className="w-8 h-8 text-[#1B2C4F]" />
              </div>
              <h1 className="text-3xl font-extrabold font-serif theme-heading tracking-tight">LEXORA <span className="text-[#C9A24B]">AI</span></h1>
            </div>
            <p className="text-xs text-[#C9A24B] font-serif italic font-semibold">
              "Justice, accelerated. Judgment, preserved."
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#0F1B33] p-1 rounded-xl border border-white/15">
            <button
              onClick={() => { setActiveTab('login'); setLoginError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login' ? 'bg-[#C9A24B] text-[#1B2C4F] shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Official Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setRegStatusMsg(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register' ? 'bg-[#C9A24B] text-[#1B2C4F] shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Register Official Account
            </button>
          </div>

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Quick Select Role Cards */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-[#C9A24B] uppercase tracking-wider text-center">
                  Select Role Credentials:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'judge', label: 'Hon\'ble Judge', icon: Gavel },
                    { id: 'lawyer', label: 'Advocate', icon: Briefcase },
                    { id: 'staff', label: 'Court Staff', icon: Building2 },
                    { id: 'citizen', label: 'Litigant Citizen', icon: HelpCircle },
                    { id: 'admin', label: 'Admin', icon: Shield },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleQuickSelect(r.id as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                        loginRole === r.id
                          ? 'border-[#C9A24B] bg-[#C9A24B]/15 text-slate-900 dark:text-white font-bold'
                          : 'border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      <r.icon className="w-4 h-4 mb-1 text-[#C9A24B]" />
                      <span className="text-[11px] font-serif">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Official Credentials Email:</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. judge@lexora.gov.in"
                      className="w-full pl-10 pr-4 py-2.5 theme-card text-xs outline-none focus:border-[#C9A24B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Password:</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 theme-card text-xs outline-none focus:border-[#C9A24B]"
                    />
                  </div>
                </div>

                {/* Security CAPTCHA Challenge */}
                <CaptchaChallenge onVerify={setCaptchaVerified} />

                {loginError && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full theme-primary-btn text-xs font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{loading ? 'Authenticating Official Credentials...' : 'Sign In to Presiding Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* REGISTRATION FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-200">
                <strong>Official Registration Rule:</strong> Judicial Officers, Advocates, and Court Staff registrations require manual verification by the National Judicial Administrator before portal entry is authorized.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Full Legal Name:</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Adv. Rajesh Deshmukh"
                    className="w-full px-3 py-2 theme-card text-xs outline-none focus:border-[#C9A24B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Official Email Address:</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. rajesh@judiciary.gov.in"
                    className="w-full px-3 py-2 theme-card text-xs outline-none focus:border-[#C9A24B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Judicial Designation Role:</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as any)}
                    className="w-full px-3 py-2 theme-card text-xs outline-none focus:border-[#C9A24B]"
                  >
                    <option value="judge">Hon'ble Judge</option>
                    <option value="lawyer">Advocate / Lawyer</option>
                    <option value="staff">Court Bench Registrar / Staff</option>
                    <option value="citizen">Litigant Citizen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Bar / Judicial ID Number:</label>
                  <input
                    type="text"
                    required
                    value={regOfficialId}
                    onChange={(e) => setRegOfficialId(e.target.value)}
                    placeholder="e.g. BAR/2024/9912 or JUD/1042"
                    className="w-full px-3 py-2 theme-card text-xs outline-none focus:border-[#C9A24B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Designation Title:</label>
                  <input
                    type="text"
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                    placeholder="e.g. Senior Bench Advocate"
                    className="w-full px-3 py-2 theme-card text-xs outline-none focus:border-[#C9A24B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold theme-subtext mb-1">Court / Bar Association:</label>
                  <input
                    type="text"
                    value={regCourt}
                    onChange={(e) => setRegCourt(e.target.value)}
                    placeholder="e.g. High Court of Judicature"
                    className="w-full px-3 py-2 theme-card text-xs outline-none focus:border-[#C9A24B]"
                  />
                </div>
              </div>

              {/* Password with Real-Time Strength Meter */}
              <div>
                <label className="block text-xs font-semibold theme-subtext mb-1">Secure Password:</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="At least 8 characters, uppercase, number & symbol"
                  className="w-full px-3 py-2 theme-card text-xs outline-none focus:border-[#C9A24B]"
                />
                <PasswordStrengthMeter password={regPassword} />
              </div>

              {/* CAPTCHA Challenge */}
              <CaptchaChallenge onVerify={setRegCaptchaVerified} />

              {regStatusMsg && (
                <div className={`p-3.5 rounded-xl text-xs border flex items-start gap-2 ${
                  regStatusMsg.type === 'pending'
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : regStatusMsg.type === 'success'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {regStatusMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  )}
                  <span>{regStatusMsg.msg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full theme-primary-btn text-xs font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FileBadge className="w-4 h-4" />
                <span>{loading ? 'Submitting Registration...' : 'Submit Official Account Registration'}</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
