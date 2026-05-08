"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Zap, CheckCircle2, BookOpen, Loader2 } from "lucide-react";
import { api, Lesson } from "@/lib/api";
import { toast } from "sonner";

const LESSON_CONTENT = {
  sections: [
    { type: "intro", title: "What You'll Learn", content: "In this lesson, you'll master the key differences and practice with real examples." },
    { type: "explanation", title: "Key Concept", content: "Understanding this grammar point is essential for natural English communication. Pay attention to the context and when to use each form." },
    { type: "examples", title: "Examples", items: ["I usually work from home. (habit/routine)", "I am working from home today. (right now/temporary)", "She speaks three languages. (permanent fact)", "She is speaking on the phone. (at this moment)"] },
    { type: "tip", title: "Pro Tip", content: "Signal words help! 'Always, usually, often, never' → Simple. 'Now, right now, at the moment, currently' → Continuous." },
  ],
  practice: [
    { question: "She ___ (cook) dinner right now.", answer: "is cooking" },
    { question: "We ___ (go) to the gym every Monday.", answer: "go" },
    { question: "Look! It ___ (rain) outside.", answer: "is raining" },
  ],
};

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await api.getLesson(slug);
        setLesson(res.data.lesson);
      } catch (err) {
        console.error("Failed to fetch lesson:", err);
        toast.error("Failed to load lesson content");
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [slug]);

  const handleComplete = async () => {
    if (!lesson || completing) return;

    setCompleting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      await api.completeLesson(lesson.id, {
        score: 100,
        timeSpentSeconds: timeSpent,
      });
      toast.success(`Lesson completed! +${lesson.xpReward} XP`);
      router.push("/dashboard/lessons");
    } catch (err: any) {
      toast.error(err.message || "Failed to complete lesson");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-[hsl(var(--muted-foreground))]">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Lesson not found</h2>
        <Link href="/dashboard/lessons" className="text-violet-400 mt-4 inline-block hover:underline">
          Back to Lessons
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/lessons" className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{lesson.title}</h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            <span className="px-2 py-0.5 rounded-md bg-[hsl(var(--muted))] text-xs font-medium">{lesson.level}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {Math.round(lesson.durationSeconds / 60)} min
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {lesson.xpReward} XP
            </span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {LESSON_CONTENT.sections.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
        >
          <h2 className="font-semibold text-lg mb-3">{section.title}</h2>
          {section.content && <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{section.content}</p>}
          {section.items && (
            <ul className="space-y-2 mt-2">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      ))}

      {/* Practice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 via-[hsl(var(--card))] to-cyan-500/10 border border-[hsl(var(--border))]"
      >
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-400" />
          Practice Exercises
        </h2>
        <div className="space-y-4">
          {LESSON_CONTENT.practice.map((p, i) => (
            <div key={i} className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
              <p className="text-sm font-medium mb-2">{i + 1}. {p.question}</p>
              <details className="text-sm">
                <summary className="text-violet-400 cursor-pointer hover:text-violet-300">Show answer</summary>
                <p className="mt-1 text-emerald-400 font-medium">{p.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Complete Button */}
      <button
        onClick={handleComplete}
        disabled={completing}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {completing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <CheckCircle2 className="w-5 h-5" />
        )}
        {completing ? "Saving Progress..." : `Complete Lesson · Earn ${lesson.xpReward} XP`}
      </button>
    </div>
  );
}
