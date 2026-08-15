import React, { useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceMicInputProps {
  onTranscript: (text: string) => void;
  lang?: string;
}

export const VoiceMicInput: React.FC<VoiceMicInputProps> = ({ onTranscript, lang = 'en-IN' }) => {
  const [isListening, setIsListening] = useState(false);

  const toggleListening = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
        isListening
          ? 'bg-rose-600 text-white animate-pulse shadow-md'
          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
      }`}
      title="Speak your question using microphone"
    >
      {isListening ? (
        <>
          <MicOff className="w-3.5 h-3.5 text-white" />
          <span>Listening...</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-[#C9A24B]" />
          <span>🎤 Speak Question</span>
        </>
      )}
    </button>
  );
};
