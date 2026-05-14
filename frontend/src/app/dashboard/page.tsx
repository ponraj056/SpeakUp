"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { Mic, User, Bot, Sparkles } from "lucide-react";

export default function PracticePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="space-y-8 pb-10">
      {/* ── PRACTICE WITH HUMANS ── */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-primary tracking-widest uppercase">
          Practice with Humans
        </h2>
        
        <div className="relative group">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="w-full h-56 rounded-[2rem] bg-gradient-to-br from-[#6C5CE7] to-[#4834D4] p-8 relative overflow-hidden shadow-xl shadow-primary/20"
          >
            {/* Online Badge */}
            <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold">
              900 Online
            </div>

            {/* Floating Avatars (Mock) */}
            <div className="absolute inset-0 pointer-events-none">
              <AvatarBubble initial="A" top="20%" left="15%" />
              <AvatarBubble initial="S" top="40%" left="75%" />
              <AvatarBubble initial="J" top="70%" left="30%" />
              <AvatarBubble initial="K" top="15%" left="60%" />
              <AvatarBubble initial="M" top="60%" left="85%" />
            </div>

            <div className="relative h-full flex flex-col justify-end">
              <Link href="/dashboard/match">
                <button className="w-full py-4 rounded-2xl bg-white text-primary font-bold text-sm shadow-lg hover:bg-white/90 transition-all flex items-center justify-center gap-2">
                  <User className="w-4 h-4" />
                  Start Human Call
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── PRACTICE WITH AI TEACHER ── */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-primary tracking-widest uppercase">
          Practice with AI Teacher
        </h2>

        <Link href="/dashboard/ai-teacher">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="w-full h-56 rounded-[2rem] bg-slate-100 border border-slate-200 relative overflow-hidden shadow-md group"
          >
            {/* Miss Maya Image (Mock with placeholder or color) */}
            <div className="absolute inset-0 bg-slate-200">
               {/* Miss Maya Placeholder */}
               <div className="w-full h-full flex items-center justify-center bg-gradient-to-t from-slate-300 to-transparent">
                  <span className="text-8xl">👩🏾‍🏫</span>
               </div>
            </div>

            {/* Words of the Day Badge */}
            <div className="absolute top-6 right-6 px-3 py-1.5 rounded-full bg-amber-500 text-white text-[10px] font-bold shadow-lg">
              WORDS of the DAY
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <div className="text-white">
                <div className="text-lg font-bold">Miss Maya</div>
                <div className="text-white/80 text-xs">Your AI Grammar & Speaking Coach</div>
              </div>
            </div>

            {/* Hover Sparkle Effect */}
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
          </motion.div>
        </Link>
      </section>

      {/* ── FOOTER / MORE ── */}
      <div className="grid grid-cols-2 gap-4">
         <Link href="/dashboard/conversation" className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center gap-2 shadow-sm">
            <Bot className="w-6 h-6 text-primary" />
            <span className="text-xs font-bold">AI Characters</span>
         </Link>
         <Link href="/dashboard/words" className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col items-center gap-2 shadow-sm">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <span className="text-xs font-bold">Vocabulary</span>
         </Link>
      </div>
    </div>
  );
}

function AvatarBubble({ initial, top, left }: { initial: string; top: string; left: string }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white text-[10px] font-bold"
      style={{ top, left }}
    >
      {initial}
    </motion.div>
  );
}
