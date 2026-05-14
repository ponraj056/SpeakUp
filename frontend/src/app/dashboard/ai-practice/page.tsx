"use client";

import { motion } from "framer-motion";
import { Sparkles, Diamond, ChevronRight, MessageSquare, Briefcase, Heart, ShoppingBag, Stethoscope, Plane } from "lucide-react";
import Link from "next/link";

const categories = [
  { id: "dating", name: "Dating & Relationships", icon: Heart, count: 12, users: 450, color: "bg-pink-100 text-pink-600" },
  { id: "social", name: "Social Situations", icon: MessageSquare, count: 8, users: 890, color: "bg-blue-100 text-blue-600" },
  { id: "office", name: "Office Life", icon: Briefcase, count: 15, users: 320, color: "bg-amber-100 text-amber-600" },
  { id: "travel", name: "Travel", icon: Plane, count: 10, users: 670, color: "bg-teal-100 text-teal-600" },
  { id: "shopping", name: "Shopping", icon: ShoppingBag, count: 6, users: 150, color: "bg-indigo-100 text-indigo-600" },
  { id: "medical", name: "Medical", icon: Stethoscope, count: 5, users: 90, color: "bg-emerald-100 text-emerald-600" },
];

const characters = [
  { id: "maya", name: "Miss Maya", role: "Encouraging Teacher", image: "👩🏾‍🏫", pro: false },
  { id: "aunty", name: "Homemaker Aunty", role: "Casual Talk", image: "👵🏽", pro: false },
  { id: "astrologer", name: "Astrologer", role: "Mystical Talk", image: "🧙‍♂️", pro: true },
  { id: "snape", name: "Professor Snape", role: "Academic Polish", image: "👨🏻‍🔬", pro: true },
  { id: "shopkeeper", name: "Shopkeeper", role: "Shopping Practice", image: "👨🏽‍🌾", pro: false },
  { id: "doctor", name: "Doctor", role: "Medical Consult", image: "👨🏼‍⚕️", pro: true },
];

export default function AIPracticeScreen() {
  return (
    <div className="space-y-8 pb-10">
      {/* Featured Teacher */}
      <section>
        <h2 className="text-xs font-black text-primary tracking-widest uppercase mb-4">Featured Teacher</h2>
        <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 p-8 text-white shadow-xl">
           <div className="relative z-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
                 👩🏾‍🏫
              </div>
              <div>
                 <h1 className="text-2xl font-black italic">Miss Maya</h1>
                 <p className="text-sm font-medium text-white/80">Warm & encouraging English teacher. Perfect for beginners.</p>
              </div>
              <Link href="/dashboard/conversation?character=maya">
                <button className="px-6 py-3 rounded-xl bg-white text-primary font-bold text-sm shadow-lg">
                  Start Practice
                </button>
              </Link>
           </div>
           <div className="absolute -right-4 -bottom-4 text-[120px] opacity-10 rotate-12">👩🏾‍🏫</div>
        </div>
      </section>

      {/* Roleplay Categories */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-primary tracking-widest uppercase">Roleplay Categories</h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
           {categories.map((cat) => (
             <div key={cat.id} className="flex-shrink-0 w-48 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
                <div className={`w-12 h-12 rounded-2xl ${cat.color} flex items-center justify-center`}>
                   <cat.icon className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-sm font-bold truncate">{cat.name}</div>
                   <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{cat.count} Scenarios</span>
                      <span className="text-[10px] font-bold text-emerald-500">{cat.users} Live</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* Practice with AI Grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-black text-primary tracking-widest uppercase">Practice with AI</h2>
        <div className="grid grid-cols-2 gap-4">
           {characters.map((char) => (
             <Link key={char.id} href={char.pro ? "/dashboard/paywall" : `/dashboard/conversation?character=${char.id}`}>
               <motion.div
                 whileHover={{ scale: 1.02 }}
                 className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-sm group"
               >
                  <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                     {char.image}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
                  
                  {char.pro && (
                    <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-amber-400 text-white flex items-center gap-1 shadow-lg">
                       <Diamond className="w-3 h-3 fill-white" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Pro</span>
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                     <div className="text-sm font-black text-white">{char.name}</div>
                     <div className="text-[10px] font-medium text-white/70">{char.role}</div>
                  </div>
               </motion.div>
             </Link>
           ))}
        </div>
      </section>
    </div>
  );
}
