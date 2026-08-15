import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ChevronLeft, ChevronRight, LogOut, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { getNavItems } from '@/data/navigation';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = getNavItems(user?.role || 'judge');

  const handleLogout = () => {
    logout();
    navigate('/');
    onMobileClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed left-0 top-0 h-screen flex flex-col border-r border-white/15 bg-[#0F1B33] text-white z-40 transition-all duration-300 shadow-2xl',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-white/15 shrink-0 bg-[#0A1428]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#C9A24B] flex items-center justify-center text-[#1B2C4F] font-bold shrink-0 shadow-md">
              <Scale className="w-5 h-5 text-[#1B2C4F]" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="min-w-0">
                <span className="text-base font-bold font-serif text-white tracking-wide block leading-none">
                  LEXORA <span className="text-[#C9A24B]">AI</span>
                </span>
                <span className="text-[9px] text-amber-200/80 font-sans tracking-widest uppercase block mt-1">
                  Judicial Intelligence
                </span>
              </div>
            )}
          </div>
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1.5 scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-[#C9A24B] text-[#1B2C4F] font-extrabold shadow-lg'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  collapsed && !mobileOpen && 'justify-center px-2'
                )
              }
              title={collapsed && !mobileOpen ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {(!collapsed || mobileOpen) && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {(!collapsed || mobileOpen) && item.badge && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-white/15 shrink-0 bg-[#0A1428]">
          {(!collapsed || mobileOpen) && user && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/10 border border-white/15 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#C9A24B] text-[#1B2C4F] flex items-center justify-center text-xs font-extrabold shrink-0 shadow">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-[#C9A24B] font-semibold capitalize truncate">{user.role}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 w-full transition-colors',
              collapsed && !mobileOpen && 'justify-center px-2'
            )}
            title={collapsed && !mobileOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!collapsed || mobileOpen) && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#C9A24B] text-[#1B2C4F] border border-white/30 items-center justify-center hover:bg-[#D9B35C] transition-colors shadow-lg z-50 cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>
    </>
  );
}

export default Sidebar;
