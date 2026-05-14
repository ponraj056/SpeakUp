"use client";

import { motion } from "framer-motion";
import { Check, X, Diamond, Zap, Shield, Star, Crown } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

const features = [
  { name: "Human calls", free: true, pro: true },
  { name: "Debate with Human Partner", free: false, pro: true },
  { name: "Call with serious learners only", free: false, pro: true },
  { name: "Unlimited AI calls", free: false, pro: true },
  { name: "Feedback after calls", free: false, pro: true },
  { name: "Targeted Exercises", free: false, pro: true },
  { name: "Access to Courses", free: false, pro: true },
  { name: "Progress analytics", free: false, pro: true },
  { name: "Offline mode", free: false, pro: true },
];

export default function PaywallPage() {
  const handleSubscribe = async (plan: 'monthly' | 'annual') => {
    try {
      const { data } = await api.createSubscription(plan);
      if (data.payment_link) {
        window.location.href = data.payment_link;
      }
    } catch (err) {
      console.error("Subscription failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ── HERO ── */}
      <section className="pt-16 pb-12 px-6 text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto shadow-2xl shadow-orange-200">
           <Diamond className="w-10 h-10 text-white fill-white" />
        </div>
        <div className="space-y-2">
           <h1 className="text-3xl font-black italic text-slate-900">Become a Pro Member</h1>
           <p className="text-primary font-black uppercase tracking-widest text-xs">Improve 3x faster with SpeakUp Pro</p>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="px-6 mb-12">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-slate-50">
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Feature</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Free</th>
                    <th className="p-5 text-[10px] font-black text-primary uppercase tracking-widest text-center">Pro</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                 {features.map((f) => (
                    <tr key={f.name}>
                       <td className="p-5 text-sm font-bold text-slate-700">{f.name}</td>
                       <td className="p-5 text-center">
                          {f.free ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <X className="w-4 h-4 text-slate-200 mx-auto" />}
                       </td>
                       <td className="p-5 text-center bg-primary/5">
                          <Check className="w-5 h-5 text-primary mx-auto stroke-[3px]" />
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-6 space-y-4">
         {/* Monthly */}
         <button 
           onClick={() => handleSubscribe('monthly')}
           className="w-full p-6 rounded-3xl bg-white border-2 border-slate-100 flex items-center justify-between group hover:border-primary transition-all text-left"
         >
            <div className="space-y-1">
               <div className="text-lg font-black italic">1 Month</div>
               <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-slate-900">₹49</span>
                  <span className="text-sm font-bold text-slate-300 line-through">₹799</span>
               </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center text-slate-300">
               <Zap className="w-6 h-6" />
            </div>
         </button>

         {/* Annual */}
         <button 
           onClick={() => handleSubscribe('annual')}
           className="w-full p-6 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 border-4 border-primary/20 flex items-center justify-between relative shadow-xl shadow-primary/30 text-left text-white"
         >
            <div className="absolute -top-3 right-8 px-3 py-1 rounded-full bg-amber-400 text-[10px] font-black uppercase tracking-widest text-amber-900 shadow-lg">
               Best Value
            </div>
            <div className="space-y-1">
               <div className="text-lg font-black italic">12 Months</div>
               <div className="flex items-center gap-2">
                  <span className="text-2xl font-black">₹499</span>
                  <span className="text-sm font-bold text-white/50 line-through">₹3700</span>
               </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
               <Crown className="w-6 h-6 fill-white" />
            </div>
         </button>

         <button className="w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-lg shadow-xl mt-4">
            Unlock Unlimited Access
         </button>

         <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest pt-4">
            Cancel anytime. Offline content sync starts immediately.
         </p>
      </section>
    </div>
  );
}
