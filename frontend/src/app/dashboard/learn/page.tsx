"use client";

import { motion } from "framer-motion";
import { Star, Lock, Play, BookOpen } from "lucide-react";
import Link from "next/link";

const units = [
  {
    id: 1,
    title: "Basic Greetings and Introductions",
    featuredLesson: {
      title: "Greetings",
      teacher: "Miss Maya",
      image: "👩🏾‍🏫",
    },
    topics: [
      { id: 1, title: "Introduction and Background", locked: true },
      { id: 2, title: "Discussing Education and Work", locked: true },
      { id: 3, title: "Talking About Your Family", locked: true },
      { id: 4, title: "Asking Questions", locked: true },
    ],
  },
];

export default function LearnPage() {
  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
           <BookOpen className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-100 border border-amber-200">
           <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
           <span className="text-xs font-black text-amber-600">125 XP</span>
        </div>
      </div>

      {units.map((unit) => (
        <div key={unit.id} className="space-y-6">
          <div className="space-y-1">
             <h2 className="text-[10px] font-black text-primary uppercase tracking-widest">Unit {unit.id}</h2>
             <h1 className="text-xl font-black italic leading-tight">{unit.title}</h1>
          </div>

          {/* Featured Lesson Card */}
          <div className="relative group">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="w-full rounded-[2rem] bg-white border border-slate-100 shadow-sm overflow-hidden"
            >
              <div className="h-40 bg-slate-100 flex items-center justify-center text-6xl">
                 {unit.featuredLesson.image}
              </div>
              <div className="p-6 flex items-center justify-between">
                 <div>
                    <h3 className="text-lg font-bold">{unit.featuredLesson.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Teacher: {unit.featuredLesson.teacher}</p>
                 </div>
                 <Link href="/dashboard/lessons/greetings">
                    <button className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2">
                       <Play className="w-4 h-4 fill-white" />
                       Start Now
                    </button>
                 </Link>
              </div>
            </motion.div>
          </div>

          {/* Lesson Topics List */}
          <div className="space-y-3">
             {unit.topics.map((topic) => (
                <div key={topic.id} className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center gap-4 opacity-70 grayscale">
                   <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-slate-300" />
                   </div>
                   <div className="flex-1">
                      <div className="text-sm font-bold">{topic.title}</div>
                      <div className="flex gap-1 mt-1">
                         <Star className="w-3 h-3 text-slate-200" />
                         <Star className="w-3 h-3 text-slate-200" />
                         <Star className="w-3 h-3 text-slate-200" />
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
}
