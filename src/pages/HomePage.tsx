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
            <div className="w-9 h-9 rounded-md theme-primary-btn flex items-center justify-center shadow-md shrink-0">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold font-serif tracking-tight theme-heading block leading-none">
                LEXORA <span className="opacity-80">AI</span>
              </span>
              <span className="text-[10px] theme-subtext tracking-wider uppercase font-mono block mt-1">
                Judicial Intelligence Platform
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Light / Dark Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-subtle theme-card hover:opacity-80 transition-all cursor-pointer text-xs font-mono font-medium shadow-xs"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>☀ Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span>☾ Dark</span>
                </>
              )}
            </button>

            {/* Sign In / Access Workspace */}
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 theme-primary-btn text-xs rounded-md shadow-xs cursor-pointer flex items-center gap-1.5 font-medium"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In / Access Workspace</span>
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
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-500/10 border border-slate-400/20 text-xs font-mono font-medium tracking-wide">
              <Shield className="w-4 h-4 text-slate-500" />
              <span>Human-in-the-Loop Judicial Decision Support System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-extrabold theme-heading tracking-tight leading-tight">
              LEXORA Judicial Workstation
            </h1>

            <p className="text-base sm:text-lg theme-subtext max-w-2xl mx-auto leading-relaxed">
              Institutional AI decision support for Judges, Lawyers, Court Staff, and Citizens. Grounded in authoritative Indian legal precedent with verifiable citation trails.
            </p>

            <div className="pt-2">
              <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 theme-primary-btn text-sm rounded-md transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                <span>Access Workstation</span>
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
                    <div className="w-10 h-10 rounded-lg bg-[var(--primary-accent)]/10 border border-[var(--primary-accent)]/30 flex items-center justify-center mb-4 text-[var(--primary-accent)]">
                      <role.icon className="w-5 h-5 text-[var(--primary-accent)]" />
                    </div>
                    <h3 className="text-base font-bold font-serif theme-heading mb-2">{role.title}</h3>
                    <p className="text-xs theme-subtext leading-relaxed mb-4">{role.desc}</p>
                  </div>
                  <div className="flex items-center text-xs text-[var(--primary-accent)] font-bold group-hover:translate-x-1 transition-transform">
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
                  <feat.icon className="w-5 h-5 text-[var(--primary-accent)] mb-2" />
                  <h4 className="text-sm font-serif font-bold theme-heading">{feat.title}</h4>
                  <p className="text-xs theme-subtext leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-4 theme-header border-t border-subtle mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 text-xs theme-subtext">
          <div className="flex items-center gap-2 font-serif font-bold theme-heading">
            <Scale className="w-4 h-4 text-[var(--primary-accent)]" />
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
