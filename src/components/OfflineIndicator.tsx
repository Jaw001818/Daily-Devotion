import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-auto z-50 flex items-center gap-2 rounded-xl bg-blue-600/95 dark:bg-blue-700/95 px-4 py-2.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-all"
    >
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
      <span>Offline Mode — Cached devotions are ready to read.</span>
    </div>
  );
};
