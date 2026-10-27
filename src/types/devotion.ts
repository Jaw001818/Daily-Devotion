export type Language = 'fil' | 'taglish' | 'en';

export type Category =
  | 'Faith and Trust'
  | 'Prayer'
  | 'Patience'
  | 'Fear and Anxiety'
  | "God's Timing"
  | 'Obedience'
  | 'Forgiveness'
  | 'Christian Living'
  | 'Hope and Encouragement'
  | 'Bible Stories'
  | 'Spiritual Growth';

export interface KeyPoint {
  heading: string;
  explanation: string;
  practicalConnection: string;
}

export interface SupportingVerse {
  reference: string;
  translation: string;
  text: string;
  connection: string;
}

export interface DevotionContent {
  title: string;
  subtitle?: string;
  introduction: string;
  mainVerse: {
    reference: string; // e.g. "Mga Awit 46:10" or "Filipos 4:6-7"
    translation: string; // e.g. "MBBTAG", "ASND", "NIV"
    text: string;
  };
  biblicalStory: string;
  shortExplanation: string;
  keyPoints: KeyPoint[];
  practicalTakeaway: {
    aboutGod: string;
    whatToChange: string;
    howToApplyToday: string;
    summarySentence: string;
  };
  supportingVerses: SupportingVerse[];
  reflectionQuestions: string[];
  closingPrayer: string;
  shareableSummary: string;
}

export interface Devotion {
  id: string;
  category: Category;
  coverImage: string;
  readTimeMinutes: number;
  publishedDate?: string;
  isAiGenerated?: boolean;
  content: {
    fil: DevotionContent;
    taglish?: DevotionContent;
    en?: DevotionContent;
  };
}

export interface DailyVerse {
  id: string;
  reference: string;
  translation: string;
  text: {
    fil: string;
    taglish: string;
    en: string;
  };
  reflection: {
    fil: string;
    taglish: string;
    en: string;
  };
  theme: string;
  dateKey: string; // YYYY-MM-DD
}

export type ReminderType = 'both' | 'devotion' | 'verse';

export interface NotificationPreferences {
  enabled: boolean;
  time: string; // HH:MM (24-hour format)
  reminderType: ReminderType;
  timezone: string;
  hasWebPushSubscription: boolean;
  lastTestPushSent?: string;
}

export type TextSize = 'normal' | 'large' | 'xl';
export type AppTheme = 'system' | 'light' | 'dark';
