"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import {
  LayoutDashboard,
  Mic,
  MessageSquare,
  BookOpen,
  Brain,
  BookMarked,
  LibraryBig,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Flame,
  Zap,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/lessons", icon: BookOpen, label: "Lessons" },
  { href: "/dashboard/conversation", icon: MessageSquare, label: "AI Chat" },
  { href: "/dashboard/pronunciation", icon: Mic, label: "Pronunciation" },
  { href: "/dashboard/quiz", icon: Brain, label: "Quizzes" },
  { href: "/dashboard/vocabulary", icon: BookMarked, label: "Vocabulary" },
  { href: "/dashboard/phrases", icon: LibraryBig, label: "Phrasebook" },
  { href: "/dashboard/progress", icon: BarChart3, label: "Progress" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // Calculate level progress
  const xpForNextLevel = (Math.floor(user.xpTotal / 500) + 1) * 500;
  const xpProgress = ((user.xpTotal % 500) / 500) * 100;

  return (
    <div className="flex h-screen bg-[hsl(var(--background))]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-6 border-b border-[hsl(var(--border))]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">SpeakUp</span>
        </div>

        {/* User Stats Mini */}
        <div className="px-4 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
              {user.displayName?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{user.displayName}</div>
              <div className="text-xs text-[hsl(var(--muted-foreground))]">
                Level {user.currentLevel}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-medium">{user.streakDays}</span>
              <span className="text-[hsl(var(--muted-foreground))]">streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium">{user.xpTotal}</span>
              <span className="text-[hsl(var(--muted-foreground))]">XP</span>
            </div>
          </div>
          {/* XP Progress Bar */}
          <div className="mt-2 h-1.5 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">
            {user.xpTotal % 500} / 500 XP to next level
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-violet-500/10 text-violet-400 font-medium"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
                }`}
              >
                <item.icon className="w-4.5 h-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[hsl(var(--border))]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-[hsl(var(--muted-foreground))] hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4.5 h-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))]">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-violet-400" />
          <span className="font-bold text-sm">SpeakUp</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          {user.streakDays}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-50"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[hsl(var(--card))] z-50 border-r border-[hsl(var(--border))] flex flex-col"
            >
              <div className="h-14 flex items-center justify-between px-4 border-b border-[hsl(var(--border))]">
                <span className="font-bold">SpeakUp</span>
                <button onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                        isActive
                          ? "bg-violet-500/10 text-violet-400 font-medium"
                          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                      }`}
                    >
                      <item.icon className="w-4.5 h-4.5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
