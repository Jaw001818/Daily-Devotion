import React, { useState } from 'react';
import { Bookmark, Copy, Share2, Check, BookMarked, Sparkles } from 'lucide-react';
import { DailyVerse, Language } from '../types/devotion';

interface DailyVerseCardProps {
  verse: DailyVerse;
  language: Language;
  isSaved: boolean;
  onToggleSave: (verse: DailyVerse) => void;
}

export const DailyVerseCard: React.FC<DailyVerseCardProps> = ({
  verse,
  language,
  isSaved,
  onToggleSave,
}) => {
  const [copied, setCopied] = useState(false);

  const text = verse.text[language] || verse.text.fil;
  const reflection = verse.reflection[language] || verse.reflection.fil;

  const handleCopy = async () => {
    const formatted = `📖 "${text}" — ${verse.reference} (${verse.translation})\n\n💡 Reflection: ${reflection}\n\nDaily Bible Devotion App`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    const formatted = `📖 "${text}" — ${verse.reference} (${verse.translation})\n\n💡 Reflection: ${reflection}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Verse of the Day: ${verse.reference}`,
          text: formatted,
          url: window.location.href,
        });
      } catch {
        // Dismissed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 dark:from-blue-950 dark:via-black dark:to-slate-950 text-white p-6 sm:p-8 border border-blue-300/40 dark:border-blue-900/60 shadow-lg">
      {/* Decorative ambient background icon */}
      <BookMarked className="absolute -right-6 -bottom-6 w-36 h-36 text-white/5 pointer-events-none" />

      {/* Top row: Theme & actions */}
      <div className="relative z-10 flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-200 tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-300" />
          <span>VERSE OF THE DAY ({verse.theme.toUpperCase()})</span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleSave(verse)}
            aria-label={isSaved ? 'Remove from saved' : 'Save verse'}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isSaved
                ? 'bg-white text-blue-900 font-bold shadow-xs'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title={isSaved ? 'Saved' : 'Save'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleCopy}
            aria-label="Copy verse"
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            title="Copy"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleShare}
            aria-label="Share verse"
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Verse body */}
      <div className="relative z-10 space-y-3">
        <blockquote className="font-serif-reading text-lg sm:text-2xl font-semibold leading-relaxed tracking-wide text-blue-50">
          "{text}"
        </blockquote>

        <div className="text-sm font-bold text-blue-200 tracking-wide">
          — {verse.reference} <span className="text-xs font-normal opacity-80">({verse.translation})</span>
        </div>

        {/* Reflection */}
        <div className="mt-4 pt-4 border-t border-white/15 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
          <span className="font-semibold text-white">Reflection: </span>
          {reflection}
        </div>
      </div>
    </div>
  );
};
