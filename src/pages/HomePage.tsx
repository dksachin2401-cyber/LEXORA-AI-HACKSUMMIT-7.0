import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Scale, 
  FileSearch, 
  BookOpen, 
  Clock, 
  BarChart3,
  Activity,
  ArrowRight,
  Shield,
  UserCheck,
  Building2,
  HelpCircle,
  ShieldCheck,
  Sun,
  Moon,
  Lock
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const HomePage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const }
    }
  };

  // Redirect to login form with pre-selected role (No direct portal bypass)
  const handleRoleLogin = (roleId: string) => {
    navigate(`/login?role=${roleId}`);
  };

  const roles = [
    { id: 'judge', title: 'Hon\'ble Judge', desc: 'Bench decisions, case summaries, draft orders & hearing scheduler', icon: Scale },
    { id: 'lawyer', title: 'Advocate / Lawyer', desc: 'Case tracking, RAG research, precedent search & draft pleadings', icon: UserCheck },
    { id: 'staff', title: 'Bench / Registry Staff', desc: 'Courtroom allocations, notice dispatch & evidence indexer', icon: Building2 },
    { id: 'citizen', title: 'Litigant Citizen', desc: 'Plain-language case guidance, multilingual support & status lookup', icon: HelpCircle },
    { id: 'admin', title: 'System Administrator', desc: 'User & role management, security policies & system-wide audit logs', icon: ShieldCheck },
  ];

  const features = [
    { title: 'OCR & NLP Extraction', desc: 'Scanned document extraction + IPC/BNS statutory entity recognition', icon: FileSearch },
    { title: 'RAG Legal Assistant', desc: 'Grounded precedent search strictly cited from vector legal corpus', icon: BookOpen },
    { title: 'AI Hearing Scheduler', desc: 'Optimized listing dates and courtroom workload balancing', icon: Clock },
    { title: 'Disposal & Analytics', desc: 'Court performance, delay probabilities, and disposal rates', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen theme-page-bg flex flex-col grid-bg transition-colors duration-200">
      {/* Header Bar */}
      <header className="w-full px-6 py-4 theme-header sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#C9A24B] flex items-center justify-center shadow-md shrink-0">
              <Scale className="w-5 h-5 text-[#1B2C4F]" />
            </div>
            <div>
              <span className="text-xl font-bold font-serif tracking-wider theme-heading block leading-none">
                LEXORA <span className="text-[#C9A24B]">AI</span>
              </span>
              <span className="text-[10px] theme-subtext tracking-widest uppercase font-sans block mt-1">
                Justice, accelerated. Judgment, preserved.
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Working Light / Dark Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white dark:bg-white/10 hover:border-[#C9A24B] transition-all cursor-pointer text-xs font-bold text-slate-800 dark:text-white shadow-sm"
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

            {/* Sign In / Login */}
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 theme-primary-btn text-xs rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In / Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        <motion.div 
          className="space-y-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold tracking-wide">
              <Shield className="w-4 h-4 text-amber-500" />
              <span>Human-in-the-Loop Judicial Decision Support</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold theme-heading tracking-tight leading-tight">
              Lexora Judicial Intelligence
            </h1>

            <p className="text-lg sm:text-xl text-[#C9A24B] font-serif italic font-medium">
              "Justice, accelerated. Judgment, preserved."
            </p>

            <p className="text-xs sm:text-sm theme-subtext max-w-2xl mx-auto leading-relaxed">
              Autonomous legal decision support for Judges, Lawyers, Court Staff, and Citizens. Every AI action is reviewable and human-verified prior to execution.
            </p>

            <div className="pt-2">
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 theme-primary-btn text-sm rounded-xl transition-all shadow-xl inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Authenticate Official Portal Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Role Selection Grid - Redirects to Login Form */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold theme-heading">Role-Based Access Portals</h2>
              <p className="text-xs sm:text-sm theme-subtext">Select your designated judicial portal to authenticate & sign in</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleLogin(role.id)}
                  className="theme-card p-6 rounded-xl cursor-pointer transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-[#C9A24B]">
                      <role.icon className="w-5 h-5 text-[#C9A24B]" />
                    </div>
                    <h3 className="text-base font-bold font-serif theme-heading mb-2">{role.title}</h3>
                    <p className="text-xs theme-subtext leading-relaxed mb-4">{role.desc}</p>
                  </div>
                  <div className="flex items-center text-xs text-[#C9A24B] font-bold group-hover:translate-x-1 transition-transform">
                    <Lock className="w-3.5 h-3.5 mr-1" />
                    <span>Authenticate & Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-serif font-bold theme-heading">AI Engine Capabilities</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feat, idx) => (
                <div key={idx} className="theme-card p-5 rounded-xl space-y-2">
                  <feat.icon className="w-5 h-5 text-[#C9A24B] mb-2" />
                  <h4 className="text-sm font-serif font-bold theme-heading">{feat.title}</h4>
                  <p className="text-xs theme-subtext leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 theme-header border-t mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-xs theme-subtext">
          <div className="flex items-center gap-2 font-serif font-bold theme-heading">
            <Scale className="w-4 h-4 text-[#C9A24B]" />
            <span>LEXORA AI — Judicial Intelligence Platform</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>FastAPI & RAG Engines Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
