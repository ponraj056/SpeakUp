"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, CheckCircle2, XCircle, Clock, Zap, ChevronRight, RotateCcw } from "lucide-react";

const QUIZ_QUESTIONS = [
  { id: "1", type: "MULTIPLE_CHOICE", prompt: "She ___ to work every day.", options: ["go", "goes", "going", "gone"], correct: "goes", explanation: "'She' is third person singular, so we use 'goes' in present simple.", level: "A1" },
  { id: "2", type: "FILL_BLANK", prompt: "I have been ___ (wait) for an hour.", options: [], correct: "waiting", explanation: "Present perfect continuous: have been + verb-ing.", level: "A2" },
  { id: "3", type: "MULTIPLE_CHOICE", prompt: "If I ___ you, I would apologize.", options: ["am", "was", "were", "be"], correct: "were", explanation: "In second conditional, we use 'were' for all subjects.", level: "B1" },
  { id: "4", type: "MULTIPLE_CHOICE", prompt: "Choose the correct word: The news ___ shocking.", options: ["is", "are", "were", "have"], correct: "is", explanation: "'News' is an uncountable noun and takes a singular verb.", level: "A2" },
  { id: "5", type: "MULTIPLE_CHOICE", prompt: "He suggested ___ a break.", options: ["to take", "taking", "take", "took"], correct: "taking", explanation: "'Suggest' is followed by a gerund (-ing form).", level: "B1" },
  { id: "6", type: "FILL_BLANK", prompt: "By next year, I ___ (finish) my degree.", options: [], correct: "will have finished", explanation: "Future perfect: will have + past participle for actions completed before a future time.", level: "B2" },
  { id: "7", type: "MULTIPLE_CHOICE", prompt: "Neither the students nor the teacher ___ present.", options: ["was", "were", "is", "are"], correct: "was", explanation: "With 'neither...nor', the verb agrees with the nearest subject (teacher = singular).", level: "B2" },
  { id: "8", type: "MULTIPLE_CHOICE", prompt: "I wish I ___ more time to study.", options: ["have", "had", "has", "having"], correct: "had", explanation: "After 'wish' for present situations, we use past simple.", level: "B1" },
];

export default function QuizPage() {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [fillInput, setFillInput] = useState("");
  const [startTime, setStartTime] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = QUIZ_QUESTIONS[current];
  const total = QUIZ_QUESTIONS.length;

  const handleStart = () => { setStarted(true); setStartTime(Date.now()); };

  const handleAnswer = () => {
    const answer = q.type === "FILL_BLANK" ? fillInput.trim().toLowerCase() : selected;
    const correct = answer === q.correct.toLowerCase();
    setResults([...results, correct]);
    setAnswered(true);
  };

  const handleNext = () => {
    if (current + 1 >= total) { setFinished(true); return; }
    setCurrent(current + 1);
    setSelected(null);
    setAnswered(false);
    setFillInput("");
  };

  const handleRestart = () => {
    setCurrent(0); setSelected(null); setAnswered(false); setResults([]); setFillInput(""); setFinished(false); setStartTime(Date.now());
  };

  const correctCount = results.filter(Boolean).length;
  const scorePercent = Math.round((correctCount / total) * 100);

  if (!started) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 pt-12">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto"><Brain className="w-8 h-8 text-white" /></div>
        <h1 className="text-3xl font-bold">Quiz Practice</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Test your grammar knowledge with {total} questions. Answers are tracked with spaced repetition.</p>
        <div className="flex items-center justify-center gap-6 text-sm text-[hsl(var(--muted-foreground))]">
          <span className="flex items-center gap-1"><Brain className="w-4 h-4" />{total} questions</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />~5 min</span>
          <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-amber-400" />5 XP each</span>
        </div>
        <button onClick={handleStart} className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium hover:opacity-90 transition-opacity">Start Quiz</button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-6 pt-8">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className={`text-6xl font-bold mb-2 ${scorePercent >= 70 ? "text-emerald-400" : scorePercent >= 50 ? "text-amber-400" : "text-red-400"}`}>{scorePercent}%</div>
          <p className="text-lg font-medium">{scorePercent >= 80 ? "Excellent!" : scorePercent >= 60 ? "Good job!" : "Keep practicing!"}</p>
          <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{correctCount}/{total} correct · XP earned: {correctCount * 5}</p>
        </motion.div>
        <div className="grid grid-cols-8 gap-2">
          {results.map((r, i) => (<div key={i} className={`h-2 rounded-full ${r ? "bg-emerald-400" : "bg-red-400"}`} />))}
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={handleRestart} className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium flex items-center gap-2"><RotateCcw className="w-4 h-4" />Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[hsl(var(--muted-foreground))]">Question {current + 1}/{total}</span>
        <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-xs font-medium">{q.level}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" animate={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* Question */}
      <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
        <p className="text-lg font-medium mb-6">{q.prompt}</p>

        {q.type === "MULTIPLE_CHOICE" ? (
          <div className="space-y-3">
            {q.options.map((opt) => {
              let style = "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]";
              if (answered) {
                if (opt === q.correct) style = "border-emerald-500/50 bg-emerald-500/10 text-emerald-400";
                else if (opt === selected) style = "border-red-500/50 bg-red-500/10 text-red-400";
              } else if (opt === selected) {
                style = "border-violet-500/50 bg-violet-500/10 text-violet-400";
              }
              return (
                <button key={opt} onClick={() => !answered && setSelected(opt)} disabled={answered} className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${style}`}>
                  {opt}
                  {answered && opt === q.correct && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {answered && opt === selected && opt !== q.correct && <XCircle className="w-5 h-5 text-red-400" />}
                </button>
              );
            })}
          </div>
        ) : (
          <input type="text" value={fillInput} onChange={(e) => setFillInput(e.target.value)} disabled={answered} placeholder="Type your answer..." className="w-full px-4 py-3 rounded-xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]" onKeyDown={(e) => e.key === "Enter" && !answered && handleAnswer()} />
        )}

        {/* Explanation */}
        <AnimatePresence>
          {answered && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 p-4 rounded-xl bg-[hsl(var(--muted))]">
              <p className="text-sm"><strong>Answer:</strong> {q.correct}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{q.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Actions */}
      <div className="flex justify-end">
        {!answered ? (
          <button onClick={handleAnswer} disabled={!selected && !fillInput.trim()} className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium disabled:opacity-40">Check Answer</button>
        ) : (
          <button onClick={handleNext} className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium flex items-center gap-2">{current + 1 >= total ? "See Results" : "Next"}<ChevronRight className="w-4 h-4" /></button>
        )}
      </div>
    </div>
  );
}
