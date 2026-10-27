import React from 'react';
import { BookOpen, Download, Moon, Sun, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  currentTab: 'today' | 'explore' | 'saved' | 'verse' | 'settings';
  onNavigate: (tab: 'today' | 'explore' | 'saved' | 'verse' | 'settings') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAiModal: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  isDark,
  onToggleTheme,
  onOpenAiModal,
  onOpenInstallModal,
}) => {
  const { isInstallable, install, isIOS, isInstalled } = usePWAInstall();

  const handleInstallClick = () => {
    if (isInstallable) {
      install();
    } else if (isIOS && onOpenInstallModal) {
      onOpenInstallModal();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-blue-100/80 dark:border-slate-800 bg-white/95 dark:bg-black/95 backdrop-blur-md transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-15 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onNavigate('today')}
          className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg p-1"
          aria-label="Daily Bible Devotion Home"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-900/50">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-base md:text-lg tracking-tight whitespace-nowrap">
            Daily Bible Devotion
          </span>
        </button>

        {/* Zone 2: Navigation Links (Desktop) - In English */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onNavigate('today')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'today'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onNavigate('explore')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'explore'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Library
          </button>
          <button
            onClick={() => onNavigate('saved')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'saved'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Saved
          </button>
          <button
            onClick={() => onNavigate('verse')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'verse'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Daily Verse
          </button>
          <button
            onClick={() => onNavigate('settings')}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              currentTab === 'settings'
                ? 'text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: Actions - English labels and White & Blue / Blue & Black theme */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Generator quick button */}
          <button
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            title="Create devotion on a custom topic"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Topic</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-blue-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* In-app Install Trigger (visible when installable or iOS) */}
          {!isInstalled && (isInstallable || isIOS) && (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
