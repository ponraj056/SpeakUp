"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2, Play, Trophy, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const words = [
  { id: 1, word: "Enthusiastic", used: 1, goal: 3, phoneme: "/ɪnˈθuːziˌæstɪk/", def: "Having or showing intense and eager enjoyment, interest, or approval.", example: "She was enthusiastic about her new job.", color: "bg-blue-500" },
  { id: 2, word: "Collaborate", used: 2, goal: 3, phoneme: "/kəˈlæbəˌreɪt/", def: "Work jointly on an activity or project.", example: "Let's collaborate on the upcoming presentation.", color: "bg-rose-500" },
  { id: 3, word: "Persistent", used: 0, goal: 3, phoneme: "/pərˈsɪstənt/", def: "Continuing firmly or obstinately in a course of action in spite of difficulty.", example: "His persistent efforts finally paid off.", color: "bg-amber-500" },
];

export default function WordsOverlay({ onClose }: { onClose: () => void }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white rounded-t-[3rem] p-8 pb-12 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
           <div className="space-y-1">
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Words of the Day</h2>
              <h1 className="text-2xl font-black italic">Daily Challenge</h1>
           </div>
           <button onClick={onClose} className="p-3 rounded-full bg-slate-100 text-slate-400">
              <X className="w-6 h-6" />
           </button>
        </div>

        {/* Word Cards */}
        <div className="space-y-4">
           {words.map((w) => (
             <div 
               key={w.id} 
               onClick={() => setExpandedId(expandedId === w.id ? null : w.id)}
               className="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden transition-all cursor-pointer"
             >
                <div className="p-5 flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-2xl ${w.color} flex items-center justify-center text-white font-black`}>
                      {w.id}
                   </div>
                   <div className="flex-1">
                      <div className="text-lg font-black">{w.word}</div>
                      <div className="flex items-center gap-2 mt-1">
                         <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${w.color} transition-all duration-1000`} 
                              style={{ width: `${(w.used / w.goal) * 100}%` }} 
                            />
                         </div>
                         <span className="text-[10px] font-bold text-slate-400">{w.used}/{w.goal}</span>
                      </div>
                   </div>
                   <span className="text-xs font-medium text-slate-300">{w.phoneme}</span>
                </div>

                <AnimatePresence>
                   {expandedId === w.id && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="px-5 pb-5 space-y-4"
                     >
                        <div className="h-px bg-slate-200/50" />
                        <p className="text-sm text-slate-600 leading-relaxed">{w.def}</p>
                        <div className="p-4 rounded-2xl bg-white border border-slate-100 text-sm italic text-slate-500">
                           &quot;{w.example}&quot;
                        </div>
                        <button className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                           <Volume2 className="w-4 h-4" />
                           Listen Pronunciation
                        </button>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
           ))}
        </div>

        {/* Action */}
        <div className="mt-10 space-y-4">
           <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase tracking-widest">
                 Use these words in AI practice to win 50 trophies each!
              </p>
           </div>
           <Link href="/dashboard/ai-practice">
              <button className="w-full py-5 rounded-[2rem] bg-primary text-white font-black text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3">
                 <Play className="w-5 h-5 fill-white" />
                 Start AI Practice
              </button>
           </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
