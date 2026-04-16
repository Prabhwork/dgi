"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Target, ShieldCheck, Rocket, ChevronRight, Briefcase, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen pt-20 md:pt-28 pb-24 font-poppins">
      {/* Hero Section - Refined */}
      <section className="relative pt-4 md:pt-8 pb-8 px-4 overflow-hidden">
        {/* Background decorative element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-sky-100/30 rounded-full blur-[120px] -z-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-sky-100 text-sky-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-sm"
          >
            Digital Bharat Initiative
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-slate-900 mb-8 italic uppercase tracking-tighter leading-none"
          >
            Our <span className="text-sky-600">Mission.</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium italic leading-relaxed max-w-2xl mx-auto">
            DBI Invest Connect is building the most trusted bridge between India's enterprise ecosystem and strategic global capital.
          </p>
        </div>
      </section>

      {/* Core Values - Premium Design */}
      <section className="pt-8 pb-10 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: Users, 
              title: "Community", 
              desc: "Building a verified network where every entrepreneur finds the capital they deserve.",
              color: "from-blue-500 to-sky-400"
            },
            { 
              icon: Target, 
              title: "Strategy", 
              desc: "Focusing on sustainable business models that drive India's long-term economic vision.",
              color: "from-sky-600 to-blue-500"
            },
            { 
              icon: ShieldCheck, 
              title: "Trust", 
              desc: "Ensuring every profile is rigorously vetted for total transparency and security.",
              color: "from-slate-900 to-slate-800"
            }
          ].map((item, i) => (
            <Link key={i} href={`/${item.title.toLowerCase()}`} className="block focus:outline-none">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="p-12 rounded-[4rem] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-sky-100 transition-all group overflow-hidden relative h-full cursor-pointer"
                >
                   <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-full blur-3xl transition-opacity duration-500`} />
                   
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-10 shadow-lg shadow-sky-100 group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon className="text-white" size={28} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter leading-none">{item.title}</h3>
                  <p className="text-slate-500 font-medium italic leading-relaxed">{item.desc}</p>
                </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Story Section - Normal & Clean */}
      <section className="pt-6 pb-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <div className="flex-1">
              <motion.div
                 initial={{ opacity: 0 }}
                 whileInView={{ opacity: 1 }}
                 className="inline-flex items-center gap-2 text-sky-600 text-[10px] font-black uppercase tracking-[0.4em] mb-8"
              >
                 Our Heritage
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black mb-10 text-slate-900 italic uppercase tracking-tighter leading-none pr-4">The <span className="text-sky-600">DBI Story.</span></h2>
              <div className="space-y-8 text-slate-500 text-lg font-medium italic leading-relaxed">
                <p>
                  Started as part of the Digital Bharat Initiative, DBI Invest Connect was born from a simple realization: India has the talent, the markets, and the ambition, but often lacks the direct, verified connection to capital.
                </p>
                <p>
                  We've built this platform to cut through the noise, providing a professional space where serious investors and high-potential businesses can meet, chat, and close deals in real-time.
                </p>
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-4">
              {[
                { icon: Briefcase, label: "100% Verified" },
                { icon: TrendingUp, label: "Sector Agnostic" },
                { icon: Rocket, label: "India Focused" },
                { icon: Target, label: "Direct Access" }
              ].map((item, i) => (
                <div key={i} className="p-8 rounded-[2.5rem] bg-sky-50 border border-sky-100 flex flex-col items-center text-center hover:bg-white hover:shadow-xl transition-all">
                  <item.icon size={24} className="text-sky-600 mb-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
