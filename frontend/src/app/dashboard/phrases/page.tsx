"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { LibraryBig, Search, Volume2, Bookmark, Star, Filter } from "lucide-react";

const SITUATIONS = ["All", "Airport", "Restaurant", "Hotel", "Shopping", "Doctor", "Interview", "Phone", "Social", "Travel", "Meeting"];
const FORMALITIES = ["All", "Casual", "Professional", "Formal"];

const PHRASES = [
  { id: "1", text: "Could I have the bill, please?", situation: "Restaurant", formality: "Professional", level: "A2", note: "Use 'check' in American English" },
  { id: "2", text: "I'd like to check in, please.", situation: "Hotel", formality: "Professional", level: "A1", note: "Standard hotel check-in phrase" },
  { id: "3", text: "Where's the nearest ATM?", situation: "Travel", formality: "Casual", level: "A1", note: "Also: 'cash machine' in British English" },
  { id: "4", text: "I'm afraid I have a complaint.", situation: "Hotel", formality: "Formal", level: "B1", note: "Polite way to introduce a problem" },
  { id: "5", text: "Could you tell me the way to...?", situation: "Travel", formality: "Professional", level: "A2", note: "More polite than 'Where is...?'" },
  { id: "6", text: "I've been experiencing some discomfort.", situation: "Doctor", formality: "Professional", level: "B1", note: "Medical consultation starter" },
  { id: "7", text: "What would you recommend?", situation: "Restaurant", formality: "Casual", level: "A2", note: "Great for asking waiter's suggestions" },
  { id: "8", text: "I'd like to try this on.", situation: "Shopping", formality: "Casual", level: "A1", note: "When you want to try clothes" },
  { id: "9", text: "My flight has been delayed.", situation: "Airport", formality: "Professional", level: "A2", note: "Useful at the airline desk" },
  { id: "10", text: "Let me walk you through the agenda.", situation: "Meeting", formality: "Professional", level: "B2", note: "Opening a business meeting" },
  { id: "11", text: "I'm calling regarding...", situation: "Phone", formality: "Formal", level: "B1", note: "Professional phone call opener" },
  { id: "12", text: "What do you do for fun?", situation: "Social", formality: "Casual", level: "A1", note: "Great small talk question" },
  { id: "13", text: "Could you put me through to...?", situation: "Phone", formality: "Formal", level: "B1", note: "Asking to be transferred" },
  { id: "14", text: "I believe I'm well-suited for this role.", situation: "Interview", formality: "Formal", level: "B2", note: "Strong interview statement" },
  { id: "15", text: "It's on the house.", situation: "Restaurant", formality: "Casual", level: "B1", note: "Means 'it's free'" },
  { id: "16", text: "Do you have this in a different size?", situation: "Shopping", formality: "Casual", level: "A2", note: "Common shopping phrase" },
];

export default function PhrasesPage() {
  const [situation, setSituation] = useState("All");
  const [formality, setFormality] = useState("All");
  const [search, setSearch] = useState("");
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const filtered = PHRASES.filter((p) => {
    if (situation !== "All" && p.situation !== situation) return false;
    if (formality !== "All" && p.formality !== formality) return false;
    if (search && !p.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleBookmark = (id: string) => {
    const next = new Set(bookmarked);
    next.has(id) ? next.delete(id) : next.add(id);
    setBookmarked(next);
  };

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  const formalityColors: Record<string, string> = { Casual: "text-emerald-400 bg-emerald-500/10", Professional: "text-blue-400 bg-blue-500/10", Formal: "text-violet-400 bg-violet-500/10" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Phrasebook</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">{PHRASES.length} phrases for real-world situations</p>
      </div>

      {/* Phrase of the Day */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-500/10 via-[hsl(var(--card))] to-cyan-500/10 border border-[hsl(var(--border))]">
        <div className="flex items-center gap-2 mb-2"><Star className="w-4 h-4 text-amber-400" /><span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">PHRASE OF THE DAY</span></div>
        <p className="text-lg font-medium">&ldquo;Let me walk you through the agenda.&rdquo;</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">Used to introduce the plan for a meeting. Professional context.</p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" /><input type="text" placeholder="Search phrases..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SITUATIONS.map((s) => (<button key={s} onClick={() => setSituation(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${situation === s ? "bg-violet-500/10 text-violet-400 border border-violet-500/30" : "bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"}`}>{s}</button>))}
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
          {FORMALITIES.map((f) => (<button key={f} onClick={() => setFormality(f)} className={`px-3 py-1 rounded-lg text-xs font-medium ${formality === f ? "bg-violet-500/10 text-violet-400" : "text-[hsl(var(--muted-foreground))]"}`}>{f}</button>))}
        </div>
      </div>

      {/* Phrases */}
      <div className="space-y-3">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))] transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-sm">&ldquo;{p.text}&rdquo;</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{p.note}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[10px] font-medium">{p.level}</span>
                  <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-[10px] font-medium">{p.situation}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${formalityColors[p.formality] || ""}`}>{p.formality}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => speak(p.text)} className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:text-violet-400"><Volume2 className="w-4 h-4" /></button>
                <button onClick={() => toggleBookmark(p.id)} className={`p-1.5 rounded-lg hover:bg-[hsl(var(--muted))] ${bookmarked.has(p.id) ? "text-amber-400" : "text-[hsl(var(--muted-foreground))]"}`}><Bookmark className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-[hsl(var(--muted-foreground))]"><LibraryBig className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No phrases found.</p></div>}
    </div>
  );
}
