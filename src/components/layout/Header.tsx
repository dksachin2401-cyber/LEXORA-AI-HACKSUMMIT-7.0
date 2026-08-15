import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  Sun,
  Moon,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Shield,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { notifications as initialNotifications } from '@/data/mockData';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationsList, setNotificationsList] = useState(initialNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotificationsList([]);
  };

  const markSingleAsRead = (id: string) => {
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 bg-[#0F1B33] border-b border-white/15 text-white shadow-lg backdrop-blur-md">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-white/10 text-white lg:hidden cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cases, judgments, statutes, or precedent citations..."
            className="w-full pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-xs text-white placeholder-slate-400 outline-none focus:border-[#C9A24B] transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-white/10 text-amber-300 transition-colors cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-slate-200" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="p-2 rounded-lg hover:bg-white/10 text-slate-300 relative transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[#132240] border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 text-white">
                <div className="px-4 py-3 border-b border-white/15 bg-[#0F1B33] flex justify-between items-center">
                  <h3 className="text-xs font-serif font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#C9A24B]" />
                    Real-time Notifications ({unreadCount} unread)
                  </h3>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-[#C9A24B] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                    {notificationsList.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-rose-400 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notificationsList.length > 0 ? (
                    notificationsList.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markSingleAsRead(notif.id)}
                        className={`px-4 py-3 border-b border-white/10 hover:bg-white/5 text-xs space-y-1 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${!notif.read ? 'text-[#C9A24B]' : 'text-slate-300'}`}>
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No active notifications. You are all caught up!
                    </div>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#C9A24B] text-[#1B2C4F] flex items-center justify-center text-xs font-extrabold shadow">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {user && (
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-white block leading-tight">
                  {user.name.split(' ').slice(-1)[0]}
                </span>
                <span className="text-[10px] text-[#C9A24B] font-semibold uppercase block leading-tight">
                  {user.role}
                </span>
              </div>
            )}
          </button>

          <AnimatePresence>
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#132240] border border-white/20 rounded-xl shadow-2xl overflow-hidden z-50 text-white">
                {user && (
                  <div className="px-4 py-3 border-b border-white/15 bg-[#0F1B33]">
                    <p className="text-xs font-bold text-white">{user.name}</p>
                    <p className="text-[10px] text-slate-400">{user.designation}</p>
                  </div>
                )}
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-400 hover:bg-rose-500/20 font-semibold cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out / Switch Role
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Header;
