"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import {
  Mic,
  MessageSquare,
  BookOpen,
  BarChart3,
  Globe,
  Sparkles,
  ChevronRight,
  Zap,
  Trophy,
  Brain,
  Headphones,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Pronunciation Lab",
    description: "Get phoneme-level feedback on your pronunciation with AI-powered analysis.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: MessageSquare,
    title: "AI Conversations",
    description: "Practice real-world scenarios with an intelligent AI partner that adapts to your level.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: BookOpen,
    title: "Daily Lessons",
    description: "Animated explainer lessons covering grammar, vocabulary, and speaking skills.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Brain,
    title: "Smart Quizzes",
    description: "Spaced repetition quizzes that adapt difficulty to maximize your learning.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Headphones,
    title: "Phrasebook",
    description: "500+ real-world phrases with native audio for every situation.",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track your improvement with detailed skill radar charts and insights.",
    gradient: "from-blue-500 to-indigo-600",
  },
];

const stats = [
  { value: "10K+", label: "Active Learners" },
  { value: "500+", label: "Phrases" },
  { value: "60+", label: "Lessons" },
  { value: "10", label: "AI Scenarios" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function LandingPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SpeakUp</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
              Features
            </a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-violet-500/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cyan-500/15 to-transparent blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm mb-8"
            >
              <Sparkles className="w-4 h-4" />
              Powered by Claude AI
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Master English{" "}
              <span className="gradient-text">Speaking</span>
              <br />
              with AI Practice
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Have real conversations with AI, get instant pronunciation feedback,
              and track your progress with personalized lessons adapted to your CEFR level.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/register"
                className="group px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 flex items-center gap-2"
              >
                Start Speaking Free
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 rounded-2xl border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium text-lg hover:bg-[hsl(var(--muted))] transition-colors"
              >
                See How It Works
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Speak Fluently</span>
            </h2>
            <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
              A complete platform designed to take you from beginner to confident
              English speaker.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-[hsl(var(--card))] border border-[hsl(var(--border))] card-hover"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 100% Free Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center p-10 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-[hsl(var(--card))] to-violet-500/10 border border-emerald-500/20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm mb-6">
            <Zap className="w-4 h-4" />
            100% Free · No Credit Card
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything Included, <span className="gradient-text">Totally Free</span>
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] mb-8 max-w-xl mx-auto">
            Unlimited AI conversations, pronunciation practice, lessons, quizzes, and progress tracking. No hidden fees, no paywalls.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            {[
              "Unlimited AI Chat",
              "Pronunciation Lab",
              "All Lessons",
              "Smart Quizzes",
              "Full Analytics",
              "500+ Phrases",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm">
                <Zap className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-violet-500/25 transition-all duration-300"
          >
            Get Started Free
            <ChevronRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-violet-500/10 via-[hsl(var(--card))] to-cyan-500/10 border border-[hsl(var(--border))]"
        >
          <Globe className="w-12 h-12 text-violet-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Speaking?
          </h2>
          <p className="text-lg text-[hsl(var(--muted-foreground))] mb-8 max-w-xl mx-auto">
            Join thousands of learners who are improving their English speaking
            skills every day with SpeakUp.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-violet-500/25 transition-all duration-300"
          >
            <Trophy className="w-5 h-5" />
            Create Free Account
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold">SpeakUp</span>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            © {new Date().getFullYear()} SpeakUp. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
