"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-24 px-4 bg-sky-50">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-12 italic uppercase tracking-tighter"
          >
            Privacy <span className="text-sky-600">Policy</span>
          </motion.h1>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium italic leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">1. Information Collection</h2>
              <p>We collect information you provide directly to us when you register for an account, apply as a business or investor, or contact us for support. This includes your name, email, company details, and GST/Tax information where applicable.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">2. Use of Information</h2>
              <p>We use the information we collect to facilitate connections between businesses and investors, personalize your experience, and improve our platform security through verification processes.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">3. Data Sharing</h2>
              <p>Your business profile information will be visible to verified investors on the platform. We do not sell your personal data to third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">4. Security</h2>
              <p>We implement industry-standard security measures to protect your data, including encryption and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <p className="pt-12 text-sm text-slate-400">Last updated: April 14, 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
}
