export interface SpeakOptions {
  text: string;
  langName: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

const langIsoMap: Record<string, string> = {
  English: 'en',
  Hindi: 'hi',
  Tamil: 'ta',
  Telugu: 'te',
  Marathi: 'mr',
  Bengali: 'bn',
  Gujarati: 'gu'
};

const langCodeMap: Record<string, string[]> = {
  English: ['en-IN', 'en-US', 'en-GB'],
  Hindi: ['hi-IN', 'hi'],
  Tamil: ['ta-IN', 'ta'],
  Telugu: ['te-IN', 'te'],
  Marathi: ['mr-IN', 'mr'],
  Bengali: ['bn-IN', 'bn'],
  Gujarati: ['gu-IN', 'gu']
};

let activeAudio: HTMLAudioElement | null = null;

export function speakText({ text, langName, onStart, onEnd, onError }: SpeakOptions) {
  // Stop any currently playing audio or speech synthesis
  stopSpeech();

  if (!text || !text.trim()) {
    if (onEnd) onEnd();
    return;
  }

  const isoCode = langIsoMap[langName] || 'en';
  const cleanText = text.trim();

  // Try Online TTS Streamer (Guarantees Native Tamil, Telugu, Marathi, Bengali, Gujarati, Hindi & English audio across all browsers)
  try {
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText.slice(0, 200))}&tl=${isoCode}&client=tw-ob`;
    const audio = new Audio(audioUrl);
    activeAudio = audio;

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      activeAudio = null;
      if (onEnd) onEnd();
    };

    audio.onerror = () => {
      activeAudio = null;
      // Fallback to Web Speech Synthesis if audio stream blocked
      fallbackWebSpeech({ text: cleanText, langName, onStart, onEnd, onError });
    };

    audio.play().catch(() => {
      activeAudio = null;
      fallbackWebSpeech({ text: cleanText, langName, onStart, onEnd, onError });
    });

  } catch {
    fallbackWebSpeech({ text: cleanText, langName, onStart, onEnd, onError });
  }
}

function fallbackWebSpeech({ text, langName, onStart, onEnd, onError }: SpeakOptions) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const targetCodes = langCodeMap[langName] || ['en-IN', 'en-US'];

  const voices = window.speechSynthesis.getVoices();
  let matchedVoice = voices.find(v =>
    targetCodes.some(code => v.lang.toLowerCase() === code.toLowerCase() || v.lang.toLowerCase().replace('_', '-').startsWith(code.toLowerCase()))
  );

  if (!matchedVoice) {
    matchedVoice = voices.find(v => v.name.toLowerCase().includes(langName.toLowerCase()));
  }

  if (matchedVoice) {
    utterance.voice = matchedVoice;
    utterance.lang = matchedVoice.lang;
  } else {
    utterance.lang = targetCodes[0] || 'en-IN';
  }

  utterance.rate = 0.88;

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch {}
    activeAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
