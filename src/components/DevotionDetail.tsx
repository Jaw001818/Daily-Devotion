import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Copy,
  Printer,
  Volume2,
  VolumeX,
  Check,
  BookOpen,
  Sparkles,
  Heart,
  HelpCircle,
  Compass,
} from 'lucide-react';
import { Devotion, Language, TextSize } from '../types/devotion';
import { speakDevotionText, stopSpeaking, isSpeaking } from '../utils/speech';

interface DevotionDetailProps {
  devotion: Devotion;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onBack: () => void;
  textSize: TextSize;
  onTextSizeChange: (size: TextSize) => void;
}

export const DevotionDetail: React.FC<DevotionDetailProps> = ({
  devotion,
  currentLanguage,
  onLanguageChange,
  isSaved,
  onToggleSave,
  onBack,
  textSize,
  onTextSizeChange,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Stop audio if component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const content = devotion.content[currentLanguage] || devotion.content.fil;

  // Font size classes
  const bodyTextClass =
    textSize === 'xl'
      ? 'text-lg sm:text-xl leading-relaxed sm:leading-loose'
      : textSize === 'large'
      ? 'text-base sm:text-lg leading-relaxed'
      : 'text-sm sm:text-base leading-relaxed';

  const verseTextClass =
    textSize === 'xl'
      ? 'text-xl sm:text-2xl leading-relaxed'
      : textSize === 'large'
      ? 'text-lg sm:text-xl leading-relaxed'
      : 'text-base sm:text-lg leading-relaxed';

  // Audio Playback Toggle
  const handleToggleAudio = () => {
    if (isPlayingAudio || isSpeaking()) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      const speechScript = `
        ${content.title}.
        Pangunahing Talata: ${content.mainVerse.reference}, ${content.mainVerse.text}.
        ${content.introduction}.
        Ang Kwento sa Bibliya: ${content.biblicalStory}.
        Paliwanag: ${content.shortExplanation}.
        Pangunahing Aral: ${content.practicalTakeaway.summarySentence}.
        Panalangin: ${content.closingPrayer}
      `;
      const started = speakDevotionText(
        speechScript,
        currentLanguage,
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
      if (started) {
        setIsPlayingAudio(true);
      }
    }
  };

  // Copy Ready-to-Post format requested by user
  const handleCopyFormattedPost = async () => {
    const keyPointsText = content.keyPoints
      .slice(0, 3)
      .map((kp, i) => `💡 Key Point ${i + 1}: ${kp.heading}\n${kp.explanation}\n📌 Praktikal: ${kp.practicalConnection}`)
      .join('\n\n');

    const takeawayQuestion = content.reflectionQuestions?.[0]
      ? `\nTanong para sa iyo: ${content.reflectionQuestions[0]}`
      : '';

    const postFormat = `✨ ${content.title} ✨\n\n📖 Key Verse:\n"${content.mainVerse.text}" — ${content.mainVerse.reference} (${content.mainVerse.translation})\n\n🌱 Pagninilay:\n${content.introduction}\n\n${keyPointsText}\n\n🤔 Takeaway:\n${content.practicalTakeaway.aboutGod} ${content.practicalTakeaway.howToApplyToday}${takeawayQuestion}\n\n⚡ Closing Statement:\n"${content.practicalTakeaway.summarySentence}"\n\n#DailyDevotion #Faith #TaglishDevotion #WordOfGod`;

    try {
      await navigator.clipboard.writeText(postFormat);
      setCopyFeedback('Ready-to-Post format copied!');
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback('Failed to copy.');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  // Copy shareable summary to clipboard
  const handleCopySummary = async () => {
    const textToCopy = `✨ ${content.title} ✨\n\n📖 "${content.mainVerse.text}" — ${content.mainVerse.reference} (${content.mainVerse.translation})\n\n💡 Summary: ${content.shareableSummary}\n\n🙏 Prayer: ${content.closingPrayer}\n\n📱 Daily Bible Devotion App`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopyFeedback('Copied to clipboard!');
      setTimeout(() => setCopyFeedback(null), 2500);
    } catch {
      setCopyFeedback('Failed to copy.');
      setTimeout(() => setCopyFeedback(null), 2000);
    }
  };

  // Native Share
  const handleShare = async () => {
    const shareData = {
      title: content.title,
      text: `✨ ${content.title} ✨\n"${content.mainVerse.text}" — ${content.mainVerse.reference}\n\n${content.shareableSummary}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User dismissed
      }
    } else {
      handleCopySummary();
    }
  };

  // Clean Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-16 px-4 sm:px-6">
      {/* Sticky Action Toolbar - English Buttons + Blue & Black / White & Blue */}
      <div className="sticky top-15 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-blue-100 dark:border-slate-800 flex items-center justify-between gap-2 no-print">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 py-1.5 px-2.5 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Center / Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-blue-50/80 dark:bg-slate-900 rounded-lg p-0.5 text-xs border border-blue-100 dark:border-slate-800">
            <button
              onClick={() => onLanguageChange('fil')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                currentLanguage === 'fil'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              Tagalog
            </button>
            <button
              onClick={() => onLanguageChange('taglish')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                currentLanguage === 'taglish'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              Taglish
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                currentLanguage === 'en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              EN
            </button>
          </div>

          {/* Text Size Control */}
          <div className="flex items-center bg-blue-50/80 dark:bg-slate-900 rounded-lg p-0.5 text-xs border border-blue-100 dark:border-slate-800">
            <button
              onClick={() => onTextSizeChange('normal')}
              title="Normal font size"
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                textSize === 'normal'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              A
            </button>
            <button
              onClick={() => onTextSizeChange('large')}
              title="Large font size"
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer text-sm ${
                textSize === 'large'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              A+
            </button>
            <button
              onClick={() => onTextSizeChange('xl')}
              title="Extra large font size"
              className={`px-2 py-1 rounded-md font-bold transition cursor-pointer text-base ${
                textSize === 'xl'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-600'
              }`}
            >
              A++
            </button>
          </div>

          {/* Audio Reader */}
          <button
            onClick={handleToggleAudio}
            aria-label={isPlayingAudio ? 'Stop audio' : 'Listen to devotion'}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isPlayingAudio
                ? 'bg-blue-600 text-white shadow-xs animate-pulse'
                : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-900 hover:text-blue-600'
            }`}
            title="Listen (Audio)"
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Save Bookmark */}
          <button
            onClick={() => onToggleSave(devotion.id)}
            aria-label={isSaved ? 'Remove from saved' : 'Save devotion'}
            className={`p-2 rounded-lg transition cursor-pointer ${
              isSaved
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-900 hover:text-blue-600'
            }`}
            title={isSaved ? 'Saved' : 'Save'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            aria-label="Share devotion"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-900 hover:text-blue-600 transition cursor-pointer"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            aria-label="Print devotion"
            className="hidden sm:flex p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-900 hover:text-blue-600 transition cursor-pointer"
            title="Print Clean Copy"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Copy Toast feedback */}
      {copyFeedback && (
        <div className="fixed top-20 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          {copyFeedback}
        </div>
      )}

      {/* Printable / Viewable Article Container */}
      <article className="mt-6 space-y-8">
        {/* Header Block: Cover, Category, Title */}
        <header className="space-y-4">
          {/* Cover image banner */}
          <div className="relative aspect-21/9 w-full rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-sm">
            <img
              src={devotion.coverImage}
              alt={content.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
            <div className="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-1">
                <span>{devotion.category}</span>
                <span aria-hidden="true">·</span>
                <span>{devotion.readTimeMinutes} min read</span>
                {devotion.isAiGenerated && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-sky-300">
                      <Sparkles className="w-3 h-3" />
                      Custom Topic
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight drop-shadow-xs">
                {content.title}
              </h1>
            </div>
          </div>

          {content.subtitle && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 italic">
              {content.subtitle}
            </p>
          )}
        </header>

        {/* 2. INTRODUCTION */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            Introduction
          </h2>
          <div className={`text-slate-700 dark:text-slate-300 leading-relaxed ${bodyTextClass}`}>
            {content.introduction}
          </div>
        </section>

        {/* 3. MAIN BIBLE VERSE */}
        <section className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-2xl p-5 sm:p-6 my-6">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-2">
            <BookOpen className="w-4 h-4" />
            <span>MAIN SCRIPTURE PASSAGE</span>
          </div>
          <blockquote className={`font-serif-reading italic font-medium text-slate-900 dark:text-white ${verseTextClass}`}>
            "{content.mainVerse.text}"
          </blockquote>
          <div className="mt-3 text-right text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400">
            — {content.mainVerse.reference} ({content.mainVerse.translation})
          </div>
        </section>

        {/* 4. BIBLICAL STORY */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>The Biblical Account</span>
          </div>
          <div className={`text-slate-700 dark:text-slate-300 leading-relaxed font-serif-reading ${bodyTextClass}`}>
            {content.biblicalStory}
          </div>
        </section>

        {/* 5. SHORT EXPLANATION */}
        <section className="space-y-3 bg-white dark:bg-slate-950 rounded-2xl p-5 sm:p-6 border border-blue-100 dark:border-slate-800">
          <h2 className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            Spiritual Meaning & Reflection
          </h2>
          <div className={`text-slate-700 dark:text-slate-300 leading-relaxed ${bodyTextClass}`}>
            {content.shortExplanation}
          </div>
        </section>

        {/* 6. KEY POINTS */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
            Key Lessons
          </h2>
          <div className="grid gap-3 sm:gap-4">
            {content.keyPoints.map((point, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-950 rounded-2xl p-4 sm:p-5 border border-blue-100 dark:border-slate-800 shadow-xs"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-200 dark:border-blue-900/60">
                    {idx + 1}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                      {point.heading}
                    </h3>
                    <p className={`text-slate-600 dark:text-slate-300 ${bodyTextClass}`}>
                      {point.explanation}
                    </p>
                    <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/50 mt-2">
                      <span className="font-semibold">Daily Application: </span>
                      {point.practicalConnection}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. PRACTICAL TAKEAWAY */}
        <section className="bg-gradient-to-br from-blue-50 via-white to-transparent dark:from-blue-950/30 dark:via-black dark:to-slate-950 rounded-3xl p-5 sm:p-7 border border-blue-200 dark:border-blue-900/50 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Practical Life Takeaway</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-blue-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                What this teaches about God:
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                {content.practicalTakeaway.aboutGod}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-blue-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                What to change or practice:
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                {content.practicalTakeaway.whatToChange}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-blue-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">
                Action today:
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                {content.practicalTakeaway.howToApplyToday}
              </p>
            </div>
          </div>

          {/* Golden 1-sentence summary banner */}
          <div className="mt-4 p-4 rounded-2xl bg-blue-600 text-white font-bold text-center text-sm sm:text-base shadow-sm">
            "{content.practicalTakeaway.summarySentence}"
          </div>
        </section>

        {/* 8. SUPPORTING BIBLE VERSES */}
        {content.supportingVerses && content.supportingVerses.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              Supporting Scripture
            </h2>
            <div className="space-y-3">
              {content.supportingVerses.map((sv, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-950 rounded-2xl p-4 sm:p-5 border border-blue-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                    <span>{sv.reference}</span>
                    <span className="text-slate-400 font-normal">{sv.translation}</span>
                  </div>
                  <blockquote className="font-serif-reading italic text-slate-800 dark:text-slate-200 text-xs sm:text-sm my-1.5">
                    "{sv.text}"
                  </blockquote>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium">Connection: </span> {sv.connection}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. REFLECTION QUESTIONS */}
        {content.reflectionQuestions && content.reflectionQuestions.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Questions for Reflection</span>
            </div>
            <ul className="space-y-2">
              {content.reflectionQuestions.map((q, idx) => (
                <li
                  key={idx}
                  className="bg-white dark:bg-slate-950 rounded-xl p-3.5 sm:p-4 border border-blue-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 flex items-start gap-3"
                >
                  <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-semibold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-100 dark:border-slate-800">
                    {idx + 1}
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 10. CLOSING PRAYER */}
        <section className="bg-blue-50/50 dark:bg-slate-950 rounded-2xl p-5 sm:p-6 border border-blue-100 dark:border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            <Heart className="w-4 h-4" />
            <span>Closing Prayer</span>
          </div>
          <p className={`font-serif-reading italic text-slate-800 dark:text-slate-200 leading-relaxed ${bodyTextClass}`}>
            "{content.closingPrayer}"
          </p>
        </section>

        {/* 11. READY-TO-POST & SHAREABLE SUMMARY */}
        <section className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5 sm:p-6 space-y-4 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider block">
                Ready-to-Post Format (Social Media & GC)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Formatted in conversational Taglish with Key Verse, Pagninilay, 3 Key Points, and Takeaway.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyFormattedPost}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Ready-to-Post</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 cursor-pointer transition shadow-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Short</span>
              </button>
            </div>
          </div>

          {/* Formatted Preview Box */}
          <div className="bg-white/90 dark:bg-black/70 p-4 sm:p-5 rounded-xl border border-blue-100 dark:border-blue-900/50 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-2.5 font-mono">
            <div className="font-bold text-blue-600 dark:text-blue-400 font-sans text-sm sm:text-base">
              ✨ {content.title} ✨
            </div>
            <div className="text-slate-600 dark:text-slate-300 font-sans italic">
              <strong>📖 Key Verse:</strong> "{content.mainVerse.text}" — {content.mainVerse.reference} ({content.mainVerse.translation})
            </div>
            <div className="text-slate-700 dark:text-slate-300 font-sans">
              <strong>🌱 Pagninilay:</strong> {content.introduction}
            </div>
            <div className="text-slate-700 dark:text-slate-300 font-sans space-y-1">
              {content.keyPoints.slice(0, 3).map((kp, i) => (
                <div key={i}>
                  <strong>💡 Key Point {i + 1}: {kp.heading}</strong> — {kp.explanation}
                </div>
              ))}
            </div>
            <div className="text-slate-700 dark:text-slate-300 font-sans">
              <strong>🤔 Takeaway:</strong> {content.practicalTakeaway.aboutGod} {content.practicalTakeaway.howToApplyToday}
              {content.reflectionQuestions?.[0] ? ` Tanong para sa iyo: ${content.reflectionQuestions[0]}` : ''}
            </div>
            <div className="text-blue-600 dark:text-blue-400 font-sans font-bold pt-1">
              <strong>⚡ Closing Statement:</strong> "{content.practicalTakeaway.summarySentence}"
            </div>
          </div>
        </section>
      </article>
    </div>
  );
};
