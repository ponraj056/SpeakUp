"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Play,
  Square,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

const SAMPLE_PHRASES = [
  { id: 1, text: "The weather is beautiful today", level: "A1", category: "General" },
  { id: 2, text: "I would like to make a reservation", level: "A2", category: "Restaurant" },
  { id: 3, text: "Could you tell me how to get to the station?", level: "B1", category: "Travel" },
  { id: 4, text: "I think we should consider the alternatives", level: "B2", category: "Business" },
  { id: 5, text: "The three brothers thought thoroughly about their theory", level: "B1", category: "Th sound" },
  { id: 6, text: "She sells seashells by the seashore", level: "B2", category: "S/Sh sounds" },
  { id: 7, text: "I really appreciate your recommendation", level: "B1", category: "R sound" },
  { id: 8, text: "Very well, I believe every variable varies", level: "B2", category: "V/B sounds" },
  { id: 9, text: "The photograph of the philosopher is phenomenal", level: "C1", category: "Ph/F sounds" },
  { id: 10, text: "Would you mind opening the window?", level: "A2", category: "Polite requests" },
];

export default function PronunciationPage() {
  const [selectedPhrase, setSelectedPhrase] = useState(SAMPLE_PHRASES[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [audioVisualization, setAudioVisualization] = useState<number[]>(new Array(40).fill(2));
  const [drillCount, setDrillCount] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const calculateScore = useCallback((userText: string, targetText: string): number => {
    const userWords = userText.toLowerCase().split(/\s+/).filter(Boolean);
    const targetWords = targetText.toLowerCase().split(/\s+/).filter(Boolean);

    let matchCount = 0;
    for (let i = 0; i < targetWords.length; i++) {
      if (userWords[i] === targetWords[i]) {
        matchCount++;
      } else if (userWords[i]) {
        // Partial match - check Levenshtein-like similarity
        const similarity = stringSimilarity(userWords[i], targetWords[i]);
        if (similarity > 0.7) matchCount += similarity;
      }
    }

    return Math.round((matchCount / targetWords.length) * 100);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    recognitionRef.current?.stop();
    mediaRecorderRef.current?.stop();
    cancelAnimationFrame(animationRef.current);
    setAudioVisualization(new Array(40).fill(2));
  }, []);

  const visualize = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const bars = 40;
    const step = Math.floor(dataArray.length / bars);
    const visualization = Array.from({ length: bars }, (_, i) => {
      const value = dataArray[i * step];
      return Math.max(2, (value / 255) * 60);
    });

    setAudioVisualization(visualization);
    animationRef.current = requestAnimationFrame(visualize);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Audio visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();

      // Speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const result = Array.from(event.results)
            .map((r) => r[0].transcript)
            .join("");
          setTranscript(result);
        };

        recognition.onend = () => {
          if (isRecording) stopRecording();
        };

        recognitionRef.current = recognition;
        recognition.start();
      }

      setIsRecording(true);
      setShowResult(false);
      setTranscript("");
      visualize();

      // Auto-stop after 15 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          stopRecording();
        }
      }, 15000);
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  useEffect(() => {
    if (!isRecording && transcript) {
      const newScore = calculateScore(transcript, selectedPhrase.text);
      setScore(newScore);
      setShowResult(true);
      setDrillCount((c) => c + 1);
      if (newScore > bestScore) setBestScore(newScore);
    }
  }, [isRecording, transcript, selectedPhrase.text, calculateScore, bestScore]);

  const playReference = () => {
    const utterance = new SpeechSynthesisUtterance(selectedPhrase.text);
    utterance.rate = 0.85;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-400";
    if (s >= 60) return "text-amber-400";
    return "text-red-400";
  };

  const getScoreLabel = (s: number) => {
    if (s >= 90) return "Excellent!";
    if (s >= 80) return "Great job!";
    if (s >= 60) return "Good effort!";
    if (s >= 40) return "Keep practicing";
    return "Try again";
  };

  const getWordComparison = () => {
    const targetWords = selectedPhrase.text.toLowerCase().split(/\s+/);
    const userWords = transcript.toLowerCase().split(/\s+/);

    return targetWords.map((word, i) => {
      const userWord = userWords[i]?.toLowerCase();
      const match = userWord === word;
      const partial = userWord && stringSimilarity(userWord, word) > 0.7;

      return { target: word, user: userWord || "—", match, partial };
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Pronunciation Lab</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Record yourself speaking, compare with native pronunciation, and get detailed feedback.
        </p>
      </div>

      {/* Phrase Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {SAMPLE_PHRASES.map((phrase) => (
          <button
            key={phrase.id}
            onClick={() => {
              setSelectedPhrase(phrase);
              setShowResult(false);
              setTranscript("");
              setScore(null);
              setDrillCount(0);
              setBestScore(0);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              selectedPhrase.id === phrase.id
                ? "bg-violet-500/10 text-violet-400 border border-violet-500/30"
                : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
            }`}
          >
            {phrase.category}
          </button>
        ))}
      </div>

      {/* Target Phrase Card */}
      <motion.div
        layout
        className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
            TARGET PHRASE · {selectedPhrase.level}
          </span>
          <button
            onClick={playReference}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] text-xs font-medium hover:bg-violet-500/10 hover:text-violet-400 transition-all"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Listen
          </button>
        </div>
        <p className="text-xl lg:text-2xl font-medium leading-relaxed">
          &ldquo;{selectedPhrase.text}&rdquo;
        </p>
      </motion.div>

      {/* Waveform + Recording */}
      <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
        {/* Waveform Display */}
        <div className="flex items-end justify-center gap-[3px] h-16 mb-6">
          {audioVisualization.map((height, i) => (
            <motion.div
              key={i}
              className={`w-1.5 rounded-full ${
                isRecording
                  ? "bg-gradient-to-t from-violet-500 to-indigo-400"
                  : "bg-[hsl(var(--muted-foreground))]"
              }`}
              animate={{ height }}
              transition={{ duration: 0.1 }}
              style={{ opacity: isRecording ? 1 : 0.2 }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-shadow"
            >
              <Mic className="w-7 h-7" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/25 animate-pulse"
            >
              <Square className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {isRecording && (
          <p className="text-center text-sm text-[hsl(var(--muted-foreground))] mt-3 animate-pulse">
            Listening... Speak the phrase above
          </p>
        )}

        {/* Live Transcript */}
        {transcript && !showResult && (
          <div className="mt-4 p-3 rounded-xl bg-[hsl(var(--muted))] text-sm">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))] block mb-1">YOUR SPEECH</span>
            {transcript}
          </div>
        )}
      </div>

      {/* Results */}
      <AnimatePresence>
        {showResult && score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Score */}
            <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-center">
              <div className={`text-5xl font-bold ${getScoreColor(score)} mb-2`}>
                {score}
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                {getScoreLabel(score)}
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
                <span>Attempts: {drillCount}</span>
                <span>Best: {bestScore}%</span>
              </div>
            </div>

            {/* Word-by-word Comparison */}
            <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
              <h3 className="text-sm font-medium mb-4">Word-by-Word Analysis</h3>
              <div className="flex flex-wrap gap-2">
                {getWordComparison().map((word, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                      word.match
                        ? "bg-emerald-500/10 text-emerald-400"
                        : word.partial
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {word.match ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : word.partial ? (
                      <AlertTriangle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {word.target}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResult(false);
                  setTranscript("");
                  setScore(null);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => {
                  const nextIdx = SAMPLE_PHRASES.findIndex((p) => p.id === selectedPhrase.id) + 1;
                  if (nextIdx < SAMPLE_PHRASES.length) {
                    setSelectedPhrase(SAMPLE_PHRASES[nextIdx]);
                    setShowResult(false);
                    setTranscript("");
                    setScore(null);
                    setDrillCount(0);
                    setBestScore(0);
                  }
                }}
                className="flex-1 py-3 rounded-xl border border-[hsl(var(--border))] font-medium hover:bg-[hsl(var(--muted))] transition-colors flex items-center justify-center gap-2"
              >
                Next Phrase
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Simple string similarity (Dice coefficient) */
function stringSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const bigram = a.substring(i, i + 2);
    bigrams.set(bigram, (bigrams.get(bigram) || 0) + 1);
  }

  let intersect = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bigram = b.substring(i, i + 2);
    const count = bigrams.get(bigram) || 0;
    if (count > 0) {
      bigrams.set(bigram, count - 1);
      intersect++;
    }
  }

  return (2 * intersect) / (a.length + b.length - 2);
}
