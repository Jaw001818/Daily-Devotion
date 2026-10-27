import { Devotion, DailyVerse, NotificationPreferences, TextSize, Language } from '../types/devotion';

const STORAGE_KEYS = {
  SAVED_DEVOTIONS: 'bible_app_saved_devotions',
  SAVED_VERSES: 'bible_app_saved_verses',
  READING_HISTORY: 'bible_app_reading_history',
  NOTIFICATION_SETTINGS: 'bible_app_notification_settings',
  CUSTOM_DEVOTIONS: 'bible_app_custom_devotions',
  TEXT_SIZE: 'bible_app_text_size',
  LANGUAGE: 'bible_app_language',
  THEME: 'bible_app_theme',
};

// --- SAVED DEVOTIONS ---
export function getSavedDevotionIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_DEVOTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read saved devotions from localStorage', err);
    return [];
  }
}

export function isDevotionSaved(id: string): boolean {
  const ids = getSavedDevotionIds();
  return ids.includes(id);
}

export function saveDevotion(id: string): boolean {
  try {
    const ids = getSavedDevotionIds();
    if (!ids.includes(id)) {
      const updated = [id, ...ids];
      localStorage.setItem(STORAGE_KEYS.SAVED_DEVOTIONS, JSON.stringify(updated));
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to save devotion', err);
    return false;
  }
}

export function removeSavedDevotion(id: string): void {
  try {
    const ids = getSavedDevotionIds();
    const updated = ids.filter((savedId) => savedId !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_DEVOTIONS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove saved devotion', err);
  }
}

// --- SAVED VERSES ---
export function getSavedVerses(): DailyVerse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_VERSES);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read saved verses', err);
    return [];
  }
}

export function isVerseSaved(verseId: string): boolean {
  const verses = getSavedVerses();
  return verses.some((v) => v.id === verseId);
}

export function saveVerse(verse: DailyVerse): boolean {
  try {
    const verses = getSavedVerses();
    if (!verses.some((v) => v.id === verse.id)) {
      const updated = [verse, ...verses];
      localStorage.setItem(STORAGE_KEYS.SAVED_VERSES, JSON.stringify(updated));
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to save verse', err);
    return false;
  }
}

export function removeSavedVerse(verseId: string): void {
  try {
    const verses = getSavedVerses();
    const updated = verses.filter((v) => v.id !== verseId);
    localStorage.setItem(STORAGE_KEYS.SAVED_VERSES, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove saved verse', err);
  }
}

// --- READING HISTORY ---
export interface HistoryEntry {
  devotionId: string;
  timestamp: number;
}

export function getReadingHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READING_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRead(devotionId: string): void {
  try {
    const history = getReadingHistory();
    // Move to top and limit to 50
    const filtered = history.filter((h) => h.devotionId !== devotionId);
    const updated = [{ devotionId, timestamp: Date.now() }, ...filtered].slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.READING_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to record read history', err);
  }
}

// --- NOTIFICATION SETTINGS ---
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationPreferences = {
  enabled: false,
  time: '07:00',
  reminderType: 'both',
  timezone: 'Asia/Manila',
  hasWebPushSubscription: false,
};

export function getNotificationSettings(): NotificationPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export function saveNotificationSettings(settings: NotificationPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save notification settings', err);
  }
}

// --- CUSTOM AI DEVOTIONS ---
export function getCustomDevotions(): Devotion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_DEVOTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomDevotion(devotion: Devotion): void {
  try {
    const custom = getCustomDevotions();
    const filtered = custom.filter((d) => d.id !== devotion.id);
    const updated = [devotion, ...filtered];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_DEVOTIONS, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save custom devotion', err);
  }
}

// --- TEXT SIZE & LANGUAGE ---
export function getTextSizePreference(): TextSize {
  try {
    return (localStorage.getItem(STORAGE_KEYS.TEXT_SIZE) as TextSize) || 'normal';
  } catch {
    return 'normal';
  }
}

export function saveTextSizePreference(size: TextSize): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, size);
  } catch (err) {
    console.error('Failed to save text size', err);
  }
}

export function getLanguagePreference(): Language {
  try {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'fil';
  } catch {
    return 'fil';
  }
}

export function saveLanguagePreference(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  } catch (err) {
    console.error('Failed to save language', err);
  }
}
