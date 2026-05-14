"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import {
  BookOpen,
  Mic,
  Trophy,
  BarChart3,
  Flame,
  Bell,
  MessageCircle,
  Gem,
} from "lucide-react";

const bottomNavItems = [
  { href: "/dashboard/learn", icon: BookOpen, label: "Learn" },
  { href: "/dashboard", icon: Mic, label: "Practice" },
  { href: "/dashboard/leagues", icon: Trophy, label: "Leagues" },
  { href: "/dashboard/progress", icon: BarChart3, label: "Progress" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/profile">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              {user.displayName?.[0] || "U"}
            </div>
          </Link>
          <Link href="/dashboard/paywall">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
              <Gem className="w-3.5 h-3.5" />
              Go Premium
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold">{user.streakDays}</span>
            <Flame className="w-4.5 h-4.5 text-orange-500" />
          </div>
          <Link href="/dashboard/notifications" className="text-[hsl(var(--muted-foreground))] hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </Link>
          <Link href="/dashboard/messages" className="text-[hsl(var(--muted-foreground))] hover:text-primary transition-colors">
            <MessageCircle className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16 pb-20 px-4">
        <div className="max-w-md mx-auto pt-4">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] flex items-center justify-around px-2">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 w-full"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/25" : "text-[hsl(var(--muted-foreground))]"}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-[hsl(var(--muted-foreground))]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
