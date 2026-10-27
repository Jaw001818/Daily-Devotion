import React from 'react';
import { Home, Compass, Bookmark, BookMarked, Settings } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'today' | 'explore' | 'saved' | 'verse' | 'settings';
  onNavigate: (tab: 'today' | 'explore' | 'saved' | 'verse' | 'settings') => void;
  savedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate, savedCount = 0 }) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-blue-100 dark:border-slate-800 pb-safe shadow-[0_-4px_16px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_16px_rgba(0,0,0,0.4)]"
    >
      <div className="grid grid-cols-5 items-center h-14">
        {/* 1. Today */}
        <button
          onClick={() => onNavigate('today')}
          className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
            currentTab === 'today'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Today</span>
        </button>

        {/* 2. Library */}
        <button
          onClick={() => onNavigate('explore')}
          className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
            currentTab === 'explore'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Library</span>
        </button>

        {/* 3. Saved */}
        <button
          onClick={() => onNavigate('saved')}
          className={`relative flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
            currentTab === 'saved'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Saved</span>
          {savedCount > 0 && (
            <span className="absolute top-1.5 right-1/4 min-w-[15px] h-[15px] px-1 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
              {savedCount}
            </span>
          )}
        </button>

        {/* 4. Verse */}
        <button
          onClick={() => onNavigate('verse')}
          className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
            currentTab === 'verse'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookMarked className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Verse</span>
        </button>

        {/* 5. Settings */}
        <button
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center justify-center h-full cursor-pointer transition-colors ${
            currentTab === 'settings'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-0.5">Settings</span>
        </button>
      </div>
    </nav>
  );
};
