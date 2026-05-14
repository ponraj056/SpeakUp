"use client";

import { motion } from "framer-motion";
import { Lock, BookOpen, CheckCircle, ChevronRight, BarChart2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const grammarTopics = [
  { name: "Tenses", progress: 45, icon: "⏳", color: "bg-blue-100" },
  { name: "Prepositions", progress: 12, icon: "📍", color: "bg-amber-100" },
  { name: "Determiners and Articles", progress: 0, icon: "📖", color: "bg-emerald-100" },
  { name: "Conjunctions", progress: 0, icon: "🔗", color: "bg-pink-100" },
  { name: "Nouns", progress: 80, icon: "🏷️", color: "bg-violet-100" },
  { name: "Agreement", progress: 0, icon: "🤝", color: "bg-cyan-100" },
  { name: "Adjectives", progress: 0, icon: "🎨", color: "bg-orange-100" },
  { name: "Adverbs", progress: 0, icon: "🏃", color: "bg-rose-100" },
  { name: "Pronouns", progress: 0, icon: "👤", color: "bg-teal-100" },
];

export default function ProgressPage() {
  const [tab, setTab] = useState<"grammar" | "vocabulary">("grammar");

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black italic">Progress Report</h1>
        <Link href="/dashboard/paywall">
          <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg shadow-primary/20">
            <Lock className="w-3 h-3" />
            Unlock with Pro
          </button>
        </Link>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-slate-100 rounded-2xl">
        <button
          onClick={() => setTab("grammar")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
            tab === "grammar" ? "bg-white text-primary shadow-sm" : "text-slate-400"
          }`}
        >
          Grammar (1020)
        </button>
        <button
          onClick={() => setTab("vocabulary")}
          className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
            tab === "vocabulary" ? "bg-white text-primary shadow-sm" : "text-slate-400"
          }`}
        >
          Vocabulary (500)
        </button>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {grammarTopics.map((topic) => (
          <div
            key={topic.name}
            className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4 group"
          >
            <div className={`w-12 h-12 rounded-2xl ${topic.color} flex items-center justify-center text-xl`}>
              {topic.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{topic.name}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                See progress with Pro
              </div>
            </div>
            <Link href="/dashboard/paywall">
              <button className="px-3 py-1.5 rounded-xl bg-slate-50 text-primary text-[10px] font-bold border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                See Details
              </button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
