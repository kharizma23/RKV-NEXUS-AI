'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Square, CheckCircle2, Globe, AlertCircle, RotateCcw, Volume2 } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptionComplete?: (text: string) => void;
}

export function VoiceRecorder({ onTranscriptionComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ta' | 'hi'>('en');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRecordingRef = useRef<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const hasErrorRef = useRef<boolean>(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      hasErrorRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const startRecording = async () => {
    setErrorMessage(null);
    setLiveTranscript('');
    setTranscribedText('');
    finalTranscriptRef.current = '';
    hasErrorRef.current = false;

    // Check browser support for SpeechRecognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage(
        'Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.'
      );
      return;
    }

    // 1. Request microphone permission first and immediately release probe stream
    try {
      const probeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      probeStream.getTracks().forEach((track) => track.stop());
    } catch (err: any) {
      setErrorMessage(
        'Microphone access denied. Please click the camera/lock icon in your browser address bar to allow microphone permissions.'
      );
      return;
    }

    // Stop any existing instance before starting a new one
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // Set recognition language
      if (language === 'ta') {
        recognition.lang = 'ta-IN';
      } else if (language === 'hi') {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-US';
      }

      recognition.onstart = () => {
        setIsRecording(true);
        isRecordingRef.current = true;
        hasErrorRef.current = false;
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript + ' ';
          } else {
            interim += item[0].transcript;
          }
        }

        if (final) {
          finalTranscriptRef.current = (
            finalTranscriptRef.current +
            ' ' +
            final
          ).trim();
        }

        const fullSpoken = (
          finalTranscriptRef.current +
          (interim ? ' ' + interim : '')
        ).trim();

        setLiveTranscript(fullSpoken);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error event:', event.error);
        hasErrorRef.current = true;
        isRecordingRef.current = false;
        setIsRecording(false);

        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access blocked. Please allow microphone access in browser address bar permissions.');
        } else if (event.error === 'network') {
          setErrorMessage(
            'Speech recognition network notice: The browser speech service (Google Cloud Speech) could not be reached. If you are using Brave Browser, please enable "Use Google Services for speech recognition" in Brave Settings -> Privacy & Security, or use Google Chrome / Edge. You can also type your answer directly in the text box.'
          );
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Speech recognition notice: ${event.error}. You can retry or type your answer directly.`);
        }
      };

      recognition.onend = () => {
        // Only restart if the user is still actively recording and no error was flagged
        if (isRecordingRef.current && !hasErrorRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or busy
          }
        } else {
          setIsRecording(false);
          isRecordingRef.current = false;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error('Failed to initialize SpeechRecognition:', e);
      setErrorMessage(e?.message || 'Failed to start speech recognition.');
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopRecording = () => {
    isRecordingRef.current = false;
    hasErrorRef.current = true;
    setIsRecording(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    const recordedWords = (finalTranscriptRef.current || liveTranscript).trim();
    if (recordedWords) {
      setTranscribedText(recordedWords);
      if (onTranscriptionComplete) {
        onTranscriptionComplete(recordedWords);
      }
    }
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card className="border border-indigo-500/30 bg-slate-900/60 shadow-lg text-slate-100">
      <CardHeader className="pb-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-indigo-400" /> Voice-Based Answer Dictation (Speech-to-Text)
          </CardTitle>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              disabled={isRecording}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="text-[11px] bg-slate-950 border border-slate-700 text-slate-200 rounded px-2 py-0.5 font-bold focus:outline-none focus:border-indigo-500"
            >
              <option value="en">English (Global / US)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-xl bg-slate-950/60 gap-3 transition-colors">
          <button
            type="button"
            onClick={handleToggle}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-95 ${
              isRecording
                ? 'bg-rose-600 animate-pulse ring-4 ring-rose-500/40'
                : 'bg-indigo-600 hover:bg-indigo-700 ring-2 ring-indigo-400/30'
            }`}
          >
            {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <div className="text-center space-y-1">
            <p className="text-xs font-bold text-slate-200">
              {isRecording
                ? 'Recording your voice... Click Stop when finished speaking.'
                : 'Click microphone to record your voice answer.'}
            </p>
            {isRecording && (
              <p className="text-[10px] text-rose-400 font-bold flex items-center justify-center gap-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Listening in {language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'}
              </p>
            )}
          </div>

          {/* Live speech preview while speaking */}
          {isRecording && liveTranscript && (
            <div className="w-full max-w-lg mt-2 p-3 bg-slate-900 border border-indigo-500/40 rounded-lg text-left">
              <span className="text-[9px] uppercase font-bold text-indigo-400 block mb-1">Live Speech Transcribing:</span>
              <p className="text-xs font-mono text-slate-200 italic leading-relaxed">
                "{liveTranscript}"
              </p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-xs text-rose-300 font-medium space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="flex-1 leading-snug">{errorMessage}</span>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setErrorMessage(null)}
                className="text-[10px] h-7 px-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Dismiss Notice
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={startRecording}
                className="text-[10px] h-7 px-2.5 bg-slate-900 border-rose-800 text-rose-200 hover:bg-rose-900/50 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Retry Recording
              </Button>
            </div>
          </div>
        )}

        {transcribedText && (
          <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Voice Transcribed & Inserted Into Answer
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                Speech-to-Text
              </span>
            </div>
            <p className="text-xs text-slate-200 font-mono leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800">
              "{transcribedText}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
