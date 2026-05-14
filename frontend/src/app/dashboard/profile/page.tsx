"use client";

import { motion } from "framer-motion";
import { 
  Trophy, Edit2, Phone, Users, Clock, 
  ChevronRight, Star, MapPin, Briefcase, 
  Heart, Languages, GraduationCap 
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="space-y-8 pb-10 px-2">
      {/* ── HEADER ── */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-black shadow-xl border-4 border-white">
            {user.displayName?.[0] || "U"}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-amber-400 border-4 border-white flex items-center justify-center shadow-lg">
             <Trophy className="w-5 h-5 text-white" />
          </div>
        </div>

        <div className="flex items-center gap-2">
           <h1 className="text-2xl font-black italic">{user.displayName || "Learner"}</h1>
           <button className="p-1 rounded-full bg-slate-100 text-slate-400">
              <Edit2 className="w-3 h-3" />
           </button>
        </div>

        <Link href="/dashboard/paywall">
          <button className="px-6 py-2 rounded-full bg-gradient-to-r from-primary to-[#4834D4] text-white text-xs font-bold shadow-lg shadow-primary/30 flex items-center gap-2">
            Become a premium member
            <ChevronRight className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-3 gap-3">
         <StatCard icon={Phone} label="Calls" value="24" color="text-blue-500" />
         <StatCard icon={Users} label="Friends" value="152" color="text-pink-500" />
         <StatCard icon={Clock} label="Time" value="480m" color="text-emerald-500" />
      </div>

      {/* ── REFERRAL ── */}
      <div className="p-5 rounded-[2rem] bg-indigo-50 border border-indigo-100 flex items-center justify-between">
         <div className="space-y-1">
            <div className="text-sm font-bold text-indigo-900">Invite friends to join SpeakUp</div>
            <div className="text-[10px] font-medium text-indigo-500">Win rewards for every referral</div>
         </div>
         <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-500 shadow-sm">
            <ChevronRight className="w-5 h-5" />
         </div>
      </div>

      {/* ── ACHIEVEMENTS ── */}
      <section className="space-y-4">
         <h2 className="text-xs font-black text-primary tracking-widest uppercase">Achievements</h2>
         <div className="grid grid-cols-4 gap-4">
            <BadgeIcon icon="🏅" earned />
            <BadgeIcon icon="🔥" earned />
            <BadgeIcon icon="🗣️" />
            <BadgeIcon icon="💎" />
         </div>
         <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
               <span>Next: Conversation Pro</span>
               <span>12/20 Calls</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
               <div className="h-full bg-primary w-[60%]" />
            </div>
         </div>
      </section>

      {/* ── INFORMATION ── */}
      <section className="space-y-3">
         <h2 className="text-xs font-black text-primary tracking-widest uppercase">Information</h2>
         <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
            <InfoRow icon={Users} label="About You" value="Enthusiastic Learner" />
            <InfoRow icon={Star} label="Call Rating" value="4.9 / 5.0" />
            <InfoRow icon={Briefcase} label="Profession" value="Software Developer" />
            <InfoRow icon={Heart} label="Interests" value="Technology, Travel" />
            <InfoRow icon={GraduationCap} label="English Level" value="Intermediate (B1)" />
            <InfoRow icon={Languages} label="Mother Tongue" value="Tamil" />
            <InfoRow icon={MapPin} label="Location" value="Chennai, India" />
         </div>
      </section>

      {/* ── SETTINGS ── */}
      <section className="space-y-3 pb-8">
         <h2 className="text-xs font-black text-primary tracking-widest uppercase">Settings</h2>
         <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-6 flex items-center justify-between">
            <div className="text-sm font-bold text-slate-700">Check Feedback after human calls</div>
            <div className="w-10 h-5 rounded-full bg-emerald-500 relative">
               <div className="absolute right-0.5 top-0.5 w-4 h-4 rounded-full bg-white shadow-sm" />
            </div>
         </div>
         <div className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest py-4">
            App Version 1.2.4
         </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm text-center space-y-1">
       <Icon className={`w-5 h-5 mx-auto ${color}`} />
       <div className="text-lg font-black">{value}</div>
       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</div>
    </div>
  );
}

function BadgeIcon({ icon, earned }: any) {
  return (
    <div className={`aspect-square rounded-2xl flex items-center justify-center text-2xl ${earned ? "bg-gradient-to-br from-primary to-indigo-600 shadow-lg shadow-primary/20" : "bg-slate-100 grayscale opacity-30"}`}>
       {icon}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors">
       <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 text-slate-300" />
          <span className="text-sm font-bold text-slate-600">{label}</span>
       </div>
       <span className="text-sm font-medium text-slate-400">{value}</span>
    </div>
  );
}
