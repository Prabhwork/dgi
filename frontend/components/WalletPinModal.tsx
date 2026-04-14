"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Loader2, AlertCircle, Mail, KeyRound, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const MAIN_API = process.env.NEXT_PUBLIC_API_URL;

interface WalletPinModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (pin: string) => Promise<void>;
    isVerifying: boolean;
}

type ModalMode = "verify" | "forgot" | "otp" | "reset";

export default function WalletPinModal({ isOpen, onClose, onVerify, isVerifying }: WalletPinModalProps) {
    const [pin, setPin] = useState("");
    const [mode, setMode] = useState<ModalMode>("verify");
    const [otp, setOtp] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length < 4) return;
        await onVerify(pin);
    };

    const handleForgotPin = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("userToken");
        try {
            const res = await fetch(`${MAIN_API}/wallet/pin/forgot`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                toast.success("OTP sent to your email");
                setMode("otp");
            } else {
                toast.error(data.error || "Failed to send OTP");
            }
        } catch (err) {
            toast.error("Error connecting to server");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin !== confirmPin) {
            toast.error("PINs do not match");
            return;
        }

        setIsLoading(true);
        const token = localStorage.getItem("userToken");
        try {
            const res = await fetch(`${MAIN_API}/wallet/pin/reset`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ otp, newPin })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("PIN reset successful! You can now pay.");
                setMode("verify");
                setPin(""); // Clear old pin state
                setOtp("");
                setNewPin("");
                setConfirmPin("");
            } else {
                toast.error(data.error || "Reset failed");
            }
        } catch (err) {
            toast.error("Error connecting to server");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const renderVerify = () => (
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Enter 4-Digit Wallet PIN</p>
                <Input 
                    type="password"
                    maxLength={4}
                    value={pin}
                    autoFocus
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="bg-white/5 border-white/10 text-center text-3xl tracking-[1em] font-black py-8 rounded-2xl focus:border-blue-500/50 outline-none"
                />
            </div>

            <div className="flex flex-col gap-4">
                <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[9px] font-bold text-amber-500/70 leading-relaxed uppercase italic">
                        This PIN was set by you during wallet setup. It is required to authorize this debit.
                    </p>
                </div>
                
                <button 
                    type="button" 
                    onClick={() => setMode("forgot")}
                    className="text-[9px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors text-center"
                >
                    Forgot your PIN?
                </button>
            </div>

            <Button 
                type="submit"
                disabled={isVerifying || pin.length < 4}
                className="w-full py-7 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all"
            >
                {isVerifying ? <Loader2 className="animate-spin" /> : "Authorize & Pay"}
            </Button>
        </form>
    );

    const renderForgot = () => (
        <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
                <Mail className="text-blue-400" size={24} />
            </div>
            <div className="space-y-2">
                <h4 className="text-base font-black uppercase italic">PIN Recovery</h4>
                <p className="text-[10px] text-white/50 leading-relaxed px-4">
                    We will send a 6-digit verification code to your registered email address to reset your PIN.
                </p>
            </div>
            
            <div className="pt-4 space-y-3">
                <Button 
                    onClick={handleForgotPin}
                    disabled={isLoading}
                    className="w-full py-7 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px]"
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Send Verification OTP"}
                </Button>
                <button 
                    onClick={() => setMode("verify")}
                    className="text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-white pt-2"
                >
                    Back to PIN
                </button>
            </div>
        </div>
    );

    const renderOtp = () => (
        <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Enter 6-Digit Verification Code</p>
                <Input 
                    maxLength={6}
                    value={otp}
                    autoFocus
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="bg-white/5 border-white/10 text-center text-2xl tracking-[0.5em] font-black py-8 rounded-2xl"
                />
            </div>
            
            <Button 
                onClick={() => setMode("reset")}
                disabled={otp.length < 6}
                className="w-full py-7 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px]"
            >
                Verify & Continue <ArrowRight className="ml-2" size={14} />
            </Button>
            <button 
                onClick={() => setMode("forgot")}
                className="w-full text-[9px] font-black uppercase tracking-widest text-white/30 text-center"
            >
                Resend OTP
            </button>
        </div>
    );

    const renderReset = () => (
        <form onSubmit={handleResetPin} className="p-8 space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">New 4-Digit PIN</p>
                    <Input 
                        type="password"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="bg-white/5 border-white/10 text-center text-2xl tracking-[1em] font-black py-7 rounded-2xl"
                    />
                </div>
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Confirm New PIN</p>
                    <Input 
                        type="password"
                        maxLength={4}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        className="bg-white/5 border-white/10 text-center text-2xl tracking-[1em] font-black py-7 rounded-2xl"
                    />
                </div>
            </div>

            <Button 
                type="submit"
                disabled={isLoading || newPin.length < 4 || newPin !== confirmPin}
                className="w-full py-7 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-[11px]"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : "Reset PIN & Pay"}
            </Button>
        </form>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-[#0f172a] border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl shadow-indigo-500/20"
                >
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                                {mode === "verify" ? <Lock className="text-blue-400" size={18} /> : <KeyRound className="text-emerald-400" size={18} />}
                            </div>
                            <h3 className="text-base font-black text-white italic uppercase tracking-wider">
                                {mode === "verify" ? "Wallet Security" : "PIN Recovery"}
                            </h3>
                        </div>
                        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                          <XIcon size={20} />
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            {mode === "verify" && renderVerify()}
                            {mode === "forgot" && renderForgot()}
                            {mode === "otp" && renderOtp()}
                            {mode === "reset" && renderReset()}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function XIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
