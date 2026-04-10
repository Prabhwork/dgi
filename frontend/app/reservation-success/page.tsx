"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Calendar, Clock, Users, ArrowLeft, Download, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

function ReservationSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const bookingId = searchParams.get('id');
    const guests = searchParams.get('guests');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const name = searchParams.get('name');

    return (
        <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Aesthetics */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#E0354615,transparent_50%)]" />
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-xl w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 md:p-14 text-center shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative z-10"
            >
                {/* Success Icon */}
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                    className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                >
                    <CheckCircle2 size={48} className="text-white" />
                </motion.div>

                <div className="space-y-4 mb-12">
                    <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                        Booking<br/>
                        <span className="text-emerald-500">Confirmed!</span>
                    </h1>
                    <p className="text-white/60 font-medium text-lg italic">Get ready for an exceptional dining experience.</p>
                </div>

                {/* Booking ID Banner */}
                <div className="bg-[#E03546]/10 border border-[#E03546]/20 p-8 rounded-3xl mb-12 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#E03546] mb-3 opacity-60">Reservation Ticket</p>
                    <h2 className="text-5xl font-black italic text-white tracking-widest">{bookingId}</h2>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4 mb-12">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                        <Users size={18} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Guests</p>
                        <p className="text-sm font-bold">{guests} People</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                        <Calendar size={18} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Date</p>
                        <p className="text-sm font-bold">{date}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                        <Clock size={18} className="mx-auto mb-2 text-emerald-500 opacity-60" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Time</p>
                        <p className="text-sm font-bold">{time}</p>
                    </div>
                </div>

                {/* Footer Message */}
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em] mb-12 italic">
                    A confirmation SMS has been sent to {name}
                </p>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        onClick={() => router.push('/')}
                        variant="outline" 
                        className="bg-transparent border-white/10 hover:bg-white/5 py-7 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group shadow-xl"
                    >
                        <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Home Page
                    </Button>
                    <Button 
                        className="bg-[#E03546] hover:bg-[#c32d3d] text-white py-7 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-[0_20px_40px_rgba(224,53,70,0.3)] active:scale-95 transition-all"
                    >
                        <Download size={16} /> Download Slip
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}

export default function ReservationSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#E03546] border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <ReservationSuccessContent />
        </Suspense>
    );
}
