"use client";

import { motion } from "framer-motion";
import { Shield, ChevronUp, Clock, Trophy } from "lucide-react";

const leagues = [
  { name: "Bronze", color: "text-amber-700", bg: "bg-amber-100" },
  { name: "Silver", color: "text-slate-500", bg: "bg-slate-100" },
  { name: "Gold", color: "text-amber-500", bg: "bg-amber-100" },
  { name: "Platinum", color: "text-cyan-600", bg: "bg-cyan-100" },
  { name: "Diamond", color: "text-primary", bg: "bg-primary/10" },
];

const leaderboard = [
  { rank: 1, name: "Arun K.", xp: 2450, initial: "A", color: "bg-orange-500" },
  { rank: 2, name: "Priya S.", xp: 2100, initial: "P", color: "bg-pink-500", active: true },
  { rank: 3, name: "John D.", xp: 1980, initial: "J", color: "bg-blue-500" },
  { rank: 4, name: "Sara L.", xp: 1850, initial: "S", color: "bg-green-500" },
  { rank: 5, name: "Mike R.", xp: 1720, initial: "M", color: "bg-violet-500", active: true },
  { rank: 6, name: "Me (You)", xp: 1650, initial: "U", color: "bg-primary", isMe: true },
  { rank: 7, name: "Anna B.", xp: 1400, initial: "A", color: "bg-rose-500" },
  { rank: 8, name: "David P.", xp: 1200, initial: "D", color: "bg-cyan-500" },
];

export default function LeaguesPage() {
  return (
    <div className="space-y-6 pb-10">
      {/* Tier Badges */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {leagues.map((l) => (
          <div key={l.name} className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className={`w-14 h-14 rounded-2xl ${l.bg} flex items-center justify-center border border-white/50 shadow-sm`}>
              <Shield className={`w-8 h-8 ${l.color}`} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{l.name}</span>
          </div>
        ))}
      </div>

      {/* League Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black italic">Bronze League</h1>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Ends in 6 days
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top 5 advance to next league</p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {leaderboard.map((item, i) => (
          <div key={item.name}>
            {item.rank === 6 && (
              <div className="px-4 py-2 bg-emerald-50 border-y border-emerald-100 flex items-center justify-center gap-2">
                <ChevronUp className="w-3 h-3 text-emerald-500 animate-bounce" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Promotion Zone</span>
                <ChevronUp className="w-3 h-3 text-emerald-500 animate-bounce" />
              </div>
            )}
            <div className={`p-4 flex items-center gap-4 ${item.isMe ? "bg-primary/5" : ""}`}>
              <div className={`w-6 text-center font-black text-sm ${item.rank === 1 ? "text-amber-500" : "text-slate-300"}`}>
                {item.rank}
              </div>
              <div className="relative">
                <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white font-bold`}>
                  {item.initial}
                </div>
                {item.active && (
                   <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold">{item.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  {item.xp}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
