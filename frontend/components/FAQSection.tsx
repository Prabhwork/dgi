"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useTheme } from "@/components/ThemeProvider";

const faqs = [
    { q: "What is Digital Book of India?", a: "Digital Book of India is a comprehensive digital directory that connects local businesses with customers across India through interactive maps and detailed listings." },
    { q: "How do I list my business on Digital Book of India?", a: "Simply sign up, fill in your business details, and your listing will be live on our platform within 24 hours." },
    { q: "Is there a cost to list my business?", a: "Basic listings are free. Premium features and enhanced visibility options are available through our affordable plans." },
    { q: "How can customers find my business?", a: "Customers can discover your business through search, map exploration, category browsing, and personalized recommendations." },
    { q: "How often is the information updated?", a: "Business information is updated in real-time by business owners. Our team also performs periodic verification." },
    { q: "Can I advertise on Digital Book of India?", a: "Yes! We offer various advertising options to boost your business visibility across our platform." },
    { q: "What types of businesses can list?", a: "Any legitimate business can list on Digital Book of India — from restaurants and salons to tech companies and logistics services." },
    { q: "How can I contact support if I have issues?", a: "You can reach our support team through the Contact page, email, or our 24/7 chat support." },
    { q: "Can DBI Insights help identify new businesses?", a: "Yes, DBI Insights provides analytics on emerging businesses and market trends in your location." },
    { q: "Is my business data secure on your platform?", a: "Absolutely. We use industry-standard encryption and security protocols to ensure your business and customer data remains private and protected." },
];

export default function FAQSection() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-100px" });
    const { theme } = useTheme();

    const left = faqs.slice(0, 5);
    const right = faqs.slice(5);

    return (
        <section className="pt-0 pb-20 relative z-10 mt-4" id="faq" ref={ref}>
            <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
                    <span className={`rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] relative overflow-hidden backdrop-blur-2xl border border-solid transition-all duration-300 ${theme === 'light'
                        ? 'bg-white/80 border-blue-600 text-primary shadow-none'
                        : 'bg-white/[0.01] border-white/20 text-primary shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
                        }`}>
                        Popular FAQs
                    </span>
                    <h2 className="text-4xl sm:text-6xl font-display font-black text-foreground mt-4 tracking-tight">
                        Frequently Asked<br />
                        <span className="gradient-text">Questions</span>
                    </h2>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {[left, right].map((group, gi) => (
                        <Accordion key={gi} type="single" collapsible className="space-y-4">
                            {group.map((faq, i) => (
                                <AccordionItem key={i} value={`${gi}-${i}`} className={`backdrop-blur-[2px] border-[1px] rounded-xl px-6 transition-all duration-300 ${theme === 'light'
                                    ? 'bg-white/40 border-slate-200 shadow-none hover:border-blue-600/30'
                                    : 'bg-white/[0.01] border-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:border-white/40'
                                    }`}>
                                    <AccordionTrigger className="text-foreground text-sm sm:text-base font-semibold hover:no-underline py-5">
                                        {faq.q}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                                        {faq.a}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ))}
                </div>
            </div>
        </section>
    );
}
