"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard/learn", icon: BookOpen, label: "Learn" },
  { href: "/dashboard", icon: Mic, label: "Practice" },
  { href: "/dashboard/leagues", icon: Trophy, label: "Leagues" },
  { href: "/dashboard/progress", icon: BarChart3, label: "Progress" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] fixed inset-y-0 z-50">
        <div className="p-6 flex items-center gap-2 border-b border-[hsl(var(--border))]">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-xl">SpeakUp</span>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[hsl(var(--border))] space-y-3">
          <Link href="/dashboard/paywall" className="block">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all">
              <Gem className="w-4 h-4" />
              Go Premium
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-red-500/10 hover:text-red-500 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-[hsl(var(--background))/80] backdrop-blur-md border-b border-[hsl(var(--border))] flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/profile" className="md:hidden">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {user.displayName?.[0] || "U"}
              </div>
            </Link>
            <div className="hidden md:flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                {user.displayName?.[0] || "U"}
              </div>
              <span className="font-semibold">{user.displayName || "User"}</span>
            </div>
            <Link href="/dashboard/paywall" className="md:hidden">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold border border-amber-500/20">
                <Gem className="w-3.5 h-3.5" />
                Premium
              </button>
            </Link>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-full">
              <span className="text-sm font-bold text-orange-600">{user.streakDays}</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <Link href="/dashboard/notifications" className="text-[hsl(var(--muted-foreground))] hover:text-primary transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[hsl(var(--background))]" />
            </Link>
            <Link href="/dashboard/messages" className="text-[hsl(var(--muted-foreground))] hover:text-primary transition-colors">
              <MessageCircle className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 md:pb-8 pt-6 px-4 md:px-8">
          <div className="max-w-6xl mx-auto w-full">{children}</div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] flex items-center justify-around px-2 pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 w-full h-full"
              >
                <div
                  className={`p-1.5 rounded-xl transition-all ${
                    isActive ? "bg-primary text-white shadow-lg shadow-primary/25" : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-primary" : "text-[hsl(var(--muted-foreground))]"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
