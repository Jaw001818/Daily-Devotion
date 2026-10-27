import { Devotion, DailyVerse } from '../types/devotion';

/**
 * Returns current date string formatted as YYYY-MM-DD in Asia/Manila timezone
 */
export function getManilaDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Manila',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }
}

/**
 * Formats date into readable Filipino / English date
 */
export function formatManilaDateLong(dateStr?: string, language: 'fil' | 'taglish' | 'en' = 'fil'): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  if (language === 'fil') {
    // Filipino custom month & day names
    const weekdaysFil = ['Linggo', 'Lunes', 'Martes', 'Miyerkules', 'Huwebes', 'Biyernes', 'Sabado'];
    const monthsFil = [
      'Enero', 'Pebrero', 'Marso', 'Abril', 'Mayo', 'Hunyo',
      'Hulyo', 'Agosto', 'Setyembre', 'Oktubre', 'Nobyembre', 'Disyembre',
    ];
    // Get manila day & month
    const parts = new Intl.DateTimeFormat('en-US', { ...options, weekday: 'short', month: 'numeric', day: 'numeric', year: 'numeric' })
      .formatToParts(date);
    
    const dayOfWeek = weekdaysFil[date.getDay()];
    const day = parts.find((p) => p.type === 'day')?.value || date.getDate().toString();
    const month = monthsFil[date.getMonth()];
    const year = parts.find((p) => p.type === 'year')?.value || date.getFullYear().toString();
    return `${dayOfWeek}, ${month} ${day}, ${year}`;
  }

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Deterministically pick today's featured devotion based on Manila date
 */
export function getFeaturedDevotionForToday(devotions: Devotion[], overrideId?: string | null): Devotion {
  if (devotions.length === 0) {
    throw new Error('No devotions available');
  }

  // If user selected an override for temporary discovery, return it
  if (overrideId) {
    const found = devotions.find((d) => d.id === overrideId);
    if (found) return found;
  }

  const manilaDate = getManilaDateString();
  // Hash the date string to a deterministic index
  let hash = 0;
  for (let i = 0; i < manilaDate.length; i++) {
    hash = (hash << 5) - hash + manilaDate.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % devotions.length;
  return devotions[index];
}

/**
 * Deterministically pick today's verse based on Manila date
 */
export function getDailyVerseForToday(verses: DailyVerse[]): DailyVerse {
  if (verses.length === 0) {
    throw new Error('No daily verses available');
  }
  const manilaDate = getManilaDateString();
  let hash = 0;
  for (let i = 0; i < manilaDate.length; i++) {
    hash = (hash << 5) - hash + manilaDate.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % verses.length;
  return verses[index];
}
