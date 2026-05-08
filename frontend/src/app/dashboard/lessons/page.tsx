"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Clock, Zap, Filter, Search, ChevronRight, GraduationCap, Mic, BookMarked, MessageSquare } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All", icon: BookOpen },
  { id: "GRAMMAR", label: "Grammar", icon: GraduationCap },
  { id: "PRONUNCIATION", label: "Pronunciation", icon: Mic },
  { id: "VOCABULARY", label: "Vocabulary", icon: BookMarked },
  { id: "SPEAKING_SKILLS", label: "Speaking", icon: MessageSquare },
];
const LEVELS = ["All", "A1", "A2", "B1", "B2", "C1"];
const catGradients: Record<string, string> = { GRAMMAR: "from-blue-500 to-indigo-600", PRONUNCIATION: "from-rose-500 to-pink-600", VOCABULARY: "from-emerald-500 to-teal-600", SPEAKING_SKILLS: "from-amber-500 to-orange-600" };

const LESSONS = [
  { id: "1", title: "Present Simple vs Continuous", slug: "present-simple", category: "GRAMMAR", level: "A2", dur: 420, premium: false, xp: 15, status: "COMPLETED", score: 85 },
  { id: "2", title: "The 'TH' Sound Mastery", slug: "th-sound", category: "PRONUNCIATION", level: "A2", dur: 360, premium: false, xp: 10, status: "IN_PROGRESS", score: null },
  { id: "3", title: "Essential Travel Vocabulary", slug: "travel-vocab", category: "VOCABULARY", level: "A1", dur: 300, premium: false, xp: 10, status: "NOT_STARTED", score: null },
  { id: "4", title: "Making Small Talk", slug: "small-talk", category: "SPEAKING_SKILLS", level: "B1", dur: 480, premium: false, xp: 20, status: "NOT_STARTED", score: null },
  { id: "5", title: "Past Perfect & Narratives", slug: "past-perfect", category: "GRAMMAR", level: "B1", dur: 420, premium: false, xp: 20, status: "NOT_STARTED", score: null },
  { id: "6", title: "Connected Speech & Linking", slug: "connected-speech", category: "PRONUNCIATION", level: "B2", dur: 360, premium: false, xp: 25, status: "NOT_STARTED", score: null },
  { id: "7", title: "Business Idioms", slug: "business-idioms", category: "VOCABULARY", level: "B2", dur: 480, premium: false, xp: 25, status: "NOT_STARTED", score: null },
  { id: "8", title: "Intonation in Questions", slug: "intonation", category: "SPEAKING_SKILLS", level: "B1", dur: 360, premium: false, xp: 15, status: "NOT_STARTED", score: null },
  { id: "9", title: "Conditional Sentences", slug: "conditionals", category: "GRAMMAR", level: "B2", dur: 540, premium: false, xp: 30, status: "NOT_STARTED", score: null },
  { id: "10", title: "Vowel Sounds: Ship vs Sheep", slug: "vowel-sounds", category: "PRONUNCIATION", level: "A1", dur: 300, premium: false, xp: 10, status: "COMPLETED", score: 92 },
  { id: "11", title: "Phrasal Verbs for Daily Life", slug: "phrasal-verbs", category: "VOCABULARY", level: "B1", dur: 420, premium: false, xp: 20, status: "NOT_STARTED", score: null },
  { id: "12", title: "Modal Verbs for Politeness", slug: "modals-polite", category: "GRAMMAR", level: "A2", dur: 360, premium: false, xp: 15, status: "NOT_STARTED", score: null },
];

export default function LessonsPage() {
  const [cat, setCat] = useState("all");
  const [level, setLevel] = useState("All");
  const [q, setQ] = useState("");
  const list = LESSONS.filter((l) => {
    if (cat !== "all" && l.category !== cat) return false;
    if (level !== "All" && l.level !== level) return false;
    if (q && !l.title.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const done = LESSONS.filter((l) => l.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Lessons</h1>
          <p className="text-[hsl(var(--muted-foreground))] mt-1">{done}/{LESSONS.length} completed</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <input type="text" placeholder="Search lessons..." value={q} onChange={(e) => setQ(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${cat === c.id ? "bg-violet-500/10 text-violet-400 border border-violet-500/30" : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"}`}>
            <c.icon className="w-4 h-4" />{c.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
        <span className="text-xs text-[hsl(var(--muted-foreground))]">Level:</span>
        {LEVELS.map((lv) => (<button key={lv} onClick={() => setLevel(lv)} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${level === lv ? "bg-violet-500/10 text-violet-400" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"}`}>{lv}</button>))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((lesson, i) => {
          const grad = catGradients[lesson.category] || "from-violet-500 to-indigo-600";
          const Icon = CATEGORIES.find((c) => c.id === lesson.category)?.icon || BookOpen;
          return (
            <motion.div key={lesson.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/dashboard/lessons/${lesson.slug}`}>
                <div className="group p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] card-hover relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}><Icon className="w-5 h-5 text-white" /></div>
                  <h3 className="font-semibold text-sm mb-2 pr-12 line-clamp-2">{lesson.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                    <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] font-medium">{lesson.level}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.round(lesson.dur / 60)}m</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-400" />{lesson.xp} XP</span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[hsl(var(--border))] flex items-center justify-between">
                    {lesson.status === "COMPLETED" ? <><span className="text-xs text-emerald-400 font-medium">✓ Completed</span><span className="text-xs text-[hsl(var(--muted-foreground))]">{lesson.score}%</span></> : lesson.status === "IN_PROGRESS" ? <><span className="text-xs text-amber-400 font-medium">In Progress</span><ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:translate-x-1 transition-transform" /></> : <><span className="text-xs text-[hsl(var(--muted-foreground))]">Not started</span><ChevronRight className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:translate-x-1 transition-transform" /></>}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
      {list.length === 0 && <div className="text-center py-12 text-[hsl(var(--muted-foreground))]"><BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No lessons match your filters.</p></div>}
    </div>
  );
}
