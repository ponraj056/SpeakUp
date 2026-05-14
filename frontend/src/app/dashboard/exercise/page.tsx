"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Volume2, RotateCcw, Pause, ChevronRight, Mic } from "lucide-react";
import Link from "next/link";

export default function ExercisePage() {
  const [step, setStep] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const phrase = "Hello, Sir! Good Morning";
  const translation = "வணக்கம் ஐயா! காலை வணக்கம்";

  const handleMicClick = () => {
    setIsSpeaking(true);
    // Simulate speech recognition
    setTimeout(() => {
      setIsSpeaking(false);
      setIsCorrect(true);
      setFeedback("GREAT 🎉");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link href="/dashboard">
          <button className="p-2 rounded-full bg-white shadow-sm text-slate-400">
             <X className="w-5 h-5" />
          </button>
        </Link>
        <div className="flex-1 text-center font-black italic">Exercises for you</div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 border border-emerald-200">
           <Trophy className="w-4 h-4 text-emerald-500" />
           <span className="text-xs font-black text-emerald-600">+15 XP</span>
        </div>
      </header>

      {/* Progress Dots */}
      <div className="px-10 flex gap-2 justify-center py-4">
         {[1, 2, 3, 4, 5].map((s) => (
           <div key={s} className={`h-2 rounded-full transition-all ${s === step ? "w-8 bg-primary" : "w-2 bg-slate-200"}`} />
         ))}
      </div>

      {/* Main Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={phrase}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-sm aspect-[4/5] bg-white rounded-[3rem] shadow-2xl p-8 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden border-4 transition-colors ${
              isCorrect ? "border-emerald-500 shadow-emerald-500/20" : "border-transparent"
            }`}
          >
             <button className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Volume2 className="w-8 h-8" />
             </button>

             <div className="space-y-4">
                <h2 className={`text-4xl font-black leading-tight transition-colors ${isCorrect ? "text-emerald-600" : "text-slate-800"}`}>
                   {phrase}
                </h2>
                <p className="text-lg font-medium text-slate-300 italic">
                   {translation}
                </p>
             </div>

             {feedback && (
               <motion.div
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 className="text-3xl font-black text-emerald-500 tracking-widest animate-bounce"
               >
                 {feedback}
               </motion.div>
             )}

             {isSpeaking && (
                <div className="absolute inset-x-0 bottom-0 h-2 bg-slate-100">
                   <motion.div
                     initial={{ width: 0 }}
                     animate={{ width: "100%" }}
                     transition={{ duration: 2 }}
                     className="h-full bg-primary"
                   />
                </div>
             )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="p-10 space-y-8">
        <div className="flex items-center justify-center">
           <button
             onClick={handleMicClick}
             className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${
               isSpeaking ? "bg-red-500 scale-110" : "bg-primary"
             }`}
           >
              <Mic className="w-10 h-10 text-white" />
           </button>
        </div>

        <div className="flex items-center justify-between px-4">
           <button className="flex flex-col items-center gap-1 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                 <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase">Restart</span>
           </button>
           <button className="flex flex-col items-center gap-1 text-slate-400">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                 <Pause className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase">Pause</span>
           </button>
           <button 
             onClick={() => { setStep(s => s + 1); setIsCorrect(false); setFeedback(null); }}
             className="flex flex-col items-center gap-1 text-primary"
           >
              <div className="w-12 h-12 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white">
                 <ChevronRight className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase">Next</span>
           </button>
        </div>
      </div>
    </div>
  );
}
