"use client";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { BarChart3, Flame, Zap, Trophy, Target, TrendingUp, Calendar, BookOpen, MessageSquare, Clock } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const skillData = [
  { subject: "Speaking", value: 72, fullMark: 100 },
  { subject: "Grammar", value: 65, fullMark: 100 },
  { subject: "Vocabulary", value: 78, fullMark: 100 },
  { subject: "Listening", value: 58, fullMark: 100 },
  { subject: "Reading", value: 80, fullMark: 100 },
];

const weeklyData = [
  { day: "Mon", xp: 45, minutes: 12 },
  { day: "Tue", xp: 80, minutes: 22 },
  { day: "Wed", xp: 35, minutes: 8 },
  { day: "Thu", xp: 120, minutes: 35 },
  { day: "Fri", xp: 65, minutes: 18 },
  { day: "Sat", xp: 95, minutes: 28 },
  { day: "Sun", xp: 50, minutes: 15 },
];

const heatmapData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: Math.floor(Math.random() * 5),
}));

export default function ProgressPage() {
  const user = useAuthStore((s) => s.user);
  if (!user) return null;
  const level = Math.floor(user.xpTotal / 500) + 1;
  const xpProgress = ((user.xpTotal % 500) / 500) * 100;

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl lg:text-3xl font-bold">Progress & Analytics</h1><p className="text-[hsl(var(--muted-foreground))] mt-1">Track your English learning journey</p></div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: Flame, label: "Streak", value: `${user.streakDays} days`, color: "text-orange-400", bg: "bg-orange-500/10" },
          { icon: Zap, label: "Total XP", value: user.xpTotal.toLocaleString(), color: "text-amber-400", bg: "bg-amber-500/10" },
          { icon: Trophy, label: "Level", value: level, color: "text-violet-400", bg: "bg-violet-500/10" },
          { icon: Target, label: "CEFR", value: user.currentLevel, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { icon: BookOpen, label: "Lessons Done", value: "24", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-2`}><s.icon className={`w-4.5 h-4.5 ${s.color}`} /></div>
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-[10px] text-[hsl(var(--muted-foreground))]">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Level Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Level {level} Progress</h3>
          <span className="text-sm text-[hsl(var(--muted-foreground))]">{user.xpTotal % 500}/500 XP</span>
        </div>
        <div className="h-3 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500" initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 1.5, ease: "easeOut" }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[hsl(var(--muted-foreground))]"><span>Level {level}</span><span>Level {level + 1}</span></div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skill Radar */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
          <h3 className="font-semibold mb-4">Skill Radar</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={skillData}>
              <PolarGrid stroke="hsl(220, 13%, 25%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(220, 9%, 60%)", fontSize: 12 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Skills" dataKey="value" stroke="hsl(252, 87%, 64%)" fill="hsl(252, 87%, 64%)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Weekly XP Chart */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
          <h3 className="font-semibold mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(252, 87%, 64%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(252, 87%, 64%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 20%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(220, 9%, 60%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(220, 9%, 60%)", fontSize: 12 }} axisLine={false} />
              <Tooltip contentStyle={{ background: "hsl(224, 28%, 12%)", border: "1px solid hsl(224, 20%, 20%)", borderRadius: "0.75rem", fontSize: 12 }} />
              <Area type="monotone" dataKey="xp" stroke="hsl(252, 87%, 64%)" fill="url(#xpGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Activity Heatmap */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
        <h3 className="font-semibold mb-4">30-Day Activity</h3>
        <div className="grid grid-cols-10 gap-1.5">
          {heatmapData.map((d) => {
            const opacity = d.value === 0 ? 0.08 : 0.2 + d.value * 0.2;
            return <div key={d.day} className="aspect-square rounded-sm" style={{ background: `rgba(139, 92, 246, ${opacity})` }} title={`Day ${d.day}: ${d.value} sessions`} />;
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-[hsl(var(--muted-foreground))]">
          <span>Less</span>
          {[0.08, 0.2, 0.4, 0.6, 0.8].map((o, i) => <div key={i} className="w-3 h-3 rounded-sm" style={{ background: `rgba(139, 92, 246, ${o})` }} />)}
          <span>More</span>
        </div>
      </motion.div>

      {/* Weekly Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: MessageSquare, label: "AI Sessions", value: "12", sub: "this week", color: "text-violet-400", bg: "bg-violet-500/10" },
          { icon: Clock, label: "Practice Time", value: "2h 18m", sub: "this week", color: "text-blue-400", bg: "bg-blue-500/10" },
          { icon: TrendingUp, label: "New Words", value: "34", sub: "learned", color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-center">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
