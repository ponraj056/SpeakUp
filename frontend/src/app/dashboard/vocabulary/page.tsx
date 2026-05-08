"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookMarked, Plus, Search, Volume2, Trash2, CheckCircle2, XCircle, ChevronRight, RotateCcw, X } from "lucide-react";

const MOCK_WORDS = [
  { id: "1", word: "accomplish", definition: "To achieve or complete successfully", example: "She accomplished her goal of running a marathon.", confidence: 0.8, reviewCount: 5 },
  { id: "2", word: "eloquent", definition: "Fluent or persuasive in speaking or writing", example: "He gave an eloquent speech at the ceremony.", confidence: 0.5, reviewCount: 2 },
  { id: "3", word: "resilient", definition: "Able to recover quickly from difficulties", example: "Children are often more resilient than adults.", confidence: 0.3, reviewCount: 1 },
  { id: "4", word: "meticulous", definition: "Showing great attention to detail", example: "The scientist was meticulous in her research.", confidence: 0.6, reviewCount: 3 },
  { id: "5", word: "abundant", definition: "Existing in large quantities; plentiful", example: "The region has abundant natural resources.", confidence: 0.9, reviewCount: 8 },
  { id: "6", word: "inevitable", definition: "Certain to happen; unavoidable", example: "Change is inevitable in any growing company.", confidence: 0.4, reviewCount: 2 },
  { id: "7", word: "pragmatic", definition: "Dealing with things practically rather than theoretically", example: "She took a pragmatic approach to the problem.", confidence: 0.2, reviewCount: 1 },
  { id: "8", word: "ambiguous", definition: "Open to more than one interpretation", example: "The contract language was deliberately ambiguous.", confidence: 0.7, reviewCount: 4 },
];

export default function VocabularyPage() {
  const [words, setWords] = useState(MOCK_WORDS);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newWord, setNewWord] = useState({ word: "", definition: "", example: "" });
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const filtered = words.filter((w) => w.word.toLowerCase().includes(search.toLowerCase()) || w.definition.toLowerCase().includes(search.toLowerCase()));
  const dueForReview = words.filter((w) => w.confidence < 0.7);

  const addWord = () => {
    if (!newWord.word.trim()) return;
    setWords([{ id: Date.now().toString(), ...newWord, confidence: 0, reviewCount: 0 }, ...words]);
    setNewWord({ word: "", definition: "", example: "" });
    setShowAdd(false);
  };

  const deleteWord = (id: string) => setWords(words.filter((w) => w.id !== id));

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85; u.lang = "en-US";
    window.speechSynthesis.speak(u);
  };

  const handleReview = (remembered: boolean) => {
    setWords(words.map((w) => w.id === dueForReview[reviewIdx].id ? { ...w, confidence: remembered ? Math.min(1, w.confidence + 0.2) : Math.max(0, w.confidence - 0.1), reviewCount: w.reviewCount + 1 } : w));
    setShowAnswer(false);
    if (reviewIdx + 1 >= dueForReview.length) { setReviewMode(false); setReviewIdx(0); }
    else setReviewIdx(reviewIdx + 1);
  };

  const getConfColor = (c: number) => c >= 0.7 ? "bg-emerald-400" : c >= 0.4 ? "bg-amber-400" : "bg-red-400";

  if (reviewMode && dueForReview.length > 0) {
    const card = dueForReview[reviewIdx];
    return (
      <div className="max-w-lg mx-auto space-y-6 pt-8">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Flashcard Review</h2>
          <button onClick={() => { setReviewMode(false); setReviewIdx(0); }} className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">Exit</button>
        </div>
        <div className="text-sm text-[hsl(var(--muted-foreground))]">{reviewIdx + 1}/{dueForReview.length}</div>
        <motion.div key={reviewIdx} initial={{ rotateY: 0 }} className="p-8 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-center min-h-[200px] flex flex-col items-center justify-center cursor-pointer" onClick={() => setShowAnswer(true)}>
          <p className="text-2xl font-bold mb-2">{card.word}</p>
          {showAnswer ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 mt-4">
              <p className="text-[hsl(var(--muted-foreground))]">{card.definition}</p>
              {card.example && <p className="text-sm italic text-[hsl(var(--muted-foreground))]">&ldquo;{card.example}&rdquo;</p>}
            </motion.div>
          ) : <p className="text-sm text-[hsl(var(--muted-foreground))] mt-2">Tap to reveal</p>}
        </motion.div>
        {showAnswer && (
          <div className="flex gap-3">
            <button onClick={() => handleReview(false)} className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 font-medium flex items-center justify-center gap-2"><XCircle className="w-4 h-4" />Forgot</button>
            <button onClick={() => handleReview(true)} className="flex-1 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 font-medium flex items-center justify-center gap-2"><CheckCircle2 className="w-4 h-4" />Remembered</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl lg:text-3xl font-bold">Vocabulary</h1><p className="text-[hsl(var(--muted-foreground))] mt-1">{words.length} words · {dueForReview.length} due for review</p></div>
        <div className="flex gap-2">
          {dueForReview.length > 0 && <button onClick={() => { setReviewMode(true); setReviewIdx(0); setShowAnswer(false); }} className="px-4 py-2 rounded-xl bg-amber-500/10 text-amber-400 text-sm font-medium flex items-center gap-2"><RotateCcw className="w-4 h-4" />Review ({dueForReview.length})</button>}
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" />Add Word</button>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] space-y-3">
            <div className="flex justify-between items-center"><h3 className="font-medium">Add New Word</h3><button onClick={() => setShowAdd(false)}><X className="w-4 h-4 text-[hsl(var(--muted-foreground))]" /></button></div>
            <input type="text" placeholder="Word" value={newWord.word} onChange={(e) => setNewWord({ ...newWord, word: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            <input type="text" placeholder="Definition" value={newWord.definition} onChange={(e) => setNewWord({ ...newWord, definition: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            <input type="text" placeholder="Example sentence" value={newWord.example} onChange={(e) => setNewWord({ ...newWord, example: e.target.value })} className="w-full px-4 py-2.5 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" />
            <button onClick={addWord} disabled={!newWord.word.trim()} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium disabled:opacity-40">Add Word</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--muted-foreground))]" /><input type="text" placeholder="Search words..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" /></div>

      <div className="space-y-2">
        {filtered.map((w, i) => (
          <motion.div key={w.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="group p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center gap-4 hover:bg-[hsl(var(--muted))] transition-colors">
            <div className={`w-2 h-8 rounded-full ${getConfColor(w.confidence)}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><span className="font-semibold text-sm">{w.word}</span><button onClick={() => speak(w.word)} className="text-[hsl(var(--muted-foreground))] hover:text-violet-400"><Volume2 className="w-3.5 h-3.5" /></button></div>
              <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">{w.definition}</p>
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{w.reviewCount}×</div>
            <button onClick={() => deleteWord(w.id)} className="opacity-0 group-hover:opacity-100 text-[hsl(var(--muted-foreground))] hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
          </motion.div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-[hsl(var(--muted-foreground))]"><BookMarked className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No words found.</p></div>}
    </div>
  );
}
