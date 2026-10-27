import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Bookmark,
  RefreshCw,
  Search,
  BookMarked,
  Clock,
  Compass,
} from 'lucide-react';
import { Devotion, DailyVerse, Language, TextSize, NotificationPreferences, Category } from './types/devotion';
import { INITIAL_DEVOTIONS } from './data/devotions';
import { DAILY_VERSES } from './data/dailyVerses';
import {
  getFeaturedDevotionForToday,
  getDailyVerseForToday,
  formatManilaDateLong,
} from './utils/dateUtils';
import {
  getSavedDevotionIds,
  saveDevotion,
  removeSavedDevotion,
  getSavedVerses,
  saveVerse,
  removeSavedVerse,
  recordRead,
  getNotificationSettings,
  saveNotificationSettings,
  getTextSizePreference,
  saveTextSizePreference,
  getLanguagePreference,
  saveLanguagePreference,
  getCustomDevotions,
  saveCustomDevotion,
} from './utils/storage';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DevotionCard } from './components/DevotionCard';
import { DevotionDetail } from './components/DevotionDetail';
import { DailyVerseCard } from './components/DailyVerseCard';
import { ExploreView } from './components/ExploreView';
import { SavedView } from './components/SavedView';
import { SettingsView } from './components/SettingsView';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { GenerateDevotionModal } from './components/GenerateDevotionModal';
import { OfflineIndicator } from './components/OfflineIndicator';

type Tab = 'today' | 'explore' | 'saved' | 'verse' | 'settings';

