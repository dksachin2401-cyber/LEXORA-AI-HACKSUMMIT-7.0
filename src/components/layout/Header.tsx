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
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-4 sm:px-6 theme-header shadow-xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded hover:opacity-80 lg:hidden cursor-pointer"
          title="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search case files, judgments, statutes, or precedent citations..."
            className="w-full pl-9 pr-4 py-1.5 bg-surface border border-subtle rounded-sm text-xs outline-none transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 ml-4">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-[#D9DEE4] dark:border-[#2B3742] bg-white dark:bg-[#151E27] text-xs font-mono font-medium hover:opacity-80 transition-colors cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>☀ Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-slate-700" />
              <span>☾ Dark</span>
            </>
          )}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="p-1.5 rounded hover:opacity-80 relative transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 theme-primary-btn text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-1.5 w-80 sm:w-96 theme-card shadow-md overflow-hidden z-50">
                <div className="px-3.5 py-2.5 border-b border-subtle theme-elevated flex justify-between items-center">
                  <h3 className="text-xs font-semibold flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[var(--primary-accent)]" />
                    Notifications ({unreadCount} unread)
                  </h3>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                    {notificationsList.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y border-subtle">
                  {notificationsList.length > 0 ? (
                    notificationsList.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markSingleAsRead(notif.id)}
                        className={`px-3.5 py-2.5 hover:opacity-90 text-xs space-y-0.5 cursor-pointer transition-colors ${
                          !notif.read ? 'theme-elevated' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{notif.title}</span>
                          <span className="text-[10px] font-mono opacity-60">{notif.time}</span>
                        </div>
                        <p className="text-[11px] leading-snug theme-subtext">{notif.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 text-center text-xs theme-subtext">
                      No active notifications.
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
            className="flex items-center gap-2 p-1 rounded hover:opacity-80 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-sm theme-primary-btn text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {user && (
              <div className="text-left hidden md:block leading-tight">
                <span className="text-xs font-semibold block">
                  {user.name.split(' ').slice(-1)[0]}
                </span>
                <span className="text-[10px] font-mono uppercase block font-semibold opacity-80">
                  {user.role}
                </span>
              </div>
            )}
          </button>

          <AnimatePresence>
            {showProfile && (
              <div className="absolute right-0 top-full mt-1.5 w-56 theme-card shadow-md overflow-hidden z-50">
                {user && (
                  <div className="px-3.5 py-2.5 border-b border-subtle theme-elevated">
                    <p className="text-xs font-semibold">{user.name}</p>
                    <p className="text-[10px] theme-subtext">{user.designation}</p>
                  </div>
                )}
                <div className="py-1 text-xs">
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
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
