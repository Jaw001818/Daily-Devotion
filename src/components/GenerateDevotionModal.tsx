import React, { useState } from 'react';
import { Sparkles, X, Loader2, AlertCircle, BookOpen } from 'lucide-react';
import { Devotion, Language } from '../types/devotion';

interface GenerateDevotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDevotionCreated: (devotion: Devotion) => void;
  initialLanguage: Language;
}

const PRESET_TOPICS = [
  'Overcoming Fear & Anxiety about the Future',
  'Trusting God During Career & Financial Trials',
  'Peace & Reconciliation in the Family',
  'Strength & Courage During Illness',
  'Seeking Divine Direction & Wisdom',
  'Overcoming Temptation & Breaking Bad Habits',
];

export const GenerateDevotionModal: React.FC<GenerateDevotionModalProps> = ({
  isOpen,
  onClose,
  onDevotionCreated,
  initialLanguage,
}) => {
  const [topic, setTopic] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(initialLanguage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (topicToUse: string) => {
    const finalTopic = topicToUse.trim();
    if (!finalTopic) {
      setError('Please enter a topic or select one of the suggested prompts below.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/devotions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: finalTopic,
          language: selectedLanguage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate devotion at this time.');
      }

      const generatedDevotion: Devotion = await response.json();
      onDevotionCreated(generatedDevotion);
      onClose();
    } catch (err: unknown) {
      console.error('Error generating devotion:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Network connection issue. Please check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in"
    >
      <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 p-6 shadow-2xl border border-blue-100 dark:border-slate-800 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/50 dark:border-blue-900/50">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Create Custom Devotion
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Every devotion is grounded in actual biblical events, verified scripture verses, and practical 11-step life applications.
        </p>

        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            What circumstance or life topic would you like to meditate on?
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={loading}
            placeholder="e.g. Worry about finances, waiting on prayer answers, family peace..."
            className="w-full px-4 py-2.5 rounded-xl border border-blue-100 dark:border-slate-800 bg-blue-50/40 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Language Selection */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Devotion Language:</span>
          <div className="flex items-center bg-blue-50 dark:bg-slate-900 rounded-lg p-0.5 border border-blue-100 dark:border-slate-800">
            {[
              { id: 'fil', label: 'Tagalog' },
              { id: 'taglish', label: 'Taglish' },
              { id: 'en', label: 'English' },
            ].map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setSelectedLanguage(lang.id as Language)}
                className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                  selectedLanguage === lang.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
            Or select a common topic:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TOPICS.map((preset) => (
              <button
                key={preset}
                type="button"
                disabled={loading}
                onClick={() => {
                  setTopic(preset);
                  handleGenerate(preset);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-50/70 dark:bg-slate-900 hover:bg-blue-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs transition cursor-pointer text-left border border-blue-100 dark:border-slate-800"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button - In English */}
        <div className="pt-2">
          <button
            onClick={() => handleGenerate(topic)}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching Scripture and preparing lesson...</span>
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4" />
                <span>Generate Devotion Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