export default function App() {
  // --- STATE ---
  const [currentTab, setCurrentTab] = useState<Tab>('today');
  const [activeDevotion, setActiveDevotion] = useState<Devotion | null>(null);

  // Theme (Light: White & Blue, Dark: Blue & Black)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('bible_app_theme');
      if (savedTheme) return savedTheme === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Language & Text size
  const [language, setLanguage] = useState<Language>(getLanguagePreference);
  const [textSize, setTextSize] = useState<TextSize>(getTextSizePreference);

  // Persistence
  const [savedDevotionIds, setSavedDevotionIds] = useState<string[]>(getSavedDevotionIds);
  const [savedVersesList, setSavedVersesList] = useState<DailyVerse[]>(getSavedVerses);
  const [notificationSettings, setNotificationSettings] = useState<NotificationPreferences>(
    getNotificationSettings
  );

  // Devotions pool (Initial + any custom AI generated)
  const [allDevotions, setAllDevotions] = useState<Devotion[]>(() => {
    const custom = getCustomDevotions();
    return [...custom, ...INITIAL_DEVOTIONS];
  });

  // Today's featured devotion (with discovery override if requested)
  const [featuredOverrideId, setFeaturedOverrideId] = useState<string | null>(null);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);

  // Category filter on Home
  const [homeCategory, setHomeCategory] = useState<'All' | Category>('All');
  const [homeSearch, setHomeSearch] = useState('');

  // Sync dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('bible_app_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('bible_app_theme', 'light');
    }
  }, [isDark]);

  // Derived today's content
  const todayDevotion = useMemo(() => {
    return getFeaturedDevotionForToday(allDevotions, featuredOverrideId);
  }, [allDevotions, featuredOverrideId]);

  const todayVerse = useMemo(() => {
    return getDailyVerseForToday(DAILY_VERSES);
  }, []);

  // Save / Bookmark handlers
  const handleToggleSaveDevotion = (e?: React.MouseEvent, id?: string) => {
    if (e) e.stopPropagation();
    const targetId = id || activeDevotion?.id;
    if (!targetId) return;

    if (savedDevotionIds.includes(targetId)) {
      removeSavedDevotion(targetId);
      setSavedDevotionIds((prev) => prev.filter((i) => i !== targetId));
    } else {
      saveDevotion(targetId);
      setSavedDevotionIds((prev) => [targetId, ...prev]);
    }
  };

  const handleToggleSaveVerse = (verse: DailyVerse) => {
    const isSaved = savedVersesList.some((v) => v.id === verse.id);
    if (isSaved) {
      removeSavedVerse(verse.id);
      setSavedVersesList((prev) => prev.filter((v) => v.id !== verse.id));
    } else {
      saveVerse(verse);
      setSavedVersesList((prev) => [verse, ...prev]);
    }
  };

  // Select devotion to read in full
  const handleSelectDevotion = (devotion: Devotion) => {
    setActiveDevotion(devotion);
    recordRead(devotion.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Discover another devotion without deleting featured or saved
  const handleDiscoverAnother = () => {
    const otherDevotions = allDevotions.filter((d) => d.id !== todayDevotion.id);
    if (otherDevotions.length > 0) {
      const random = otherDevotions[Math.floor(Math.random() * otherDevotions.length)];
      setFeaturedOverrideId(random.id);
    }
  };

  // Reset featured to the true calendar day
  const handleResetToTodayFeatured = () => {
    setFeaturedOverrideId(null);
  };

  // Language update
  const handleUpdateLanguage = (lang: Language) => {
    setLanguage(lang);
    saveLanguagePreference(lang);
  };

  // Text size update
  const handleUpdateTextSize = (size: TextSize) => {
    setTextSize(size);
    saveTextSizePreference(size);
  };

  // Notification settings update
  const handleUpdateNotificationSettings = (settings: NotificationPreferences) => {
    setNotificationSettings(settings);
    saveNotificationSettings(settings);
  };

  // AI Devotion Created callback
  const handleDevotionCreated = (newDevotion: Devotion) => {
    saveCustomDevotion(newDevotion);
    setAllDevotions((prev) => [newDevotion, ...prev]);
    handleSelectDevotion(newDevotion);
  };

  // Filtered home devotion collection
  const homeFilteredDevotions = useMemo(() => {
    return allDevotions.filter((d) => {
      const content = d.content[language] || d.content.fil;
      const matchesCat = homeCategory === 'All' || d.category === homeCategory;
      if (!homeSearch.trim()) return matchesCat;
      const q = homeSearch.toLowerCase().trim();
      return (
        matchesCat &&
        (content.title.toLowerCase().includes(q) ||
          content.mainVerse.reference.toLowerCase().includes(q) ||
          content.introduction.toLowerCase().includes(q))
      );
    });
  }, [allDevotions, language, homeCategory, homeSearch]);

  const savedDevotionsFullList = useMemo(() => {
    return allDevotions.filter((d) => savedDevotionIds.includes(d.id));
  }, [allDevotions, savedDevotionIds]);

  const todayContent = todayDevotion.content[language] || todayDevotion.content.fil;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top PWA Installation Banner */}
      <PWAInstallBanner
        forceShowIOSGuide={showIOSInstallGuide}
        onCloseIOSGuide={() => setShowIOSInstallGuide(false)}
      />

      {/* Top Navigation Bar */}
      <Header
        currentTab={currentTab}
        onNavigate={(tab) => {
          setActiveDevotion(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenInstallModal={() => setShowIOSInstallGuide(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-5">
        {/* Full Devotion Reading View */}
        {activeDevotion ? (
          <DevotionDetail
            devotion={activeDevotion}
            currentLanguage={language}
            onLanguageChange={handleUpdateLanguage}
            isSaved={savedDevotionIds.includes(activeDevotion.id)}
            onToggleSave={() => handleToggleSaveDevotion(undefined, activeDevotion.id)}
            onBack={() => setActiveDevotion(null)}
            textSize={textSize}
            onTextSizeChange={handleUpdateTextSize}
          />
        ) : (
          <>
            {/* TAB 1: TODAY'S HOME & DEVOTION LIBRARY */}
            {currentTab === 'today' && (
              <div className="space-y-8 pb-24 md:pb-16">
                {/* Date Kicker */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {formatManilaDateLong(undefined, language)}
                  </span>
                  <span>Asia/Manila Time</span>
                </div>

                {/* SECTION A: TODAY'S FEATURED DEVOTION */}
                <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-950 border border-blue-100 dark:border-slate-800 shadow-xs">
                  <div className="grid md:grid-cols-12 gap-0 items-stretch">
                    {/* Cover Image */}
                    <div className="md:col-span-6 relative aspect-16/10 md:aspect-auto min-h-[220px] md:min-h-[320px] bg-slate-100 dark:bg-slate-900">
                      <img
                        src={todayDevotion.coverImage}
                        alt={todayContent.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:hidden" />
                      <div className="absolute top-3 left-3 md:hidden">
                        <span className="px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-xs shadow-sm">
                          Today's Devotion
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Unboxed Metadata */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {todayDevotion.category}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {todayDevotion.readTimeMinutes} min
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {todayContent.mainVerse.reference}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                          {todayContent.title}
                        </h2>

                        {/* Intro preview */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                          {todayContent.introduction}
                        </p>
                      </div>

                      {/* Main Verse snippet */}
                      <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 text-xs text-slate-800 dark:text-slate-200">
                        <span className="font-bold text-blue-600 dark:text-blue-400 block mb-1">
                          {todayContent.mainVerse.reference}:
                        </span>
                        <blockquote className="font-serif-reading italic line-clamp-2">
                          "{todayContent.mainVerse.text}"
                        </blockquote>
                      </div>

                      {/* Buttons - English labels and Blue & Black/White & Blue */}
                      <div className="flex items-center justify-between gap-3 pt-2">
                        <button
                          onClick={() => handleSelectDevotion(todayDevotion)}
                          className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Read Full Devotion</span>
                        </button>

                        <button
                          onClick={(e) => handleToggleSaveDevotion(e, todayDevotion.id)}
                          aria-label={
                            savedDevotionIds.includes(todayDevotion.id)
                              ? 'Remove from saved'
                              : 'Save devotion'
                          }
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            savedDevotionIds.includes(todayDevotion.id)
                              ? 'bg-blue-600 border-blue-600 text-white font-bold'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-900'
                          }`}
                          title={savedDevotionIds.includes(todayDevotion.id) ? 'Saved' : 'Save'}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              savedDevotionIds.includes(todayDevotion.id) ? 'fill-current' : ''
                            }`}
                          />
                        </button>

                        {/* Discover another devotion without losing today's */}
                        <button
                          onClick={handleDiscoverAnother}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-900 hover:text-blue-600 transition cursor-pointer"
                          title="Discover another devotion"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                      {featuredOverrideId && (
                        <div className="text-right">
                          <button
                            onClick={handleResetToTodayFeatured}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            ← Back to today's featured devotion
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* SECTION C: DAILY BIBLE VERSE */}
                <section>
                  <DailyVerseCard
                    verse={todayVerse}
                    language={language}
                    isSaved={savedVersesList.some((v) => v.id === todayVerse.id)}
                    onToggleSave={handleToggleSaveVerse}
                  />
                </section>

                {/* SECTION D: QUICK ACTIONS ROW - English Labels */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => handleSelectDevotion(todayDevotion)}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-blue-100 dark:border-slate-800 text-left hover:border-blue-500/60 dark:hover:border-blue-600 transition cursor-pointer shadow-xs flex flex-col justify-between min-h-[90px]"
                  >
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Read Today
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        Today's Devotion
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentTab('saved')}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-blue-100 dark:border-slate-800 text-left hover:border-blue-500/60 dark:hover:border-blue-600 transition cursor-pointer shadow-xs flex flex-col justify-between min-h-[90px]"
                  >
                    <Bookmark className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Saved Devotions
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {savedDevotionIds.length} saved items
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentTab('explore')}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-blue-100 dark:border-slate-800 text-left hover:border-blue-500/60 dark:hover:border-blue-600 transition cursor-pointer shadow-xs flex flex-col justify-between min-h-[90px]"
                  >
                    <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        All Devotions
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {allDevotions.length} lessons
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentTab('verse')}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-blue-100 dark:border-slate-800 text-left hover:border-blue-500/60 dark:hover:border-blue-600 transition cursor-pointer shadow-xs flex flex-col justify-between min-h-[90px]"
                  >
                    <BookMarked className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        Daily Verse
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {todayVerse.reference}
                      </span>
                    </div>
                  </button>
                </section>

                {/* SECTION B: DEVOTION COLLECTION & FILTERS */}
                <section className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        Devotions for You
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select a devotion to read or share with friends and family.
                      </p>
                    </div>

                    {/* Quick Search */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={homeSearch}
                        onChange={(e) => setHomeSearch(e.target.value)}
                        placeholder="Quick search..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category filters - English labels & Blue theme */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                    {[
                      'All',
                      "God's Timing",
                      'Fear and Anxiety',
                      'Faith and Trust',
                      'Hope and Encouragement',
                      'Patience',
                      'Prayer',
                      'Forgiveness',
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setHomeCategory(cat as 'All' | Category)}
                        className={`whitespace-nowrap shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                          homeCategory === cat
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-blue-50/50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 border border-blue-100 dark:border-slate-800 hover:bg-blue-100/50 dark:hover:bg-slate-900'
                        }`}
                      >
                        {cat === 'All' ? 'All' : cat}
                      </button>
                    ))}
                  </div>

                  {/* Devotions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {homeFilteredDevotions.map((devotion) => (
                      <DevotionCard
                        key={devotion.id}
                        devotion={devotion}
                        language={language}
                        isSaved={savedDevotionIds.includes(devotion.id)}
                        onSelect={handleSelectDevotion}
                        onToggleSave={handleToggleSaveDevotion}
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* TAB 2: EXPLORE / ALL DEVOTIONS */}
            {currentTab === 'explore' && (
              <ExploreView
                devotions={allDevotions}
                language={language}
                savedIds={savedDevotionIds}
                onSelectDevotion={handleSelectDevotion}
                onToggleSave={handleToggleSaveDevotion}
                onOpenAiModal={() => setIsAiModalOpen(true)}
              />
            )}

            {/* TAB 3: SAVED DEVOTIONS & VERSES */}
            {currentTab === 'saved' && (
              <SavedView
                savedDevotions={savedDevotionsFullList}
                savedVerses={savedVersesList}
                language={language}
                onSelectDevotion={handleSelectDevotion}
                onRemoveDevotion={(id) => handleToggleSaveDevotion(undefined, id)}
                onRemoveVerse={(verseId) => {
                  removeSavedVerse(verseId);
                  setSavedVersesList((prev) => prev.filter((v) => v.id !== verseId));
                }}
                onNavigateExplore={() => setCurrentTab('explore')}
              />
            )}

            {/* TAB 4: VERSE OF THE DAY */}
            {currentTab === 'verse' && (
              <div className="space-y-6 pb-24 md:pb-16 max-w-4xl mx-auto">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Verse of the Day
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Scripture reflection for {formatManilaDateLong(undefined, language)} to anchor your day.
                  </p>
                </div>

                <DailyVerseCard
                  verse={todayVerse}
                  language={language}
                  isSaved={savedVersesList.some((v) => v.id === todayVerse.id)}
                  onToggleSave={handleToggleSaveVerse}
                />

                {/* Additional verses to meditate on */}
                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    More Verses for Meditation:
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {DAILY_VERSES.filter((v) => v.id !== todayVerse.id).map((v) => (
                      <DailyVerseCard
                        key={v.id}
                        verse={v}
                        language={language}
                        isSaved={savedVersesList.some((sv) => sv.id === v.id)}
                        onToggleSave={handleToggleSaveVerse}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: SETTINGS */}
            {currentTab === 'settings' && (
              <SettingsView
                notificationSettings={notificationSettings}
                onUpdateNotificationSettings={handleUpdateNotificationSettings}
                textSize={textSize}
                onUpdateTextSize={handleUpdateTextSize}
                language={language}
                onUpdateLanguage={handleUpdateLanguage}
                onOpenInstallGuide={() => setShowIOSInstallGuide(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onNavigate={(tab) => {
          setActiveDevotion(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedDevotionIds.length}
      />

      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* AI Custom Devotion Modal */}
      <GenerateDevotionModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onDevotionCreated={handleDevotionCreated}
        initialLanguage={language}
      />
    </div>
  );
}
