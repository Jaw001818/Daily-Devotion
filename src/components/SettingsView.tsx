import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Send,
  Download,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  WifiOff,
  Type,
  Globe,
  Info,
} from 'lucide-react';
import { NotificationPreferences, TextSize, Language } from '../types/devotion';
import { sendTestPush, subscribeToWebPush, isPushSupported } from '../utils/pushManager';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsViewProps {
  notificationSettings: NotificationPreferences;
  onUpdateNotificationSettings: (settings: NotificationPreferences) => void;
  textSize: TextSize;
  onUpdateTextSize: (size: TextSize) => void;
  language: Language;
  onUpdateLanguage: (lang: Language) => void;
  onOpenInstallGuide: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  notificationSettings,
  onUpdateNotificationSettings,
  textSize,
  onUpdateTextSize,
  language,
  onUpdateLanguage,
  onOpenInstallGuide,
}) => {
  const { isInstallable, install, isInstalled, isIOS } = usePWAInstall();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message?: string; error?: boolean }>({
    loading: false,
  });

  const pushSupported = isPushSupported();

  // Toggle notification enabled
  const handleToggleNotification = async () => {
    const nextEnabled = !notificationSettings.enabled;

    if (nextEnabled) {
      setIsSubscribing(true);
      const res = await subscribeToWebPush(notificationSettings);
      setIsSubscribing(false);

      if (res.success) {
        onUpdateNotificationSettings({
          ...notificationSettings,
          enabled: true,
          hasWebPushSubscription: !res.isLocalOnly,
        });
        setTestStatus({ loading: false, message: res.message, error: false });
      } else {
        setTestStatus({ loading: false, message: res.message, error: true });
      }
    } else {
      onUpdateNotificationSettings({
        ...notificationSettings,
        enabled: false,
      });
      setTestStatus({ loading: false, message: 'Notifications turned off.', error: false });
    }
  };

  // Test Push trigger
  const handleSendTestPush = async () => {
    setTestStatus({ loading: true });
    const res = await sendTestPush();
    setTestStatus({
      loading: false,
      message: res.message,
      error: !res.success,
    });
  };

  return (
    <div className="space-y-8 pb-24 md:pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Settings & App Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage daily push notifications, app installation, and reading preferences.
        </p>
      </div>

      {/* SECTION 1: DAILY NOTIFICATIONS (WEB PUSH) */}
      <section className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-blue-100 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-900/50">
                <Bell className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Daily Push Notifications
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Receive genuine background web push notifications at your preferred time (Asia/Manila timezone).
            </p>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggleNotification}
            disabled={isSubscribing}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              notificationSettings.enabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
            }`}
            aria-label="Toggle notifications"
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                notificationSettings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Status banner */}
        {!pushSupported && (
          <div className="p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
            <div>
              <span className="font-semibold">Browser Note: </span>
              On iPhone Safari, install the app to your Home Screen first (iOS 16.4+) to enable full Web Push notifications.
            </div>
          </div>
        )}

        {notificationSettings.enabled && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {/* Preferred Time Picker */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Reminder Time (Asia/Manila):</span>
              </label>
              <input
                type="time"
                value={notificationSettings.time}
                onChange={(e) =>
                  onUpdateNotificationSettings({
                    ...notificationSettings,
                    time: e.target.value,
                  })
                }
                className="px-3 py-1.5 rounded-xl border border-blue-100 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-36"
              />
            </div>

            {/* Reminder Type Options - In English */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 block">
                Reminder Content:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'both', label: 'Both Devotion & Verse' },
                  { id: 'devotion', label: 'Devotion Only' },
                  { id: 'verse', label: 'Verse Only' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() =>
                      onUpdateNotificationSettings({
                        ...notificationSettings,
                        reminderType: type.id as 'both' | 'devotion' | 'verse',
                      })
                    }
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      notificationSettings.reminderType === type.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-900'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Send Test Push Button - In English */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={handleSendTestPush}
                disabled={testStatus.loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testStatus.loading ? 'Sending...' : 'Send Test Notification'}</span>
              </button>

              {testStatus.message && (
                <div
                  className={`text-xs flex items-center gap-1.5 ${
                    testStatus.error ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {testStatus.error ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2: PWA INSTALLATION STATUS & GUIDE */}
      <section className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-blue-100 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-900/50">
                <Smartphone className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                PWA Mobile App Installation
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Install Daily Bible Devotion to your Android or iOS device for full screen standalone viewing.
            </p>
          </div>

          {/* Installation button - In English */}
          {isInstalled ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Installed
            </span>
          ) : (
            <button
              onClick={() => {
                if (isInstallable) install();
                else onOpenInstallGuide();
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}
        </div>

        {/* Platform Guidance Info */}
        <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🤖 Android (Chrome / Edge)</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Click the <strong>"Install App"</strong> button above, or tap the three dots (⋮) menu in Chrome and choose <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🍎 iPhone / iPad (Safari)</span>
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              1. Open in Safari.<br />
              2. Tap the <strong>Share</strong> button (box with upward arrow).<br />
              3. Scroll down and tap <strong>"Add to Home Screen"</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: READING PREFERENCES (FONT SIZE & LANGUAGE) */}
      <section className="bg-white dark:bg-slate-950 rounded-3xl p-6 border border-blue-100 dark:border-slate-800 shadow-xs space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Type className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Reading Preferences</span>
        </h2>

        {/* Text Size */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white block">
              Text Size
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Adjust typography scale for optimal readability.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'normal', label: 'Normal' },
              { id: 'large', label: 'Large' },
              { id: 'xl', label: 'Extra Large' },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => onUpdateTextSize(size.id as TextSize)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  textSize === size.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50'
                }`}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Default Devotion Language</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Select Tagalog, Taglish, or English for devotional texts.
            </span>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'fil', label: 'Filipino / Tagalog' },
              { id: 'taglish', label: 'Taglish' },
              { id: 'en', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => onUpdateLanguage(lang.id as Language)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  language === lang.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: OFFLINE SUPPORT DETAILS */}
      <section className="bg-blue-50/40 dark:bg-slate-900 rounded-3xl p-6 border border-blue-100 dark:border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Offline Capabilities & Storage</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Offline Ready:</strong> The complete UI, preloaded devotions, and saved bookmarks are cached in your device storage via Service Worker precaching and IndexedDB/LocalStorage.
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <strong>Requires Internet:</strong> AI-powered devotion generation and real-time Web Push notification dispatch from the server.
        </p>
      </section>

      {/* SECTION 5: APP ABOUT */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-500 py-4 space-y-1">
        <p className="flex items-center justify-center gap-1">
          <Info className="w-3.5 h-3.5" />
          <span>Daily Bible Devotion — Version 1.0.0 (PWA)</span>
        </p>
        <p>Built with faith, truth, and love to encourage daily Scripture walk.</p>
      </footer>
    </div>
  );
};
