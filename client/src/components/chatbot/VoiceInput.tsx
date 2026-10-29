'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { SupportedLanguage } from './LanguageSelector';

interface VoiceInputProps {
  language: SupportedLanguage;
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ language, onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    // Set voice recognition language
    if (language === 'ta') {
      recognition.lang = 'ta-IN';
    } else if (language === 'hi') {
      recognition.lang = 'hi-IN';
    } else {
      recognition.lang = 'en-US';
    }

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (text) {
        onTranscript(text);
      }
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
    };
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!isSupported) {
      alert('Voice input is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (_) {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error('Failed to start speech recognition', err);
        setIsListening(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      disabled={disabled}
      className={`relative p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center ${
        isListening
          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105 animate-pulse'
          : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/80'
      } disabled:opacity-50 disabled:pointer-events-none`}
      title={isListening ? 'Listening... Speak now (Click to stop)' : 'Speak your question (Voice Input)'}
    >
      {isListening ? (
        <>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" />
          <Mic className="w-4 h-4" />
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
