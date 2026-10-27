import React, { useState } from 'react';
import { Download, X, Smartphone, ArrowUpRight, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  forceShowIOSGuide?: boolean;
  onCloseIOSGuide?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  forceShowIOSGuide = false,
  onCloseIOSGuide,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const isModalOpen = forceShowIOSGuide || showIOSModal;

  const handleCloseModal = () => {
    setShowIOSModal(false);
    if (onCloseIOSGuide) onCloseIOSGuide();
  };

  // If already installed, hide banner completely
  if (isInstalled) return null;

  return (
    <>
      {/* Non-intrusive Top Banner with Blue Theme */}
      {!dismissed && (isInstallable || isIOS) && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm no-print">
          <div className="flex items-center gap-2 overflow-hidden">
            <Smartphone className="w-4 h-4 shrink-0 text-blue-200" />
            <span className="truncate">
              Install <strong>Daily Bible Devotion</strong> for full offline access and scheduled push reminders!
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isInstallable && (
              <button
                onClick={install}
                className="px-3 py-1 bg-white text-blue-900 rounded-lg font-bold text-xs hover:bg-blue-50 transition shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {isIOS && (
              <button
                onClick={() => setShowIOSModal(true)}
                className="px-3 py-1 bg-blue-800/80 hover:bg-blue-900 text-white rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1"
              >
                <span>How to Install</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss banner"
              className="p-1 text-white/80 hover:text-white rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* iOS Installation Modal Guide */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-950 p-6 shadow-2xl border border-blue-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Install on iPhone / iPad</span>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Safari on iOS allows direct Home Screen installation in 3 quick steps:
            </p>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  In Safari, tap the <strong>Share button</strong> (the square box with upward arrow).
                </span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Scroll down the share sheet and tap <strong>"Add to Home Screen"</strong>.
                </span>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  Tap <strong>"Add"</strong> in the top right corner. The app icon will appear on your Home Screen!
                </span>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Understood</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
