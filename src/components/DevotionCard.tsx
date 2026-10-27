import React, { useState } from 'react';
import { Bookmark, Clock, BookOpen, Share2 } from 'lucide-react';
import { Devotion, Language } from '../types/devotion';

interface DevotionCardProps {
  devotion: Devotion;
  language: Language;
  isSaved: boolean;
  onSelect: (devotion: Devotion) => void;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  onQuickShare?: (e: React.MouseEvent, devotion: Devotion) => void;
}

export const DevotionCard: React.FC<DevotionCardProps> = ({
  devotion,
  language,
  isSaved,
  onSelect,
  onToggleSave,
  onQuickShare,
}) => {
  const [imgError, setImgError] = useState(false);
  const content = devotion.content[language] || devotion.content.fil;

  return (
    <article
      onClick={() => onSelect(devotion)}
      className="group relative flex flex-col bg-white dark:bg-slate-950 rounded-2xl border border-blue-100/90 dark:border-slate-800/90 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-900 transition-all duration-200 cursor-pointer"
    >
      {/* Image Container with Fallback */}
      <div className="relative aspect-16/9 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {!imgError ? (
          <img
            src={devotion.coverImage}
            alt={content.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-950 via-black to-slate-950 text-blue-400 p-4 text-center">
            <BookOpen className="w-8 h-8 mb-2 opacity-70" />
            <span className="text-xs text-slate-400 font-medium">{devotion.category}</span>
          </div>
        )}

        {/* Floating Bookmark Button */}
        <button
          onClick={(e) => onToggleSave(e, devotion.id)}
          aria-label={isSaved ? 'Remove from saved' : 'Save devotion'}
          className={`absolute top-3 right-3 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
            isSaved
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-black/50 text-white hover:bg-black/70'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Unboxed Metadata (Zero-Pill discipline) */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span className="font-semibold text-blue-600 dark:text-blue-400">{devotion.category}</span>
          <span aria-hidden="true">·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {devotion.readTimeMinutes} min
          </span>
          <span aria-hidden="true">·</span>
          <span>{content.mainVerse.reference}</span>
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
          {content.title}
        </h3>

        {/* Short introduction excerpt */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {content.introduction}
        </p>

        {/* Bottom Actions Row - In English */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className="font-semibold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-1">
            Read Full Devotion →
          </span>

          {onQuickShare && (
            <button
              onClick={(e) => onQuickShare(e, devotion)}
              aria-label="Share devotion"
              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
