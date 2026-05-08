"use client";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { CreditCard, Check, Star, Zap, Crown } from "lucide-react";

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);
  const isPro = user?.plan === "PRO";

  return (
    <div className="space-y-8 max-w-4xl">
      <div><h1 className="text-2xl lg:text-3xl font-bold">Billing & Subscription</h1><p className="text-[hsl(var(--muted-foreground))] mt-1">Manage your SpeakUp subscription</p></div>

      {/* Current Plan */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 rounded-2xl border ${isPro ? "bg-gradient-to-r from-violet-500/10 via-[hsl(var(--card))] to-indigo-500/10 border-violet-500/30" : "bg-[hsl(var(--card))] border-[hsl(var(--border))]"}`}>
        <div className="flex items-center gap-3 mb-3">
          {isPro ? <Crown className="w-6 h-6 text-violet-400" /> : <CreditCard className="w-6 h-6 text-[hsl(var(--muted-foreground))]" />}
          <div>
            <h2 className="font-semibold text-lg">{isPro ? "Pro Plan" : "Free Plan"}</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{isPro ? "Unlimited access to all features" : "Limited access · Upgrade for more"}</p>
          </div>
        </div>
        {isPro && <p className="text-xs text-[hsl(var(--muted-foreground))]">Next billing: January 15, 2027 · $8.99/month</p>}
      </motion.div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <div className={`p-6 rounded-2xl border ${!isPro ? "border-violet-500/30 bg-violet-500/5" : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"}`}>
          <h3 className="font-semibold text-lg mb-1">Free</h3>
          <div className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">/forever</span></div>
          <ul className="space-y-2.5 mb-6">
            {["5 lessons per day", "3 AI conversations per day", "Basic progress tracking", "Phrasebook access", "Quiz practice"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />{f}</li>
            ))}
          </ul>
          {!isPro && <div className="py-2.5 rounded-xl border border-violet-500/30 text-center text-sm font-medium text-violet-400">Current Plan</div>}
        </div>

        {/* Pro */}
        <div className={`p-6 rounded-2xl border relative ${isPro ? "border-violet-500/30 bg-violet-500/5" : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"}`}>
          <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-medium">Best Value</div>
          <h3 className="font-semibold text-lg mb-1">Pro</h3>
          <div className="text-3xl font-bold mb-1">$8.99<span className="text-sm font-normal text-[hsl(var(--muted-foreground))]">/month</span></div>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mb-4">or $69/year (save 36%)</p>
          <ul className="space-y-2.5 mb-6">
            {["Unlimited lessons & AI chat", "Pronunciation Lab", "Offline mode", "Advanced analytics", "Priority AI responses", "Streak freeze", "PDF progress reports"].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm"><Star className="w-4 h-4 text-violet-400 flex-shrink-0" />{f}</li>
            ))}
          </ul>
          {isPro ? (
            <div className="py-2.5 rounded-xl border border-violet-500/30 text-center text-sm font-medium text-violet-400">Current Plan</div>
          ) : (
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"><Zap className="w-4 h-4" />Upgrade to Pro</button>
          )}
        </div>
      </div>

      {isPro && (
        <div className="p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
          <button className="text-sm text-red-400 hover:text-red-300">Cancel Subscription</button>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">Your access will continue until the end of the billing period.</p>
        </div>
      )}
    </div>
  );
}
