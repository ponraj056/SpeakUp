"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import {
  Flame,
  Zap,
  Trophy,
  Target,
  BookOpen,
  MessageSquare,
  Mic,
  Brain,
  ArrowRight,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

const quickActions = [
  {
    icon: MessageSquare,
    title: "AI Conversation",
    description: "Practice with your AI partner",
    href: "/dashboard/conversation",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Mic,
    title: "Pronunciation Lab",
    description: "Perfect your accent",
    href: "/dashboard/pronunciation",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: BookOpen,
    title: "Daily Lesson",
    description: "Continue your learning",
    href: "/dashboard/lessons",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Brain,
    title: "Quiz Practice",
    description: "Review due flashcards",
    href: "/dashboard/quiz",
    gradient: "from-amber-500 to-orange-600",
  },
];

const skillRadarData = [
  { skill: "Speaking", value: 72 },
  { skill: "Grammar", value: 65 },
  { skill: "Vocabulary", value: 78 },
  { skill: "Listening", value: 58 },
  { skill: "Reading", value: 80 },
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5 },
  }),
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  const greeting = getGreeting();
  const level = Math.floor(user.xpTotal / 500) + 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl lg:text-3xl font-bold">
          {greeting}, {user.displayName?.split(" ")[0] || "Learner"}! 👋
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Keep your streak alive! Here&apos;s your learning overview.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Flame,
            label: "Day Streak",
            value: user.streakDays,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
          },
          {
            icon: Zap,
            label: "Total XP",
            value: user.xpTotal.toLocaleString(),
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            icon: Trophy,
            label: "Level",
            value: level,
            color: "text-violet-400",
            bg: "bg-violet-500/10",
          },
          {
            icon: Target,
            label: "CEFR Level",
            value: user.currentLevel,
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="p-4 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] card-hover"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, i) => (
            <Link key={action.href} href={action.href}>
              <motion.div
                custom={i + 4}
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="group p-5 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] card-hover cursor-pointer"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="font-medium text-sm mb-1">{action.title}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                  {action.description}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skills Overview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Skills Overview</h3>
            <Link
              href="/dashboard/progress"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {skillRadarData.map((skill) => (
              <div key={skill.skill}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span>{skill.skill}</span>
                  <span className="font-medium">{skill.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.value}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Phrase of the Day + Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          {/* Phrase of the Day */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 via-[hsl(var(--card))] to-cyan-500/10 border border-[hsl(var(--border))]">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
                PHRASE OF THE DAY
              </span>
            </div>
            <p className="text-lg font-medium mb-2">
              &ldquo;Break the ice&rdquo;
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              To make people feel more comfortable in a social situation.
            </p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2 italic">
              &ldquo;She told a funny story to break the ice at the meeting.&rdquo;
            </p>
          </div>

          {/* Weekly Summary */}
          <div className="p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
            <h3 className="font-semibold mb-4">This Week</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-lg font-bold">12</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Sessions</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-lg font-bold">45m</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Practiced</div>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-lg font-bold">24</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">New Words</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
