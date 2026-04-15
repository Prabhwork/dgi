"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, MessageSquare, Send, CheckCircle2 } from "lucide-react";

const INTEREST_OPTIONS = ["Delegate", "Exhibitor", "Sponsorship", "Media Partner", "Association Partner", "Investor"];
const INDUSTRIES = [
  "Technology", "Finance & Banking", "Real Estate", "Healthcare", "Manufacturing",
  "Retail & E-commerce", "Agriculture & AgriTech", "Education & EdTech", "Energy & CleanTech",
  "Logistics & Supply Chain", "Media & Entertainment", "Food & Beverage", "Travel & Hospitality",
  "Automotive", "Legal & Consulting", "Other",
];

function EnquiryModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", designation: "",
    industry: "", interest: "", remarks: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 30 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white rounded-t-[2rem] px-8 pt-8 pb-4 border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X size={18} className="text-slate-600" />
          </button>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-[0.2em] mb-3">
            <MessageSquare size={10} /> Enquiry
          </div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
            Enquire <span className="text-sky-600">Now.</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-medium italic">BharatNivesh Summit 2026 — Get in touch with our team</p>
        </div>

        <div className="px-8 py-6">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-sky-50 flex items-center justify-center mb-6">
                <CheckCircle2 size={44} className="text-sky-600" />
              </div>
              <h3 className="text-2xl font-black italic uppercase text-slate-900 mb-3">Thank You!</h3>
              <p className="text-slate-500 font-medium italic max-w-sm">
                Your enquiry has been received. Our team will get back to you within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="mt-8 bg-sky-600 text-white font-black text-sm px-8 py-3 rounded-full hover:scale-105 transition-all"
              >
                CLOSE
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input
                  name="name" value={form.name} onChange={handleChange} required
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                />
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Email <span className="text-red-400">*</span></label>
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange} required
                    placeholder="Email Address"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Phone / Mobile <span className="text-red-400">*</span></label>
                  <input
                    name="phone" type="tel" value={form.phone} onChange={handleChange} required
                    placeholder="Mobile Number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                </div>
              </div>

              {/* Company + Designation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Company Name <span className="text-red-400">*</span></label>
                  <input
                    name="company" value={form.company} onChange={handleChange} required
                    placeholder="Company Name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Designation <span className="text-red-400">*</span></label>
                  <input
                    name="designation" value={form.designation} onChange={handleChange} required
                    placeholder="Your Designation"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
                  />
                </div>
              </div>

              {/* Interested In */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">What Are You Interested In? <span className="text-red-400">*</span></label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map(opt => (
                    <button
                      type="button" key={opt}
                      onClick={() => setForm({ ...form, interest: opt })}
                      className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider border transition-all ${form.interest === opt ? 'bg-sky-600 text-white border-sky-600 shadow-lg shadow-sky-100' : 'border-slate-200 text-slate-500 hover:border-sky-300 hover:text-sky-600'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Which Industry You Belong To? <span className="text-red-400">*</span></label>
                <select
                  name="industry" value={form.industry} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all bg-white"
                >
                  <option value="">— Select Industry —</option>
                  {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Remarks <span className="text-slate-300 normal-case font-medium tracking-normal">(optional)</span></label>
                <textarea
                  name="remarks" value={form.remarks} onChange={handleChange} rows={3}
                  placeholder="Any specific message or requirement..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading || !form.interest}
                className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white font-black text-base py-4 rounded-2xl shadow-xl shadow-sky-100 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</span>
                ) : (
                  <><Send size={16} /> SUBMIT ENQUIRY</>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Event Overview", href: "/overview" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const categories = [
    "Food & Beverage", "Travel & Tourism", "Real Estate", "Technology", "Health & Wellness", "Education", "E-commerce", "Finance",
    "Automotive", "Fashion & Apparel", "Entertainment", "Logistics", "Agriculture", "Construction", "IT Services", "Media & PR",
    "Energy & Power", "Retail", "Software Dev", "Hardware", "Hospitality", "Consulting", "Manufacturing", "Import/Export",
    "Telecom", "Legal Services", "Marketing", "Architecture", "Design", "Non-Profit", "HR & Staffing", "Event Management",
    "Photography", "Beauty & Care", "Fitness", "Aviation", "Printing", "Transport", "Environment", "Sports",
    "Gaming", "Art & Crafts", "Web Development", "SEO Services", "AI & Robotics", "VR/AR", "Blockchain", "CyberSecurity",
    "Cloud Computing", "Biotechnology", "SpaceTech", "Defense & Aerospace", "CleanTech", "EdTech", "FinTech", "HealthTech",
    "AgriTech", "PropTech", "LegalTech", "InsurTech", "Data Analytics", "Drones", "IoT", "Nanotechnology"
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] px-4 md:px-8 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-sm">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer z-[101]">
          <div className="relative">
            <div className="absolute -inset-1 bg-sky-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
            <img 
              src="/assets/DLOGO1.png" 
              alt="Digital Book of India" 
              className="relative h-12 md:h-16 w-auto object-contain p-1 transition-transform group-hover:scale-105" 
            />
          </div>
          <div className="flex flex-col">
            <span className="text-slate-900 text-[10px] md:text-xs font-black tracking-[0.2em] uppercase leading-none mb-0.5">Digital Book</span>
            <span className="text-sky-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none">Of India</span>
          </div>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8 mr-auto ml-12">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className="text-slate-600 hover:text-sky-600 font-bold transition-colors text-sm uppercase tracking-wider">
              {link.name}
            </Link>
          ))}
          
          {/* Mega Menu Trigger */}
          <div 
            className="relative"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <button className="flex items-center gap-1 text-slate-600 hover:text-sky-600 font-bold transition-colors text-sm uppercase tracking-wider py-8 -my-8">
              Key Topics <ChevronDown size={16} className={`transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isMegaMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-[80px] -left-64 lg:-left-96 w-[1000px] bg-white rounded-3xl shadow-2xl shadow-sky-900/10 border border-slate-100 p-8 mt-2 cursor-default pointer-events-auto"
                >
                  <div className="grid grid-cols-8 gap-x-2 gap-y-3">
                    {categories.map((cat, idx) => {
                      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return (
                        <Link 
                          href={`/topics/${slug}`} 
                          key={idx}
                          className="text-[10px] font-bold text-slate-500 hover:text-sky-600 hover:bg-sky-50 px-2 py-2 rounded-lg transition-colors truncate text-center"
                          title={cat}
                          onClick={() => setIsMegaMenuOpen(false)}
                        >
                          {cat}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Enquiry Button - Desktop */}
          <button
            onClick={() => setIsEnquiryOpen(true)}
            className="hidden sm:flex items-center gap-2 text-sky-600 border border-sky-200 hover:bg-sky-50 font-black text-sm px-4 py-2 rounded-full transition-all hover:scale-105 uppercase tracking-wide"
          >
            <MessageSquare size={14} />
            Enquiry
          </button>

          <div className="hidden sm:flex items-center gap-2 md:gap-3">
            <Link href="/apply/investor" className="text-slate-700 hover:text-sky-600 text-sm md:text-base font-bold px-4 py-2 hover:bg-sky-50 rounded-full transition-all tracking-wide">
              Investor
            </Link>
            <Link href="/apply/business" className="bg-sky-600 hover:bg-sky-500 text-white font-black text-sm md:text-base px-6 py-2.5 md:px-8 md:py-2.5 rounded-full shadow-lg shadow-sky-200 transition-all hover:scale-105 active:scale-95 border border-sky-400/30 tracking-wide uppercase">
              Business
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors z-[101]"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-white pt-24 px-6 lg:hidden flex flex-col justify-between pb-12 overflow-y-auto"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-black italic uppercase tracking-tighter text-slate-900 border-b border-slate-50 pb-4"
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="mt-4">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-sky-600 mb-4">Key Topics</h3>
                <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-300 scrollbar-track-slate-100 rounded-lg border border-slate-100 p-4 bg-slate-50">
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat, idx) => {
                      const slug = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      return (
                        <Link
                          key={idx}
                          href={`/topics/${slug}`}
                          onClick={() => setIsOpen(false)}
                          className="text-xs font-bold text-slate-600 hover:text-sky-600 hover:bg-sky-100 px-3 py-2 rounded-lg transition-all"
                        >
                          {cat}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-8">
              {/* Enquiry - Mobile */}
              <button
                onClick={() => { setIsOpen(false); setIsEnquiryOpen(true); }}
                className="w-full text-center py-4 rounded-2xl border-2 border-sky-200 text-sky-600 font-black italic uppercase tracking-tighter flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} /> Enquire Now
              </button>
              <Link 
                href="/apply/investor" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-4 rounded-2xl border-2 border-slate-100 font-black italic text-slate-900 uppercase tracking-tighter"
              >
                Investor Registration
              </Link>
              <Link 
                href="/apply/business" 
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-4 rounded-2xl bg-sky-600 text-white font-black italic uppercase tracking-tighter shadow-xl shadow-sky-100"
              >
                Business Registration
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enquiry Modal */}
      <AnimatePresence>
        {isEnquiryOpen && <EnquiryModal onClose={() => setIsEnquiryOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
