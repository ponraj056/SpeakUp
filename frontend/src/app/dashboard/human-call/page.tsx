"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MicOff, Volume2, PhoneOff, User, Sparkles, Star, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CorrectionCard } from "@/components/practice/CorrectionCard";

export default function HumanCallScreen() {
  const [phase, setPhase] = useState<"matching" | "connected" | "summary">("matching");
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);

  useEffect(() => {
    if (phase === "matching") {
      const t = setTimeout(() => setPhase("connected"), 4000);
      return () => clearTimeout(t);
    }
    if (phase === "connected") {
      const interval = setInterval(() => setTimer(s => s + 1), 1000);
      const correctionT = setTimeout(() => setShowCorrection(true), 8000);
      return () => {
        clearInterval(interval);
        clearTimeout(correctionT);
      };
    }
  }, [phase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col overflow-hidden">
      
      {/* ── PHASE: MATCHING ── */}
      <AnimatePresence>
        {phase === "matching" && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-12"
          >
            <div className="relative">
              <div className="w-48 h-48 rounded-full border-2 border-primary/20 animate-pulse flex items-center justify-center">
                 <div className="w-32 h-32 rounded-full border-2 border-primary/40 animate-ping flex items-center justify-center" />
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0"
              >
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary border-4 border-slate-950 flex items-center justify-center text-white font-black">A</div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-rose-500 border-4 border-slate-950" />
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-950" />
              </motion.div>
            </div>
            <div className="space-y-2">
               <h1 className="text-3xl font-black italic text-white">Finding a partner...</h1>
               <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Wait for 10 seconds</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE: CONNECTED ── */}
      {phase === "connected" && (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-8 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black">S</div>
                <div className="space-y-0.5">
                   <div className="text-sm font-black text-white">Sara L.</div>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                   </div>
                </div>
             </div>
             <div className="px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-md text-white font-black italic text-sm tabular-nums">
                {formatTime(timer)}
             </div>
          </div>

          {/* Video / Avatar Area */}
          <div className="flex-1 flex items-center justify-center p-8">
             <div className="relative">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-7xl font-black shadow-2xl shadow-primary/20 border-8 border-white/5">
                   S
                </div>
                <div className="absolute -bottom-4 -right-4 w-24 h-32 rounded-3xl bg-slate-900 border-2 border-white/10 overflow-hidden shadow-2xl">
                   <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <User className="w-8 h-8 text-slate-600" />
                   </div>
                </div>
             </div>
          </div>

          {/* Live Correction Popup */}
          <AnimatePresence>
            {showCorrection && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="px-6 mb-8"
              >
                 <CorrectionCard 
                    correction={{
                      score: 75,
                      betterWay: "I've been learning English for three years.",
                      errors: [{ 
                        original: "i learn english", 
                        corrected: "I've been learning English", 
                        type: "Verb Tense", 
                        explanation: "Use present perfect continuous for ongoing duration.",
                        severity: "HIGH" 
                      }]
                    }}
                    onSave={() => setShowCorrection(false)}
                 />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="p-12 flex items-center justify-center gap-8">
             <button onClick={() => setIsMuted(!isMuted)} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isMuted ? "bg-rose-500 text-white" : "bg-white/10 text-white"}`}>
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
             </button>
             <button onClick={() => setPhase("summary")} className="w-20 h-20 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-2xl shadow-rose-500/20">
                <PhoneOff className="w-8 h-8" />
             </button>
             <button className="w-16 h-16 rounded-full bg-white/10 text-white flex items-center justify-center">
                <Volume2 className="w-6 h-6" />
             </button>
          </div>
        </div>
      )}

      {/* ── PHASE: SUMMARY ── */}
      {phase === "summary" && (
        <div className="flex-1 bg-white p-8 overflow-y-auto">
           <div className="text-center space-y-6 pt-12 pb-8">
              <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-500">
                 <Sparkles className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                 <h1 className="text-3xl font-black italic">Great Practice!</h1>
                 <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">You earned +50 XP and 15 Trophies</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-1">
                 <div className="text-3xl font-black text-primary">82%</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fluency</div>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center space-y-1">
                 <div className="text-3xl font-black text-primary">04:20</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</div>
              </div>
           </div>

           <div className="space-y-4">
              <h2 className="text-xs font-black text-primary uppercase tracking-widest">Rate Partner</h2>
              <div className="flex justify-between px-4">
                 {[1,2,3,4,5].map(i => <Star key={i} className="w-10 h-10 text-slate-200" />)}
              </div>
              
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center justify-between mt-8">
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-black text-lg">S</div>
                    <div className="space-y-0.5">
                       <div className="text-sm font-black">Add Sara L. as friend?</div>
                       <div className="text-[10px] font-medium text-slate-400">Message her anytime</div>
                    </div>
                 </div>
                 <ChevronRight className="w-6 h-6 text-primary" />
              </div>

              <Link href="/dashboard" className="block pt-8">
                 <button className="w-full py-5 rounded-[2rem] bg-primary text-white font-black text-lg shadow-xl shadow-primary/30">
                    Back to Home
                 </button>
              </Link>
           </div>
        </div>
      )}
    </div>
  );
}
