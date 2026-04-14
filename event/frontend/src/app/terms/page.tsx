"use client";

import React from "react";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <section className="py-24 px-4 bg-sky-50">
        <div className="max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-12 italic uppercase tracking-tighter"
          >
            Terms & <span className="text-sky-600">Conditions</span>
          </motion.h1>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium italic leading-relaxed">
            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">1. Acceptance of Terms</h2>
              <p>By accessing or using DBI Invest Connect, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, do not use the service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">2. User Accounts</h2>
              <p>Users must provide accurate, complete, and current information. Businesses must be legally registered in India. Investors must meet certain local or international accreditation standards where applicable.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">3. No Financial Advice</h2>
              <p>The platform is a networking tool only. DBI Invest Connect does not provide financial, investment, or legal advice. Users are responsible for their own due diligence before entering into any agreements.</p>
            </section>

            <section>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 italic">4. Conduct</h2>
              <p>Users must interact professionally. Any harassment, fraud, or spamming will result in immediate account termination. Verification profiles are subject to review and can be suspended if inconsistencies are found.</p>
            </section>

            <p className="pt-12 text-sm text-slate-400">Last updated: April 14, 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
}
