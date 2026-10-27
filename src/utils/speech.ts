/**
 * Browser SpeechSynthesis helper for devotional audio reading
 */

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

export function speakDevotionText(
  text: string,
  language: 'fil' | 'taglish' | 'en',
  onEnd?: () => void,
  onError?: (err: unknown) => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  stopSpeaking();

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance = utterance;

    // Pick best voice for language
    const voices = window.speechSynthesis.getVoices();
    if (language === 'fil' || language === 'taglish') {
      const filVoice = voices.find(
        (v) => v.lang.startsWith('fil') || v.lang.startsWith('tl')
      );
      if (filVoice) {
        utterance.voice = filVoice;
      } else {
        // Fallback to English voice with slightly slower rate for Taglish
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
      }
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
    }

    utterance.pitch = 1.0;

    utterance.onend = () => {
      currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      currentUtterance = null;
      if (onError) onError(e);
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error', err);
    if (onError) onError(err);
    return false;
  }
}
