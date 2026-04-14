"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, Compass, ShieldCheck, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        subject: 'Business Partnership',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/event/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to send message');

            setShowPopup(true);
            setFormData({ fullName: '', email: '', subject: 'Business Partnership', message: '' });
        } catch (err: any) {
            setStatus({ type: 'error', message: err.message || 'Something went wrong.' });
        } finally {
            setIsSubmitting(false);
        }
    };

  return (
    <div className="bg-[#f8fafc] min-h-screen pt-32 pb-24 font-poppins">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-sky-600 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
          >
            Connect with DBI
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-slate-900 mb-6 italic uppercase tracking-tighter leading-none"
          >
            Let's <span className="text-sky-600">Connect.</span>
          </motion.h1>
          <p className="text-slate-500 font-medium italic text-lg max-w-2xl mx-auto">Whether you're looking for funding, deal flow, or just have a question, our team is ready to assist you.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <ContactInfoCard 
              icon={Mail} 
              title="Email Us" 
              value="support@dbiconnect.in" 
              delay={0.1}
            />
            <ContactInfoCard 
              icon={Phone} 
              title="Call Us" 
              value="97119 33958" 
              delay={0.2}
            />
            <ContactInfoCard 
              icon={MapPin} 
              title="Office" 
              value="Plot no 142, Block B, Rangpuri, Mahipalpur, New Delhi - 110037" 
              delay={0.3}
            />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden"
            >
                <div className="relative z-10">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4">Support Hours</h3>
                    <p className="text-slate-400 font-bold italic mb-6">We're available to assist you during business hours.</p>
                    <div className="space-y-2">
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-sm font-bold opacity-60">Mon - Sat</span>
                            <span className="text-sm font-black italic">10:00 AM - 7:00 PM</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800 pb-2">
                            <span className="text-sm font-bold opacity-60">Sunday</span>
                            <span className="text-sm font-black italic text-red-500 uppercase">OFF</span>
                        </div>
                    </div>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-10">
                    <Compass size={200} />
                </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 bg-white p-10 md:p-16 rounded-[4rem] border border-slate-100 shadow-2xl shadow-sky-100/30"
          >
            <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-10 flex items-center gap-4">
                <MessageSquare className="text-sky-600" size={32} /> Send a Message
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-sky-600 transition-colors">FullName</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sky-500 font-bold outline-none transition-all" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2 group">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-sky-600 transition-colors">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sky-500 font-bold outline-none transition-all" 
                    placeholder="john@company.com" 
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-sky-600 transition-colors">Subject</label>
                <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-sky-500 font-bold outline-none appearance-none transition-all"
                >
                    <option>Business Partnership</option>
                    <option>Investor Inquiry</option>
                    <option>Technical Support</option>
                    <option>Other</option>
                </select>
              </div>

               <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 group-focus-within:text-sky-600 transition-colors">Your Message</label>
                <textarea 
                    required 
                    rows={5} 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] px-8 py-6 focus:ring-2 focus:ring-sky-500 font-bold outline-none resize-none transition-all" 
                    placeholder="Tell us how we can help..." 
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-sky-600 text-white font-black text-xl py-6 rounded-full shadow-2xl shadow-sky-200 flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 group disabled:opacity-50"
              >
                {isSubmitting ? "SENDING..." : "SEND MESSAGE"} <Send className="group-hover:translate-x-2 transition-transform" size={24} />
              </button>

              {status && status.type === 'error' && (
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-6 border border-red-100 bg-red-50 rounded-3xl flex items-center gap-4 font-black italic text-red-700"
                >
                    <X size={24} />
                    {status.message}
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>

      {/* Success Popup Modal */}
      <AnimatePresence>
        {showPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPopup(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-12 rounded-[4rem] shadow-2xl max-w-md w-full text-center border border-sky-100"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-100">
                <ShieldCheck className="text-white" size={40} />
              </div>
              <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-4">Message Sent!</h4>
              <p className="text-slate-500 font-bold italic mb-8">Thank you for reaching out. Our team will review your message and contact you within 24 business hours.</p>
              <button 
                onClick={() => setShowPopup(false)}
                className="w-full bg-slate-900 text-white font-black py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
              >
                CLOSE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactInfoCard({ icon: Icon, title, value, delay }: any) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-center gap-6 p-8 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-sky-100/20 group hover:border-sky-600 transition-all cursor-pointer"
        >
            <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center group-hover:bg-sky-600 transition-all shrink-0">
                <Icon className="text-sky-600 group-hover:text-white transition-all underline-offset-4" size={28} />
            </div>
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{title}</h4>
                <p className="text-lg font-black italic uppercase tracking-tighter text-slate-900 leading-tight">{value}</p>
            </div>
        </motion.div>
    );
}
