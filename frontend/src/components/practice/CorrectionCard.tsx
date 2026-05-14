"use client";

import { motion } from "framer-motion";
import { Lightbulb, Volume2, Star, Mic, Play } from "lucide-react";
import { useState } from "react";

interface Correction {
  original: string;
  corrected: string;
  type: string;
  explanation: string;
  severity: "HIGH" | "MEDIUM";
}

interface CorrectionCardProps {
  correction: {
    score: number;
    betterWay: string;
    errors: Correction[];
  };
  onSave?: () => void;
  onRepeat?: () => void;
}

export function CorrectionCard({ correction, onSave, onRepeat }: CorrectionCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSlow, setIsSlow] = useState(false);

  const playTTS = (speed: number = 1) => {
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(correction.betterWay);
    utterance.rate = speed;
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 ml-11 max-w-[85%] bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 space-y-4"
    >
      {/* Better Way Header */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
            Better way to say this
          </div>
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
            {correction.betterWay}
          </p>
        </div>
      </div>

      {/* Errors Breakdown */}
      <div className="space-y-3 pl-11">
        {correction.errors.map((error, i) => (
          <div key={i} className="text-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="line-through text-red-500/70">{error.original}</span>
              <span className="text-emerald-600 font-bold">→ {error.corrected}</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 text-[9px] font-bold">
                {error.type}
              </span>
            </div>
            <p className="text-[hsl(var(--muted-foreground))]">{error.explanation}</p>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2 pl-11">
        <button
          onClick={() => playTTS(1)}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors group"
          title="Play at normal speed"
        >
          <Volume2 className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]" />
        </button>
        <button
          onClick={() => playTTS(0.5)}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors group text-[9px] font-bold text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
          title="Play at 0.5x speed"
        >
          0.5x
        </button>
        <button
          onClick={onRepeat}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors group"
          title="Practice pronunciation"
        >
          <Mic className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-blue-500" />
        </button>
        <div className="flex-1" />
        <button
          onClick={onSave}
          className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors group"
          title="Save to Mistake Notebook"
        >
          <Star className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-amber-500" />
        </button>
      </div>
    </motion.div>
  );
}
