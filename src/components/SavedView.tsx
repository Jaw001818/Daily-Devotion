import React, { useState } from 'react';
import { Bookmark, BookOpen, Trash2, Copy, Check, Share2, Compass } from 'lucide-react';
import { Devotion, DailyVerse, Language } from '../types/devotion';
import { DevotionCard } from './DevotionCard';

interface SavedViewProps {
  savedDevotions: Devotion[];
  savedVerses: DailyVerse[];
  language: Language;
  onSelectDevotion: (devotion: Devotion) => void;
  onRemoveDevotion: (id: string) => void;
  onRemoveVerse: (verseId: string) => void;
  onNavigateExplore: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
  savedDevotions,
  savedVerses,
  language,
  onSelectDevotion,
  onRemoveDevotion,
  onRemoveVerse,
  onNavigateExplore,
}) => {
  const [activeTab, setActiveTab] = useState<'devotions' | 'verses'>('devotions');
  const [copiedVerseId, setCopiedVerseId] = useState<string | null>(null);

  const handleCopyVerse = async (verse: DailyVerse) => {
    const text = verse.text[language] || verse.text.fil;
    const ref = `${verse.reference} (${verse.translation})`;
    const formatted = `📖 "${text}" — ${ref}\n\nDaily Bible Devotion App`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedVerseId(verse.id);
      setTimeout(() => setCopiedVerseId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShareVerse = async (verse: DailyVerse) => {
    const text = verse.text[language] || verse.text.fil;
    const ref = `${verse.reference} (${verse.translation})`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verse: ${verse.reference}`,
          text: `"${text}" — ${ref}`,
          url: window.location.href,
        });
      } catch {
        // Dismissed
      }
    } else {
      handleCopyVerse(verse);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-16 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Saved Items
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Your bookmarked devotions and verses remain accessible offline and across app restarts.
        </p>
      </div>

      {/* Tabs - English Labels and Blue Accent */}
      <div className="flex items-center gap-2 border-b border-blue-100 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('devotions')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
            activeTab === 'devotions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Devotions ({savedDevotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('verses')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
            activeTab === 'verses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Verses ({savedVerses.length})</span>
        </button>
      </div>

      {/* TAB 1: SAVED DEVOTIONS */}
      {activeTab === 'devotions' && (
        <>
          {savedDevotions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedDevotions.map((devotion) => (
                <DevotionCard
                  key={devotion.id}
                  devotion={devotion}
                  language={language}
                  isSaved={true}
                  onSelect={onSelectDevotion}
                  onToggleSave={(_e, id) => onRemoveDevotion(id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-950 border border-dashed border-blue-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No saved devotions yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Tap the bookmark button on any devotion to save it for offline reading.
                </p>
              </div>
              <button
                onClick={onNavigateExplore}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer shadow-xs"
              >
                <Compass className="w-4 h-4" />
                <span>Browse Library</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* TAB 2: SAVED VERSES */}
      {activeTab === 'verses' && (
        <>
          {savedVerses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedVerses.map((verse) => {
                const text = verse.text[language] || verse.text.fil;
                const reflection = verse.reflection[language] || verse.reflection.fil;

                return (
                  <div
                    key={verse.id}
                    className="flex flex-col justify-between bg-white dark:bg-slate-950 rounded-2xl p-5 border border-blue-100 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
                        <span>{verse.reference}</span>
                        <span className="text-slate-400 font-normal">({verse.translation})</span>
                      </div>
                      <blockquote className="font-serif-reading italic font-medium text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-relaxed">
                        "{text}"
                      </blockquote>
                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                        {reflection}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        {verse.theme}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyVerse(verse)}
                          aria-label="Copy verse"
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Copy"
                        >
                          {copiedVerseId === verse.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleShareVerse(verse)}
                          aria-label="Share verse"
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRemoveVerse(verse.id)}
                          aria-label="Remove verse"
                          className="p-1.5 text-red-400 hover:text-red-600 transition"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-950 border border-dashed border-blue-200 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No saved verses yet
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Bookmark daily scripture verses to easily reflect on God’s promises.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
