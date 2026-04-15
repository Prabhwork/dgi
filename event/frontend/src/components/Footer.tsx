"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail } from "lucide-react";

const CONTACTS = [
  {
    label: "Sponsor & Exhibitor Reach Out",
    name: "Ms. Kavitha Jayaraman",
    phone: "+91 7022250709",
    email: "kavitha@urdhvamanagement.com",
  },
  {
    label: "Speaker Acquisition Reach Out",
    name: "Ms. Shruti D S",
    phone: "+91 7338674799",
    email: "shruthi@urdhvamanagement.com",
  },
  {
    label: "Delegates Reach Out",
    name: "Ms. Poorvika K L",
    phone: "+91 7338674793",
    email: "poorvika@urdhvamanagement.com",
  },
  {
    label: "Media & Association Partner Reach Out",
    name: "Ms. Kavyashree M",
    phone: "+91 9606025446",
    email: "kavya@urdhvamanagement.com",
  },
];

export default function Footer() {
  return (
    <footer className="pt-12 md:pt-24 pb-8 md:pb-12 bg-[#020617] text-white border-t border-white/5 relative overflow-hidden">
      {/* Decorative Dots Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Top Row: Logo + Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <img src="/assets/DLOGO.png" alt="Digital Book of India" className="h-14 w-auto object-contain" />
              <div className="flex flex-col text-left">
                <span className="text-white text-xs font-black tracking-[0.2em] uppercase leading-none mb-0.5">Digital Book</span>
                <span className="text-sky-400 text-[10px] font-bold uppercase tracking-widest leading-none">Of India</span>
              </div>
            </Link>
            <p className="text-slate-400 max-w-sm mb-6 font-medium italic">
              Connecting India's verified business ecosystem with strategic investors. Empowering the next generation of Indian enterprise.
            </p>
          </div>
          
          <div>
            <h4 className="text-sky-400 font-black uppercase tracking-widest text-[10px] mb-4 md:mb-8">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/about" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">About Us</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Contact Us</Link></li>
              <li><Link href="/apply/business" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Register Business</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sky-400 font-black uppercase tracking-widest text-[10px] mb-4 md:mb-8">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-white/10 pt-12 mb-10">
          <h4 className="text-sky-400 font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-center">Get In Touch</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTACTS.map((c, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-sky-500/30 hover:bg-white/8 transition-all duration-300 group"
              >
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3 leading-relaxed">{c.label}</p>
                <p className="text-white font-black italic text-base mb-4 group-hover:text-sky-300 transition-colors">{c.name}</p>
                <div className="space-y-2.5">
                  <a
                    href={`tel:${c.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2.5 text-slate-300 hover:text-sky-400 transition-colors text-sm font-bold"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                      <Phone size={12} className="text-sky-400" />
                    </div>
                    {c.phone}
                  </a>
                  <a
                    href={`mailto:${c.email}`}
                    className="flex items-center gap-2.5 text-slate-300 hover:text-sky-400 transition-colors text-xs font-bold break-all"
                  >
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                      <Mail size={12} className="text-sky-400" />
                    </div>
                    {c.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} DBI Invest Connect • Digital Bharat Initiative
          </p>
        </div>
      </div>
    </footer>
  );
}
