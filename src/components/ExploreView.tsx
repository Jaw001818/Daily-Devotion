import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Devotion, Category, Language } from '../types/devotion';
import { DevotionCard } from './DevotionCard';

interface ExploreViewProps {
  devotions: Devotion[];
  language: Language;
  savedIds: string[];
  onSelectDevotion: (devotion: Devotion) => void;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  onOpenAiModal: () => void;
}

const CATEGORIES: ('All' | Category)[] = [
  'All',
  "God's Timing",
  'Fear and Anxiety',
  'Faith and Trust',
  'Hope and Encouragement',
  'Patience',
  'Prayer',
  'Forgiveness',
  'Christian Living',
  'Obedience',
  'Bible Stories',
  'Spiritual Growth',
];

export const ExploreView: React.FC<ExploreViewProps> = ({
  devotions,
  language,
  savedIds,
  onSelectDevotion,
  onToggleSave,
  onOpenAiModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Category>('All');

  // Filter devotions by search & category
  const filteredDevotions = useMemo(() => {
    return devotions.filter((d) => {
      const content = d.content[language] || d.content.fil;
      const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesTitle = content.title.toLowerCase().includes(q);
      const matchesVerse =
        content.mainVerse.reference.toLowerCase().includes(q) ||
        content.mainVerse.text.toLowerCase().includes(q);
      const matchesIntro = content.introduction.toLowerCase().includes(q);
      const matchesStory = content.biblicalStory.toLowerCase().includes(q);

      return matchesCategory && (matchesTitle || matchesVerse || matchesIntro || matchesStory);
    });
  }, [devotions, language, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6 pb-24 md:pb-16 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Devotion Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Discover Bible stories and lessons based on your current season of life.
          </p>
        </div>

        {/* English Action Button with Blue Theme */}
        <button
          onClick={onOpenAiModal}
          className="self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Create Custom Topic</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, verse reference (e.g. Matthew, Psalms), or keyword..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Tabs (English labels + Blue styling) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50/60 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Topics' : cat}
            </button>
          );
        })}
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
        Showing: {filteredDevotions.length} devotions
      </div>

      {/* Devotion Cards Grid */}
      {filteredDevotions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDevotions.map((devotion) => (
            <DevotionCard
              key={devotion.id}
              devotion={devotion}
              language={language}
              isSaved={savedIds.includes(devotion.id)}
              onSelect={onSelectDevotion}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-950 border border-dashed border-blue-200 dark:border-slate-800 space-y-3">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            No devotions found for "{searchQuery || selectedCategory}".
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      )}
    </div>
  );
};
