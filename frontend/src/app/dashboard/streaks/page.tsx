"use client";

import { motion } from "framer-motion";
import { Flame, X, Shield, Calendar as CalendarIcon, Info } from "lucide-react";
import { useState } from "react";

export default function StreaksPage() {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="space-y-6 pb-10">
      {/* ── STREAK HERO ── */}
      <div className="flex flex-col items-center justify-center pt-8 pb-4">
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-[120px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-orange-600"
          >
            0
          </motion.div>
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-4 -right-12 text-7xl"
          >
            🔥
          </motion.div>
        </div>
        <div className="text-xl font-black text-slate-400 uppercase tracking-[0.2em] -mt-4">
           Day Streak
        </div>
      </div>

      {/* ── TODAY'S GOAL ── */}
      <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="font-black italic">Today&apos;s Goal</h3>
           <span className="text-sm font-black text-amber-500">3 / 5 Mins</span>
        </div>
        <div className="h-4 rounded-full bg-slate-100 overflow-hidden">
           <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 w-[60%]" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase text-center tracking-widest">
           Practice 2 more minutes to keep your streak!
        </p>
      </div>

      {/* ── TOOLTIP ── */}
      {showTooltip && (
        <div className="p-4 rounded-2xl bg-slate-800 text-white relative">
          <button 
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white"
          >
             <X className="w-4 h-4" />
          </button>
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
             </div>
             <p className="text-xs leading-relaxed">
                A streak is the number of consecutive days you&apos;ve completed a 5-minute practice. Keep it going to win badges!
             </p>
          </div>
        </div>
      )}

      {/* ── ACTION CARDS ── */}
      <div className="grid grid-cols-2 gap-4">
         <div className="p-5 rounded-3xl bg-amber-50 border border-amber-100 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-200">
               <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs font-black text-amber-900 leading-tight">Accept Streak Challenge</div>
            <div className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">7 Day Fire Icon</div>
         </div>
         <div className="p-5 rounded-3xl bg-indigo-50 border border-indigo-100 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
               <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-xs font-black text-indigo-900 leading-tight">2/2 Streak Savers</div>
            <div className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Auto Protect</div>
         </div>
      </div>

      {/* ── CALENDAR ── */}
      <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
         <div className="flex items-center justify-between mb-6">
            <div className="font-black italic text-lg">May 2026</div>
            <CalendarIcon className="w-5 h-5 text-slate-300" />
         </div>
         <div className="grid grid-cols-7 gap-y-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-slate-300">{d}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className="flex items-center justify-center">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i + 1 === 14 ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" : "text-slate-600"}`}>
                    {i + 1}
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
